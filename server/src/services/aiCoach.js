// src/services/aiCoach.js
import OpenAI from "openai";
import pool from "../db/config.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Utilities ---------------------------------------------------------------

function assertEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to your .env");
  }
}

function safeTextFromResponse(resp) {
  // v6 Responses API convenience property first:
  if (resp?.output_text) return resp.output_text;
  // fallback to raw array structure:
  return resp?.output?.[0]?.content?.[0]?.text ?? "(No response)";
}

// --- Core: Generate AI turn --------------------------------------------------

export async function generateCoachResponse(sessionId, userId, userMessage) {
  assertEnv();
  console.log("Generating coach response for session:", sessionId, "user:", userId);

  try {
    // 1) Load session with question + persona
    const sessionResult = await pool.query(
      `SELECT 
         ps.*,
         q.question,
         q.category,
         q.context as question_context,
         q.difficulty,
         p.name as persona_name,
         p.specialty,
         p.communication_style,
         p.priorities,
         p.common_challenges,
         p.quote
       FROM practice_sessions ps
       JOIN questions q ON ps.question_id = q.id
       JOIN personas p ON ps.persona_id = p.id
       WHERE ps.id = $1 AND ps.user_id = $2`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      throw new Error("Session not found");
    }
    const session = sessionResult.rows[0];

    // 2) Conversation history
    const historyResult = await pool.query(
      `SELECT speaker, message, turn_number 
       FROM conversation_turns 
       WHERE session_id = $1 
       ORDER BY turn_number ASC`,
      [sessionId]
    );
    const conversationHistory = historyResult.rows;

    // 3) Prompts
    const systemPrompt = buildSystemPrompt(session);
    const messages = buildChatMessages(conversationHistory, userMessage); // [{role, content}]

    // 4) OpenAI v6 Responses API
    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_output_tokens: 1000,
    });

    const aiMessage = safeTextFromResponse(resp);

    // 5) Persist turns (user + ai)
    const currentTurn = conversationHistory.length;

    await pool.query(
      `INSERT INTO conversation_turns (session_id, turn_number, speaker, message)
       VALUES ($1, $2, 'user', $3)`,
      [sessionId, currentTurn + 1, userMessage]
    );

    await pool.query(
      `INSERT INTO conversation_turns (session_id, turn_number, speaker, message)
       VALUES ($1, $2, 'ai', $3)`,
      [sessionId, currentTurn + 2, aiMessage]
    );

    return {
      message: aiMessage,
      turnNumber: currentTurn + 2,
      conversationContinues: true,
    };

  } catch (error) {
    console.error("AI Coach error:", error);
    throw error;
  }
}

// --- Helper: System Prompt ---------------------------------------------------

function buildSystemPrompt(session) {
  const persona = {
    name: session.persona_name,
    specialty: session.specialty,
    communication_style: session.communication_style,
    priorities: session.priorities,
    common_challenges: session.common_challenges,
    quote: session.quote,
  };

  return `You are an AI coach helping Medical Science Liaisons (MSLs) practice difficult physician conversations. You are simulating ${persona.name}, a ${persona.specialty} specialist.

# Your Role
You are NOT here to give direct answers. Instead, you should:
1. Ask clarifying questions like a real physician would
2. Probe deeper into the MSL's understanding
3. Challenge assumptions
4. Make the MSL think critically

# The Question Being Practiced
"${session.question}"

Context: ${session.question_context}
Category: ${session.category}
Difficulty: ${session.difficulty}

# Persona Characteristics
${persona.quote}

Communication Style: ${JSON.stringify(persona.communication_style, null, 2)}
Priorities: ${JSON.stringify(persona.priorities, null, 2)}
Common Challenges: ${JSON.stringify(persona.common_challenges, null, 2)}

# Instructions

## Phase 1: Clarification (First 2-3 turns)
When the MSL first responds, DON'T give them the answer. Instead:
- Ask what specific aspect they want to address
- Probe their understanding
- Challenge vague responses

Examples:
- "Before I respond, help me understand - are you referring to [aspect A] or [aspect B]?"
- "When you say [X], what specifically do you mean?"
- "That's one consideration, but what about [related concern]?"

## Phase 2: Deeper Probing (Turns 3-5)
Once they've clarified:
- Challenge their response with follow-up concerns
- Bring up related physician priorities
- Ask "what if" scenarios

## Phase 3: Guidance (After 5+ turns)
Only after substantial back-and-forth, provide constructive feedback:
- Acknowledge what they did well
- Point out improvements
- Suggest alternative approaches

Stay in character as ${persona.name}. Be conversational, not robotic. Push back like a real physician. Make them work for it. Keep responses concise (2-4 sentences per turn).`;
}

// --- Helper: Build messages from DB transcript ------------------------------

function buildChatMessages(conversationHistory, newUserMessage) {
  const msgs = conversationHistory.map((turn) => ({
    role: turn.speaker === "user" ? "user" : "assistant",
    content: turn.message,
  }));

  msgs.push({ role: "user", content: newUserMessage });
  return msgs;
}

// --- Read-only: Get conversation transcript ---------------------------------

export async function getConversationSummary(sessionId, userId) {
  try {
    const result = await pool.query(
      `SELECT 
         ct.turn_number,
         ct.speaker,
         ct.message,
         ct.created_at
       FROM conversation_turns ct
       JOIN practice_sessions ps ON ct.session_id = ps.id
       WHERE ct.session_id = $1 AND ps.user_id = $2
       ORDER BY ct.turn_number ASC`,
      [sessionId, userId]
    );

    return {
      sessionId,
      turns: result.rows,
      totalTurns: result.rows.length,
    };

  } catch (error) {
    console.error("Get conversation summary error:", error);
    throw error;
  }
}

// --- Generate final feedback summary ----------------------------------------

export async function generateConversationFeedback(sessionId, userId) {
  assertEnv();

  try {
    const summary = await getConversationSummary(sessionId, userId);
    if (summary.turns.length === 0) {
      return { feedback: "No conversation to analyze yet." };
    }

    const transcript = summary.turns
      .map((turn) => `${turn.speaker.toUpperCase()}: ${turn.message}`)
      .join("\n\n");

    const sessionResult = await pool.query(
      `SELECT q.question, p.name as persona_name
       FROM practice_sessions ps
       JOIN questions q ON ps.question_id = q.id
       JOIN personas p ON ps.persona_id = p.id
       WHERE ps.id = $1 AND ps.user_id = $2`,
      [sessionId, userId]
    );

    const question = sessionResult.rows[0]?.question || "";
    const personaName = sessionResult.rows[0]?.persona_name || "";

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You are an expert MSL coach analyzing practice conversations. Provide constructive feedback.",
        },
        {
          role: "user",
          content: `Analyze this MSL practice conversation with ${personaName}.

Original Question: "${question}"

Conversation Transcript:
${transcript}

Provide feedback on:
1. What the MSL did well
2. What could be improved
3. Specific suggestions for next time
4. Overall effectiveness (rate 1-10)

Format as:

**Strengths:**
[bullet points]

**Areas for Improvement:**
[bullet points]

**Key Suggestions:**
[bullet points]

**Overall Score:** X/10
**Summary:** [1-2 sentences]`,
        },
      ],
      temperature: 0.7,
      max_output_tokens: 1500,
    });

    const feedback = safeTextFromResponse(resp);

    await pool.query(
      `UPDATE practice_sessions 
       SET analysis_insights = jsonb_build_object('ai_feedback', $1)
       WHERE id = $2 AND user_id = $3`,
      [feedback, sessionId, userId]
    );

    return { feedback };

  } catch (error) {
    console.error("Generate feedback error:", error);
    throw error;
  }
}

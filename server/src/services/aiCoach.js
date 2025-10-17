import OpenAI from "openai";
import pool from "../db/config.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function assertEnv() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to your .env");
  }
}

function safeTextFromResponse(resp) {
  if (resp?.output_text) return resp.output_text;

  return resp?.output?.[0]?.content?.[0]?.text ?? "(No response)";
}

export async function generateCoachResponse(sessionId, userId, userMessage) {
  assertEnv();
  try {
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

    const historyResult = await pool.query(
      `SELECT speaker, message, turn_number 
       FROM conversation_turns 
       WHERE session_id = $1 
       ORDER BY turn_number ASC`,
      [sessionId]
    );
    const conversationHistory = historyResult.rows;

    const systemPrompt = buildSystemPrompt(session);
    const messages = buildChatMessages(conversationHistory, userMessage);

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_output_tokens: 1000,
    });

    const aiMessage = safeTextFromResponse(resp);

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

function buildSystemPrompt(session) {
  const persona = {
    name: session.persona_name,
    specialty: session.specialty,
    communication_style: session.communication_style,
    priorities: session.priorities,
    common_challenges: session.common_challenges,
    quote: session.quote,
  };

  return `You are an AI coach helping Medical Science Liaisons (MSLs) practice difficult physician conversations. You are simulating ${
    persona.name
  }, a ${persona.specialty} specialist.

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

Stay in character as ${
    persona.name
  }. Be conversational, not robotic. Push back like a real physician. Make them work for it. Keep responses concise (2-4 sentences per turn).`;
}

function buildChatMessages(conversationHistory, newUserMessage) {
  const msgs = conversationHistory.map((turn) => ({
    role: turn.speaker === "user" ? "user" : "assistant",
    content: turn.message,
  }));

  msgs.push({ role: "user", content: newUserMessage });
  return msgs;
}

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

export async function generateConversationFeedback(sessionId, userId) {
  assertEnv();
  console.log("Generating feedback for session:", sessionId, "user:", userId);

  try {
    const sessionCheck = await pool.query(
      `SELECT completed_at FROM practice_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (sessionCheck.rows[0]?.completed_at) {
      console.log("Session already completed. Skipping feedback generation.");
      return { feedback: "This session has already been completed." };
    }
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
       WHERE ps.id = $1 AND ps.user_id = $2 `,
      [sessionId, userId]
    );

    const question = sessionResult.rows[0]?.question || "";
    const personaName = sessionResult.rows[0]?.persona_name || "";

const resp = await openai.responses.create({
  model: "gpt-4o-mini",
  temperature: 0.2,            // lower = more consistent rule-following
  max_output_tokens: 900,
  input: [
    {
      role: "system",
      content: [
        "You are an expert MSL communication coach.",
        "Speak to the user as 'you' (second-person). Never say 'the MSL'.",
        "CRITICAL RULES:",
        "1) FIRST: evaluate ONLY the user's most recent turn for clarity and relevance.",
        "2) IF the latest turn is gibberish/off-topic: output the template with:",
        "   - Strengths: 'None detected for this turn.'",
        "   - Areas for Improvement: call out that input is gibberish/off-topic.",
        "   - Key Suggestions: instruct how to restate clearly and address the question.",
        "   - Overall Score: 1/10",
        "   - Summary: directly tell the user their input was gibberish/off-topic.",
        "   Then STOP. Do not invent strengths.",
        "3) OTHERWISE (if not gibberish): evaluate normally.",
      ].join("\n")
    },
    // few-shot: gibberish example
    {
      role: "user",
      content: "asd asdflkjasd 123 !!!!"
    },
    {
      role: "assistant",
      content:
        "**Strengths:**\n- None detected for this turn.\n\n" +
        "**Areas for Improvement:**\n- Your input appears to be gibberish and not relevant to the question.\n\n" +
        "**Key Suggestions:**\n- Restate your response using clear language and directly address the physician’s question.\n- Include relevant data or access points.\n\n" +
        "**Overall Score:** 1/10  \n" +
        "**Summary:** Your last response reads as gibberish/off-topic. Please provide a clear, relevant reply."
    },
    // now your real task
    {
      role: "user",
      content: `Analyze this Medical Science Liaison (MSL) practice conversation between you (the MSL) and ${personaName}.

Original Question: "${question}"

Conversation Transcript:
${transcript}

Provide feedback addressing the MSL directly as 'you'. Include:

1. What you did well
2. What you could improve
3. Specific actionable suggestions for next time
4. Your overall effectiveness score (rate 1–10)
5. If the user's latest input is gibberish or off-topic, apply the CRITICAL RULES (score 1/10 and do not invent strengths).

Format the output exactly as:



**Areas for Improvement:**
[bullet points]

**Key Suggestions:**
[bullet points]

**Strengths:**
[bullet points]

**Overall Score:** X/10  
**Summary:** [1–2 concise sentences speaking directly to the user]
`
    }
  ]
});


    const feedback = safeTextFromResponse(resp);

    await pool.query(
      `UPDATE practice_sessions 
      SET analysis_insights = $1,
      completed_at = NOW()       
       WHERE id = $2 AND user_id = $3`,
      [feedback, sessionId, userId]
    );

    console.log("Feedback stored successfully.");

    return { feedback };
  } catch (error) {
    console.error("Generate feedback error:", error);
    throw error;
  }
}

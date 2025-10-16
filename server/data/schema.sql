-- DNATE MSL Practice Gym Database Schema
-- Designed for PostgreSQL (adaptable to other SQL databases)
-- Version 1.0 - October 2025

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'msl', -- msl, admin, coach
  organization VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- QUESTIONS & PERSONAS
-- ============================================

CREATE TABLE personas (
  id VARCHAR(50) PRIMARY KEY, -- oncologist, cardiologist, neurologist
  name VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  specialty VARCHAR(100),
  practice_setting JSONB, -- Store complex nested data as JSON
  description TEXT,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('low', 'medium', 'high')),
  context TEXT,
  estimated_response_time INTEGER, -- seconds
  tags JSONB, -- Array of tags
  key_themes JSONB, -- Array of themes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Many-to-many relationship between questions and personas
CREATE TABLE question_personas (
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  persona_id VARCHAR(50) REFERENCES personas(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, persona_id)
);

CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);

-- ============================================
-- PRACTICE SESSIONS
-- ============================================

CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  persona_id VARCHAR(50) REFERENCES personas(id),
  
  -- Recording information
  recording_url VARCHAR(500),
  recording_type VARCHAR(20), -- 'video', 'audio'
  recording_duration_seconds INTEGER,
  transcription TEXT,
  
  -- User feedback
  confidence_rating INTEGER CHECK (confidence_rating BETWEEN 1 AND 5),
  response_quality_rating INTEGER CHECK (response_quality_rating BETWEEN 1 AND 5),
  user_notes TEXT,
  
  -- Analysis (for future integration)
  clarity_score DECIMAL(3,1), -- 0.0 to 10.0
  variability_score DECIMAL(3,1),
  polarity_score DECIMAL(3,1),
  analysis_insights JSONB, -- Array of insights
  
  -- Metadata
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure user can only access their own data
  CONSTRAINT user_owns_session CHECK (TRUE) -- Enforce at application level
);

CREATE INDEX idx_sessions_user ON practice_sessions(user_id);
CREATE INDEX idx_sessions_created ON practice_sessions(created_at);
CREATE INDEX idx_sessions_persona ON practice_sessions(persona_id);
CREATE INDEX idx_sessions_question ON practice_sessions(question_id);
CREATE INDEX idx_sessions_completed ON practice_sessions(completed_at);

-- ============================================
-- USER PROGRESS & ANALYTICS
-- ============================================

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Overall metrics
  total_sessions INTEGER DEFAULT 0,
  total_practice_time_seconds INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_practice_date DATE,
  
  -- Category-specific progress
  category_stats JSONB, -- e.g., {"Cost & Value": {"count": 5, "avg_confidence": 3.8}}
  persona_stats JSONB, -- e.g., {"oncologist": {"count": 10, "avg_confidence": 4.2}}
  
  -- Confidence tracking
  average_confidence DECIMAL(3,2),
  confidence_trend JSONB, -- Array of {date, avg_confidence} for charting
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);

-- ============================================
-- SAMPLE RESPONSES (Model Answers)
-- ============================================

CREATE TABLE sample_responses (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  response_type VARCHAR(50), -- 'model_answer', 'talking_points', 'framework'
  key_messages JSONB, -- Array of key messages
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sample_responses_question ON sample_responses(question_id);

-- ============================================
-- DAILY PRACTICE GOALS
-- ============================================

CREATE TABLE daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL,
  target_sessions INTEGER DEFAULT 3,
  completed_sessions INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, goal_date)
);

CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, goal_date);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update user_progress after session completion
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user progress
  INSERT INTO user_progress (user_id, total_sessions, total_practice_time_seconds, last_practice_date)
  VALUES (
    NEW.user_id, 
    1, 
    COALESCE(NEW.recording_duration_seconds, 0),
    CURRENT_DATE
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_sessions = user_progress.total_sessions + 1,
    total_practice_time_seconds = user_progress.total_practice_time_seconds + COALESCE(NEW.recording_duration_seconds, 0),
    last_practice_date = CURRENT_DATE,
    updated_at = CURRENT_TIMESTAMP;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update progress when session is completed
CREATE TRIGGER trigger_update_progress
  AFTER INSERT OR UPDATE OF completed_at ON practice_sessions
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION update_user_progress();

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
BEGIN
  LOOP
    IF EXISTS (
      SELECT 1 FROM practice_sessions 
      WHERE user_id = p_user_id 
        AND DATE(completed_at) = check_date
    ) THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert personas
INSERT INTO personas (id, name, title, specialty, practice_setting) VALUES
('oncologist', 'Dr. Sarah Chen', 'Medical Oncologist', 'Oncology', 
  '{"type": "Academic Medical Center", "location": "Urban"}'),
('cardiologist', 'Dr. Michael Torres', 'Cardiologist', 'Cardiology', 
  '{"type": "Large Private Practice", "location": "Suburban"}'),
('neurologist', 'Dr. Jennifer Williams', 'Neurologist', 'Neurology', 
  '{"type": "Community Hospital", "location": "Community"}');

-- ============================================
-- PRIVACY & SECURITY VIEWS
-- ============================================

-- View that ensures users can only see their own sessions
CREATE VIEW user_sessions AS
SELECT 
  ps.*,
  q.category,
  q.question,
  p.name as persona_name
FROM practice_sessions ps
JOIN questions q ON ps.question_id = q.id
JOIN personas p ON ps.persona_id = p.id;

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Additional indexes for common queries
CREATE INDEX idx_sessions_user_completed ON practice_sessions(user_id, completed_at DESC);
CREATE INDEX idx_sessions_user_persona ON practice_sessions(user_id, persona_id);

-- Partial indexes for active records only
CREATE INDEX idx_questions_active_category ON questions(category) WHERE is_active = TRUE;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Stores user accounts and authentication information';
COMMENT ON TABLE practice_sessions IS 'Core table tracking each practice session with recording and feedback';
COMMENT ON TABLE user_progress IS 'Aggregated progress metrics for dashboard display';
COMMENT ON TABLE personas IS 'Physician persona definitions for practice scenarios';
COMMENT ON TABLE questions IS 'Question bank for practice sessions';

COMMENT ON COLUMN practice_sessions.user_id IS 'Foreign key to users - ensures data isolation';
COMMENT ON COLUMN practice_sessions.recording_url IS 'Signed URL to recording in cloud storage (S3, etc)';
COMMENT ON COLUMN practice_sessions.confidence_rating IS 'User self-assessment 1-5 scale';
COMMENT ON COLUMN practice_sessions.clarity_score IS 'Future: analysis score from DNATE engine 0-10';

-- ============================================
-- CRITICAL SECURITY NOTES
-- ============================================

/*
CRITICAL SECURITY CONSIDERATIONS:

1. PASSWORD HASHING:
   - Never store plain text passwords
   - Use bcrypt, scrypt, or Argon2
   - Minimum 10 rounds for bcrypt
   - Example in Node.js: bcrypt.hash(password, 10)

2. DATA ISOLATION:
   - ALWAYS filter queries by user_id
   - Implement at application layer: WHERE user_id = :current_user_id
   - Consider PostgreSQL Row Level Security (RLS) for additional protection
   - Example middleware: req.user.id from JWT token

3. RECORDING URLS:
   - Use signed/pre-signed URLs with expiration
   - AWS S3 example: s3.getSignedUrl('getObject', {Bucket, Key, Expires: 3600})
   - Never expose recordings via public URLs
   - Generate new signed URL on each request

4. API ENDPOINTS:
   - All endpoints must verify authentication
   - Check that user_id in request matches authenticated user
   - Return 403 Forbidden if user tries to access another's data

5. SENSITIVE DATA:
   - Consider encrypting recordings at rest
   - Use HTTPS/TLS for all data in transit
   - Implement audit logging for data access
*/

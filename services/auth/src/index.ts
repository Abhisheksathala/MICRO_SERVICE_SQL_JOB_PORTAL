import app from "./app.js";
import 'dotenv/config';
import { sql } from "./db/db.js";

const PORT = process.env.PORT || 5000;

async function initDb() {
  try {

    // ✅ ENUM
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter');
        END IF;
      END $$;
    `;

    // ✅ USERS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        role user_role NOT NULL,
        bio TEXT,
        resume VARCHAR(255),
        resume_public_id VARCHAR(255),
        profile_pic VARCHAR(255),
        profile_pic_public_id VARCHAR(255),
        subscription TIMESTAMPTZ,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // ✅ SKILLS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        skill_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `;

    // ✅ USER_SKILLS (JOIN TABLE)
    await sql`
      CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, skill_id)
      );
    `;

    // ✅ JOBS TABLE
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        job_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        salary_range VARCHAR(50),
        job_type VARCHAR(20),
        experience_level VARCHAR(50),
        is_remote BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        posted_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("✅ All tables created successfully");

  } catch (error) {
    console.log('❌ Database connection failed', error);
    throw error;
  }
}

// ✅ Start server only after DB ready
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Auth Service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ DB init failed', err);
    process.exit(1);
  });
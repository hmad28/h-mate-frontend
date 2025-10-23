import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  jsonb,
  boolean,
  real,
} from "drizzle-orm/pg-core";

// ===== USERS TABLE =====
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  age: integer("age").notNull(), // BARU: umur user untuk AI analysis
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== CONVERSATIONS TABLE =====
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== USER PROFILES TABLE =====
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  // AI-generated analysis (JSON)
  personalityTraits: jsonb("personality_traits"), // {creative: true, analytical: false, ...}
  interests: jsonb("interests"), // ['gaming', 'design', 'music']
  skills: jsonb("skills"), // ['communication', 'problem-solving']
  workPreferences: jsonb("work_preferences"), // {lightWorkload: true, remote: true, ...}
  careerMatches: jsonb("career_matches"), // [{title, score, reasoning}, ...]

  // Metadata
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  aiConfidenceScore: integer("ai_confidence_score").default(0), // 0-100
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== TEST RESULTS TABLE =====
export const testResults = pgTable("test_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  testType: varchar("test_type", { length: 50 }).notNull(), // 'minat_bakat' | 'mini_test'
  questions: jsonb("questions").notNull(), // array of questions
  answers: jsonb("answers").notNull(), // array of answers
  aiAnalysis: jsonb("ai_analysis").notNull(), // full analysis result
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== CAREER SUMMARIES TABLE =====
export const careerSummaries = pgTable("career_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  summaryText: text("summary_text").notNull(),
  sourceType: varchar("source_type", { length: 20 }).notNull(), // 'test' | 'conversation' | 'combined'
  version: integer("version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== SUMMARY RATINGS TABLE =====
export const summaryRatings = pgTable("summary_ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  summaryId: uuid("summary_id")
    .notNull()
    .references(() => careerSummaries.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  isAccurate: boolean("is_accurate").notNull(),
  feedbackReason: text("feedback_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== ROADMAPS TABLE =====
export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  targetRole: varchar("target_role", { length: 255 }).notNull(),
  currentStatus: varchar("current_status", { length: 50 }).notNull(), // 'pelajar' | 'profesional'
  roadmapData: jsonb("roadmap_data").notNull(), // full roadmap JSON
  estimatedTime: varchar("estimated_time", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== ROADMAP PROGRESS TABLE =====
export const roadmapProgress = pgTable("roadmap_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  roadmapId: uuid("roadmap_id")
    .notNull()
    .references(() => roadmaps.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  completedPhases: jsonb("completed_phases").notNull(), // [0, 1, 3] (phase indices)
  completedSkills: jsonb("completed_skills").notNull(), // ['HTML', 'CSS', 'JS']
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
});

// ===== ROADMAP CONSULTATIONS TABLE =====
export const roadmapConsultations = pgTable("roadmap_consultations", {
  id: uuid("id").defaultRandom().primaryKey(),
  roadmapId: uuid("roadmap_id")
    .notNull()
    .references(() => roadmaps.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('LIVE', 'UPLOAD');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "level" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sanskrit_name" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "target_muscles" TEXT[],
    "image_url" TEXT,
    "description" TEXT,
    "correction_tips" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plan_poses" (
    "id" TEXT NOT NULL,
    "workout_plan_id" TEXT NOT NULL,
    "pose_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "duration_secs" INTEGER,

    CONSTRAINT "workout_plan_poses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_plan_id" TEXT,
    "mode" "SessionMode" NOT NULL DEFAULT 'LIVE',
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "total_minutes" INTEGER,
    "overall_accuracy" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_pose_results" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "pose_id" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "hold_seconds" INTEGER NOT NULL DEFAULT 0,
    "accuracy_pct" DOUBLE PRECISION NOT NULL,
    "corrections" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pose_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_versions" (
    "id" TEXT NOT NULL,
    "version_tag" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "f1_score" DOUBLE PRECISION NOT NULL,
    "per_class_metrics" JSONB NOT NULL DEFAULT '{}',
    "artifact_path" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "trained_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_analytics_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sessions_count" INTEGER NOT NULL DEFAULT 0,
    "minutes_practiced" INTEGER NOT NULL DEFAULT 0,
    "pose_accuracy_map" JSONB NOT NULL DEFAULT '{}',
    "joint_heatmap" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_account_id_key" ON "oauth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "poses_name_key" ON "poses"("name");

-- CreateIndex
CREATE INDEX "workout_plan_poses_workout_plan_id_idx" ON "workout_plan_poses"("workout_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_plan_poses_workout_plan_id_position_key" ON "workout_plan_poses"("workout_plan_id", "position");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_user_id_start_time_idx" ON "sessions"("user_id", "start_time");

-- CreateIndex
CREATE INDEX "session_pose_results_session_id_idx" ON "session_pose_results"("session_id");

-- CreateIndex
CREATE INDEX "session_pose_results_pose_id_idx" ON "session_pose_results"("pose_id");

-- CreateIndex
CREATE UNIQUE INDEX "model_versions_version_tag_key" ON "model_versions"("version_tag");

-- CreateIndex
CREATE INDEX "user_analytics_snapshots_user_id_idx" ON "user_analytics_snapshots"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_analytics_snapshots_user_id_date_key" ON "user_analytics_snapshots"("user_id", "date");

-- AddForeignKey
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plan_poses" ADD CONSTRAINT "workout_plan_poses_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plan_poses" ADD CONSTRAINT "workout_plan_poses_pose_id_fkey" FOREIGN KEY ("pose_id") REFERENCES "poses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_pose_results" ADD CONSTRAINT "session_pose_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_pose_results" ADD CONSTRAINT "session_pose_results_pose_id_fkey" FOREIGN KEY ("pose_id") REFERENCES "poses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

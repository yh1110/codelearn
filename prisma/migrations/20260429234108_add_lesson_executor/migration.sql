-- CreateEnum
CREATE TYPE "LessonExecutor" AS ENUM ('WORKER', 'SANDPACK');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "executor" "LessonExecutor" NOT NULL DEFAULT 'WORKER',
ADD COLUMN     "sandpack_template" TEXT,
ADD COLUMN     "starter_files" JSONB;

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "executor" "LessonExecutor" NOT NULL DEFAULT 'WORKER',
ADD COLUMN     "sandpack_template" TEXT,
ADD COLUMN     "starter_files" JSONB;

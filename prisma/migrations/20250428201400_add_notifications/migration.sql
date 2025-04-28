-- CreateEnum
CREATE TYPE "Role" AS ENUM ('User', 'Owner', 'Admin');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Undefined');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('medication', 'appointment', 'measurement', 'hydration', 'other');

-- CreateEnum
CREATE TYPE "RecurrencePattern" AS ENUM ('daily', 'weekdays', 'weekly', 'monthly');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "patronymic" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "diseases" TEXT[],
    "med_doc" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'User',
    "weekly_water" JSONB DEFAULT '{}',
    "weekly_sleep" JSONB DEFAULT '{}',
    "gender" "Gender" DEFAULT 'Undefined',
    "age" INTEGER,
    "height" DECIMAL(65,30),
    "weight" DECIMAL(65,30),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "review_count" INTEGER NOT NULL,
    "experience" TEXT NOT NULL,
    "education" TEXT[],
    "languages" TEXT[],
    "clinic_id" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "price" TEXT NOT NULL,
    "accepts_insurance" TEXT[],
    "about" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "end_date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_recurring" BOOLEAN DEFAULT false,
    "recurrence_pattern" "RecurrencePattern",

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_owner_id_key" ON "Clinic"("owner_id");

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

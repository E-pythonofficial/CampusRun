-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'DISPATCHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'STAFF');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50),
    "role" "Role" NOT NULL DEFAULT 'REQUESTER',
    "userType" "UserType" NOT NULL DEFAULT 'STUDENT',
    "matricNumber" VARCHAR(50),
    "staffIdUsername" VARCHAR(50),
    "department" VARCHAR(100),
    "college" VARCHAR(100),
    "hostel" VARCHAR(100),
    "bio" TEXT,
    "idCardUrl" VARCHAR(500),
    "selfieUrl" VARCHAR(500),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" VARCHAR(255),
    "tokenExpires" TIMESTAMP(3),
    "resetToken" VARCHAR(255),
    "resetTokenExpires" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "weeklyBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "item" VARCHAR(255) NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "pickupLng" DOUBLE PRECISION NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "dropoffLat" DOUBLE PRECISION NOT NULL,
    "dropoffLng" DOUBLE PRECISION NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "runnerGets" DECIMAL(10,2) NOT NULL,
    "companyRevenue" DECIMAL(10,2) NOT NULL,
    "handoverPin" VARCHAR(10),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "paystackRef" VARCHAR(255),
    "requesterId" TEXT NOT NULL,
    "runnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricNumber_key" ON "User"("matricNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_staffIdUsername_key" ON "User"("staffIdUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_resetToken_idx" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "LoginRecord_userId_idx" ON "LoginRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_paystackRef_key" ON "Delivery"("paystackRef");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "Delivery_requesterId_idx" ON "Delivery"("requesterId");

-- CreateIndex
CREATE INDEX "Delivery_runnerId_idx" ON "Delivery"("runnerId");

-- CreateIndex
CREATE INDEX "Delivery_paystackRef_idx" ON "Delivery"("paystackRef");

-- CreateIndex
CREATE INDEX "Otp_email_idx" ON "Otp"("email");

-- AddForeignKey
ALTER TABLE "LoginRecord" ADD CONSTRAINT "LoginRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

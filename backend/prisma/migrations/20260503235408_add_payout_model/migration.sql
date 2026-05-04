-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "runnerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT NOT NULL,
    "transferCode" VARCHAR(100),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payout_reference_key" ON "Payout"("reference");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

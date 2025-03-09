-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "freeConversations" INTEGER NOT NULL DEFAULT 3,
    "freeMessages" INTEGER NOT NULL DEFAULT 20,
    "freeStorage" INTEGER NOT NULL DEFAULT 1000000000,
    "business" TEXT,
    "position" TEXT,
    "userId" TEXT NOT NULL,
    "confirmationDate" TIMESTAMP(3),

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

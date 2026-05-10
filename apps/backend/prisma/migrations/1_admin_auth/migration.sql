-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "isTeamMember" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_githubId_key" ON "admin_users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_login_key" ON "admin_users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_token_idx" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_expiresAt_idx" ON "admin_sessions"("expiresAt");

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

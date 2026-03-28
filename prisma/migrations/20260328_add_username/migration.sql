-- Add username column as nullable first
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Populate existing users with their name as username (lowercased, spaces replaced)
UPDATE "User" SET "username" = LOWER(REPLACE("name", ' ', '.'));

-- Now make it NOT NULL and UNIQUE
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Make email nullable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

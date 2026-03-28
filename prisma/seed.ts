import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  await db.destination.upsert({
    where: { id: "london" },
    update: {},
    create: {
      id: "london",
      name: "Londres",
      country: "Reino Unido",
      description:
        "Capital do Reino Unido, com história, museus, teatros e uma gastronomia incrível.",
      emoji: "🇬🇧",
    },
  });

  const hash = await bcrypt.hash("admin123", 12);
  await db.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Admin",
      username: "admin",
      passwordHash: hash,
      role: "ADMIN",
    },
  });

  console.log("✅ Seed concluído");
  console.log("   Admin: utilizador 'admin' / password 'admin123'");
  console.log("   ⚠️  Altere a password depois de fazer login!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

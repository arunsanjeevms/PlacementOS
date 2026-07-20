/**
 * Seeds the default company list for the demo user (or first user found).
 * Run with: npm run seed
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULT_COMPANIES } from "../src/lib/defaultTopics.js";

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { supabaseId: "demo-user", email: "demo@placementos.local", name: "Demo User", settings: { create: {} } },
    });
    console.log("Created demo user");
  }

  const existing = await prisma.company.findMany({ where: { userId: user.id }, select: { name: true } });
  const have = new Set(existing.map((c) => c.name));
  const toCreate = DEFAULT_COMPANIES.filter((name) => !have.has(name));
  for (const name of toCreate) {
    await prisma.company.create({
      data: {
        userId: user.id,
        name,
        stage: "WISHLIST",
        rounds: [
          { name: "Online Assessment", status: "pending", notes: "" },
          { name: "Technical Round 1", status: "pending", notes: "" },
          { name: "Technical Round 2", status: "pending", notes: "" },
          { name: "HR Round", status: "pending", notes: "" },
        ],
      },
    });
  }
  console.log(`Seeded ${toCreate.length} companies for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

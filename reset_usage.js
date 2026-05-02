const { PrismaClient } = require("@prisma/client");

(async () => {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: node reset_usage.js <userId>");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const mk = new Date().toISOString().slice(0, 7);

  await prisma.usage.upsert({
    where: { userId_monthKey: { userId, monthKey: mk } },
    update: { count: 0 },
    create: { userId, monthKey: mk, count: 0 },
  });

  console.log("Reset OK for", userId, "month", mk);
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

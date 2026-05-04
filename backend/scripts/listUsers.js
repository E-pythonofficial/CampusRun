import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true }
  });
  console.table(users);
  await prisma.$disconnect();
}

main();
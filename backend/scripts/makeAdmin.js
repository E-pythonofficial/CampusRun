// BACKEND: scripts/makeAdmin.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'somoyeeniola50@gmail.com' },
    data: {
      role:       'ADMIN',
      isApproved: true,
      isVerified: true,
    },
  });
  console.log(`✅ Done — ${user.fullName} is now ADMIN`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
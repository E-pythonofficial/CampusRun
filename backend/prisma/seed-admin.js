const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // or bcrypt, whatever you use in your auth

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('YourStrongPasswordHere', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusrun.com' },
    update: {},
    create: {
      email: 'admin@campusrun.com',
      password: hashedPassword,
      role: 'ADMIN', // adjust field/enum name to match your schema
      name: 'Admin',
    },
  });

  console.log('Admin created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
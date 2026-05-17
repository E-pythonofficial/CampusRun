import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const email    = 'campusrunner1@gmail.com';   // ← change this
const password = 'CampusRun@2026!';            // ← change this
const fullName = 'CampusRun Admin';

async function main() {
  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where:  { email },
    update: {},                            // do nothing if already exists
    create: {
      email,
      password:          hashed,
      fullName,
      role:              'ADMIN',
      isVerified:        true,
      isApproved:        true,
      applicationStatus: 'NOT_APPLIED',
    },
  });

  console.log('✅ Admin created:', admin.email);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
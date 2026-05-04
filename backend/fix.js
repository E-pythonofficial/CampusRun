import prisma from './src/lib/prisma.js';

const user = await prisma.user.update({
  where: { id: '60d5f3a2-fe58-4c13-bd66-97c8ed28cec6' },
  data:  { 
    isApproved:        true,
    applicationStatus: 'APPROVED',
  },
});

console.log('Fixed:', user.fullName, '| isApproved:', user.isApproved);
await prisma.$disconnect();
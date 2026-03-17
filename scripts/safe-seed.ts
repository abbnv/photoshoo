import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    console.log('Skipping demo seed. Set ALLOW_DEMO_SEED=true to enable it.');
    return;
  }

  const demoEmail = process.env.DEMO_USER_EMAIL ?? 'john@doe.com';
  const demoPassword = process.env.DEMO_USER_PASSWORD ?? 'johndoe123';
  const demoName = process.env.DEMO_USER_NAME ?? 'John Doe';
  const hashedPassword = await bcrypt.hash(demoPassword, 12);

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: { password: hashedPassword, name: demoName },
    create: { email: demoEmail, password: hashedPassword, name: demoName },
  });

  console.log(`Demo user ensured for ${demoEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

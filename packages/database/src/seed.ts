import { PrismaClient } from "./client";

const prisma = new PrismaClient();

async function main() {
  // COMPANY
  await prisma.company.create({
    data: {
      id: "odetail",
    },
  });

  await prisma.company.create({
    data: {
      id: "aztec",
    },
  });

  //EMPLOYEE

  await prisma.employee.create({
    data: {
      username: `misaele`,
      name: `Misael Esperanzate`,
      role: `admin`,
      companyId: `aztec`,
      email: `misael.esperanzate@hotmail.com`,
    },
  });

  await prisma.employee.create({
    data: {
      username: `admin`,
      name: `Aztec Admin`,
      role: `admin`,
      companyId: `aztec`,
      email: `admin@odetail.ca`,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

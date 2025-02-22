import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // COMPANY
  const odetail = await prisma.company.create({
    data: {
      name: "odetail",
    },
  });
  const aztec = await prisma.company.create({
    data: {
      name: "aztec",
    },
  });

  //EMPLOYEE

  const employee1 = await prisma.employee.create({
    data: {
      username: `misaele`,
      name: `Misael Esperanzate`,
      role: `admin`,
      email: `misael.esperanzate@hotmail.com`,
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      username: `admin`,
      name: `Aztec Admin`,
      role: `admin`,
      email: `admin@aztecautoglass.ca`,
    },
  });

  // Step 3: Assign Employees to Companies via Junction Table
  await prisma.employeesOnCompanies.createMany({
    data: [
      { employeeId: employee1.id, companyId: odetail.id },
      { employeeId: employee1.id, companyId: aztec.id },
      { employeeId: employee2.id, companyId: odetail.id },
      { employeeId: employee2.id, companyId: aztec.id },
    ],
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

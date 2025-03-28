import { PrismaClient } from "./index";

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

  // CUSTOMER

  await prisma.customer.create({
    data: {
      firstName: "Neen",
      lastName: "Dulay",
      phone: "4031234567",
      returnCounter: 1,
      companyId: "odetail",
    },
  });

  // REVENUE
  const revenueData = [
    { date: new Date(), grossSales: 300, costBeforeGst: 100, cash: 300 },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 35)),
      grossSales: 400,
      costBeforeGst: 150,
      cash: 400,
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 65)),
      grossSales: 500,
      costBeforeGst: 200,
      cash: 500,
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 95)),
      grossSales: 600,
      costBeforeGst: 250,
      cash: 600,
    },
  ];

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const statement = await prisma.statement.create({
    data: {
      startDate,
      endDate,
      distributor: "O",
      companyId: "odetail",
    },
  });
  for (const data of revenueData) {
    await prisma.revenue.create({
      data: {
        createdAt: data.date,
        updatedAt: data.date,
        totalWindshields: 2,
        totalChipRepairs: 1,
        totalWarranties: 0,
        grossSales: data.grossSales,
        grossSalesGst: data.grossSales * 0.05,
        costBeforeGst: data.costBeforeGst,
        costAfterGst: data.costBeforeGst * 1.05,
        gstOnJob: data.grossSales * 0.05,
        gasCost: 20,
        materialCost: 30,
        shopFees: 10,
        labour: 40,
        jobNet: 100,
        subNet: 120,
        trueNet: 130,
        visa: 0,
        mastercard: 0,
        debit: 0,
        cash: data.cash,
        etransfer: 0,
        amex: 0,
        newClients: 1,
        repeatClients: 0,
        statementId: statement.id,
        companyId: "odetail",
      },
    });
  }
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

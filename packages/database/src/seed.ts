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

  // Create a Customer
  const customer = await prisma.customer.create({
    data: {
      firstName: "Neen",
      lastName: "Dulay",
      phone: "4031234567",
      returnCounter: 1,
      companyId: "odetail",
    },
  });

  // Create an Invoice for the Customer
  const invoice = await prisma.invoice.create({
    data: {
      companyId: "odetail",
      paymentType: "Visa",
      customerId: customer.id,
      status: "Paid",
    },
  });

  // Create a Statement
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);
  const statement = await prisma.statement.create({
    data: {
      startDate,
      endDate,
      distributor: "M", // Assuming "O" is valid for your Distributor enum
      companyId: "odetail",
    },
  });

  // Define autoglass service types and corresponding revenue data
  const autoglassServiceTypes = [
    "Windshield",
    "Door Glass",
    "Back Glass",
    "Sunroof",
    "Mirror",
    "Quarter Glass",
  ];

  const revenueData = [
    { grossSales: 300, costBeforeGst: 100, cash: 300 },
    { grossSales: 400, costBeforeGst: 150, cash: 400 },
    { grossSales: 500, costBeforeGst: 200, cash: 500 },
    { grossSales: 600, costBeforeGst: 250, cash: 600 },
    { grossSales: 350, costBeforeGst: 120, cash: 350 },
    { grossSales: 450, costBeforeGst: 180, cash: 450 },
  ];

  // For each autoglass service type, create a Service and a Revenue record connecting Invoice and Statement.
  for (let i = 0; i < autoglassServiceTypes.length; i++) {
    const serviceType = autoglassServiceTypes[i] as string;
    const revenueItem = revenueData[i]!;

    // Create a Service associated with the Invoice
    const service = await prisma.service.create({
      data: {
        invoiceId: invoice.id,
        companyId: "odetail",
        serviceType,
        price: revenueItem.grossSales,
        quantity: 1,
        vehicleType: "Sedan",
        code: `DW${Math.floor(1000 + Math.random() * 9000)}`,
        distributor: "M",
      },
    });

    // Set a varying createdAt date (each record 10 days apart)
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - i * 10);

    // Create a Revenue record linked to the Service, Invoice, and Statement
    await prisma.revenue.create({
      data: {
        createdAt,
        updatedAt: createdAt,
        totalWindshields: 2, // Example values; adjust as needed per service type if necessary
        totalChipRepairs: 1,
        totalWarranties: 0,
        grossSales: revenueItem.grossSales,
        grossSalesGst: revenueItem.grossSales * 0.05,
        costBeforeGst: revenueItem.costBeforeGst,
        costAfterGst: revenueItem.costBeforeGst * 1.05,
        gstOnJob: revenueItem.grossSales * 0.05,
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
        cash: revenueItem.cash,
        etransfer: 0,
        amex: 0,
        newClients: 1,
        repeatClients: 0,
        statementId: statement.id,
        invoiceId: invoice.id,
        serviceId: service.id,
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

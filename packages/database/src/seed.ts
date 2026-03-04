import { prisma } from "./index";

async function main() {
  const aztecLocations = [
    { slug: "downtown", name: "Downtown" },
    { slug: "airdrie", name: "Airdrie" },
  ];

  // 1) COMPANIES (idempotent)
  const odetail = await prisma.company.upsert({
    where: { id: "odetail" },
    update: {},
    create: { id: "odetail" },
  });

  const aztec = await prisma.company.upsert({
    where: { id: "aztec" },
    update: {},
    create: { id: "aztec" },
  });

  // 2) LOCATIONS (idempotent)
  for (const loc of aztecLocations) {
    await prisma.location.upsert({
      where: {
        companyId_slug: { companyId: aztec.id, slug: loc.slug },
      },
      update: { name: loc.name, isActive: true },
      create: {
        companyId: aztec.id,
        slug: loc.slug,
        name: loc.name,
        isActive: true,
      },
    });
    console.log(`✅ Ensured Aztec location: ${loc.slug}`);
  }

  // grab one location to use for seeding (optional)
  const downtown = await prisma.location.findFirst({
    where: { companyId: aztec.id, slug: "downtown" },
  });

  // 3) EMPLOYEES (idempotent)
  await prisma.employee.upsert({
    where: { username: "misaele" },
    update: {
      name: "Misael Esperanzate",
      role: "admin",
      companyId: aztec.id,
      email: "misael.esperanzate@hotmail.com",
      // locationId: downtown?.id ?? null, // if you add Employee.locationId later
    },
    create: {
      username: "misaele",
      name: "Misael Esperanzate",
      role: "admin",
      companyId: aztec.id,
      email: "misael.esperanzate@hotmail.com",
      // locationId: downtown?.id ?? null,
    },
  });

  await prisma.employee.upsert({
    where: { username: "admin" },
    update: {
      name: "Aztec Admin",
      role: "admin",
      companyId: aztec.id,
      email: "admin@odetail.ca",
      // locationId: downtown?.id ?? null,
    },
    create: {
      username: "admin",
      name: "Aztec Admin",
      role: "admin",
      companyId: aztec.id,
      email: "admin@odetail.ca",
      // locationId: downtown?.id ?? null,
    },
  });

  // 4) ODETAIL SAMPLE DATA (idempotent-ish)
  const customer = await prisma.customer.upsert({
    where: {
      namePhone: {
        firstName: "Neen",
        phone: "4031234567",
      },
    },
    update: {
      lastName: "Dulay",
      returnCounter: 1,
      companyId: odetail.id,
      customerType: "Retailer",
      // locationId: null or some odetail location if you add those
    },
    create: {
      firstName: "Neen",
      lastName: "Dulay",
      phone: "4031234567",
      returnCounter: 1,
      companyId: odetail.id,
      customerType: "Retailer",
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      companyId: odetail.id,
      paymentType: "Visa",
      customerId: customer.id,
      status: "Paid",
      // locationId: null, // if you add Invoice.locationId later
    },
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const statement = await prisma.statement.create({
    data: {
      startDate,
      endDate,
      distributor: "M",
      companyId: odetail.id,
      // locationId: null, // if you add Statement.locationId later
    },
  });

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

  for (let i = 0; i < autoglassServiceTypes.length; i++) {
    const serviceType = autoglassServiceTypes[i]!;
    const revenueItem = revenueData[i]!;

    const service = await prisma.service.create({
      data: {
        invoiceId: invoice.id,
        companyId: odetail.id,
        serviceType,
        price: revenueItem.grossSales,
        quantity: 1,
        vehicleType: "Sedan",
        code: `DW${Math.floor(1000 + Math.random() * 9000)}`,
        distributor: "M",
        // locationId: null, // if you add Service.locationId later
      },
    });

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - i * 10);

    await prisma.revenue.create({
      data: {
        createdAt,
        updatedAt: createdAt,
        totalWindshields: 2,
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
        companyId: odetail.id,
        // locationId: null, // if you add Revenue.locationId later
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { prisma } from "./index";

async function main() {
  // ─────────────────────────────────────────────
  // 1. COMPANIES
  // ─────────────────────────────────────────────
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

  console.log("Companies: odetail, aztec");

  // ─────────────────────────────────────────────
  // 2. LOCATIONS
  // ─────────────────────────────────────────────
  const aztecLocationData = [
    { slug: "downtown", name: "Downtown" },
    { slug: "airdrie", name: "Airdrie" },
  ];

  for (const loc of aztecLocationData) {
    await prisma.location.upsert({
      where: { companyId_slug: { companyId: aztec.id, slug: loc.slug } },
      update: { name: loc.name, isActive: true },
      create: { companyId: aztec.id, slug: loc.slug, name: loc.name, isActive: true },
    });
    console.log(`Location: Aztec / ${loc.name}`);
  }

  const downtown = await prisma.location.findFirstOrThrow({
    where: { companyId: aztec.id, slug: "downtown" },
  });

  // ─────────────────────────────────────────────
  // 3. CASE: Employee creation
  // ─────────────────────────────────────────────
  await prisma.employee.upsert({
    where: { username: "misaele" },
    update: {
      name: "Misael Esperanzate",
      role: "admin",
      companyId: aztec.id,
      email: "misael.esperanzate@hotmail.com",
      locationId: downtown.id,
    },
    create: {
      username: "misaele",
      name: "Misael Esperanzate",
      role: "admin",
      companyId: aztec.id,
      email: "misael.esperanzate@hotmail.com",
      locationId: downtown.id,
    },
  });
  console.log("Employee: misaele (aztec admin)");

  await prisma.employee.upsert({
    where: { username: "admin" },
    update: {
      name: "Aztec Admin",
      role: "admin",
      companyId: aztec.id,
      email: "admin@odetail.ca",
      locationId: downtown.id,
    },
    create: {
      username: "admin",
      name: "Aztec Admin",
      role: "admin",
      companyId: aztec.id,
      email: "admin@odetail.ca",
      locationId: downtown.id,
    },
  });
  console.log("Employee: admin (aztec admin)");

  await prisma.employee.upsert({
    where: { username: "jsmith" },
    update: { name: "John Smith", role: "technician", companyId: odetail.id },
    create: { username: "jsmith", name: "John Smith", role: "technician", companyId: odetail.id },
  });
  console.log("Employee: jsmith (odetail technician)");

  // ─────────────────────────────────────────────
  // 4. CASE: Custom service (ServiceCatalog)
  // ─────────────────────────────────────────────
  const catalogServices = [
    { name: "Windshield Replacement", description: "Full windshield replacement", code: "WR", price: 350 },
    { name: "Chip Repair", description: "Single chip repair", code: "CR", price: 75 },
    { name: "Door Glass Replacement", description: "Side door glass replacement", code: "DGR", price: 200 },
  ];

  for (const svc of catalogServices) {
    const existing = await prisma.serviceCatalog.findFirst({
      where: { name: svc.name, companyId: odetail.id },
    });
    if (!existing) {
      await prisma.serviceCatalog.create({
        data: { ...svc, companyId: odetail.id },
      });
    }
    console.log(`ServiceCatalog: ${svc.name}`);
  }

  // ─────────────────────────────────────────────
  // 5. CASE: Customer only (no invoice or appointment)
  // ─────────────────────────────────────────────
  const customerOnly = await prisma.customer.upsert({
    where: { namePhone: { firstName: "Alex", phone: "4039998888" } },
    update: { lastName: "Turner", companyId: odetail.id, customerType: "Retailer" },
    create: {
      firstName: "Alex",
      lastName: "Turner",
      phone: "4039998888",
      companyId: odetail.id,
      customerType: "Retailer",
    },
  });
  console.log(`Customer only: ${customerOnly.firstName} ${customerOnly.lastName}`);

  // ─────────────────────────────────────────────
  // 6. CASE: Create invoice directly (no appointment)
  // ─────────────────────────────────────────────
  const customerWithInvoice = await prisma.customer.upsert({
    where: { namePhone: { firstName: "Neen", phone: "4031234567" } },
    update: { lastName: "Dulay", companyId: odetail.id, customerType: "Retailer", returnCounter: 1 },
    create: {
      firstName: "Neen",
      lastName: "Dulay",
      phone: "4031234567",
      companyId: odetail.id,
      customerType: "Retailer",
      returnCounter: 1,
    },
  });

  const directInvoice = await prisma.invoice.create({
    data: {
      companyId: odetail.id,
      customerId: customerWithInvoice.id,
      paymentType: "Visa",
      status: "Paid",
      services: {
        create: {
          companyId: odetail.id,
          serviceType: "Windshield",
          price: 350,
          quantity: 1,
          vehicleType: "Sedan",
          code: "DW1000",
          distributor: "M",
        },
      },
    },
  });
  console.log(
    `Invoice (direct): #${directInvoice.id} for ${customerWithInvoice.firstName} ${customerWithInvoice.lastName}`
  );

  // ─────────────────────────────────────────────
  // 7. MORE DIRECT INVOICES (varied statuses, payment types, services)
  // ─────────────────────────────────────────────
  const extraInvoices: {
    firstName: string;
    lastName: string;
    phone: string;
    customerType: string;
    paymentType: string;
    status: "Draft" | "Pending" | "Paid" | "Overdue";
    serviceType: string;
    price: number;
    vehicleType: "Sedan" | "Suv" | "Truck" | "Minivan" | "Convertible" | "Hatchback" | "Coupe";
    code: string;
    distributor?: string;
  }[] = [
    {
      firstName: "Carlos",
      lastName: "Reyes",
      phone: "4031112222",
      customerType: "Retailer",
      paymentType: "Cash",
      status: "Paid",
      serviceType: "Chip Repair",
      price: 75,
      vehicleType: "Truck",
      code: "CR",
      distributor: "M",
    },
    {
      firstName: "Sandra",
      lastName: "Kim",
      phone: "4032223333",
      customerType: "Retailer",
      paymentType: "Etransfer",
      status: "Pending",
      serviceType: "Door Glass",
      price: 220,
      vehicleType: "Suv",
      code: "DW1234",
    },
    {
      firstName: "Derek",
      lastName: "Olsen",
      phone: "4033334444",
      customerType: "Vendor",
      paymentType: "Cheque",
      status: "Overdue",
      serviceType: "Back Glass",
      price: 480,
      vehicleType: "Minivan",
      code: "DW3000",
      distributor: "T",
    },
    {
      firstName: "Priya",
      lastName: "Sharma",
      phone: "4034445555",
      customerType: "Retailer",
      paymentType: "Debit",
      status: "Paid",
      serviceType: "Sunroof",
      price: 600,
      vehicleType: "Coupe",
      code: "DW3456",
    },
    {
      firstName: "Tom",
      lastName: "Wallace",
      phone: "4035556666",
      customerType: "Fleet",
      paymentType: "Visa",
      status: "Draft",
      serviceType: "Quarter Glass",
      price: 180,
      vehicleType: "Hatchback",
      code: "DW5678",
      distributor: "M",
    },
    {
      firstName: "Fatima",
      lastName: "Hassan",
      phone: "4036667777",
      customerType: "Vendor",
      paymentType: "Mastercard",
      status: "Paid",
      serviceType: "Windshield",
      price: 130,
      vehicleType: "Sedan",
      code: "DW6000",
    },
    {
      firstName: "James",
      lastName: "Whitfield",
      phone: "4038889999",
      customerType: "Retailer",
      paymentType: "Cash",
      status: "Pending",
      serviceType: "Windshield",
      price: 375,
      vehicleType: "Convertible",
      code: "DW3000",
      distributor: "T",
    },
  ];

  for (const entry of extraInvoices) {
    const cust = await prisma.customer.upsert({
      where: { namePhone: { firstName: entry.firstName, phone: entry.phone } },
      update: { lastName: entry.lastName, companyId: odetail.id, customerType: entry.customerType },
      create: {
        firstName: entry.firstName,
        lastName: entry.lastName,
        phone: entry.phone,
        companyId: odetail.id,
        customerType: entry.customerType,
      },
    });

    const inv = await prisma.invoice.create({
      data: {
        companyId: odetail.id,
        customerId: cust.id,
        paymentType: entry.paymentType,
        status: entry.status,
        services: {
          create: {
            companyId: odetail.id,
            serviceType: entry.serviceType,
            price: entry.price,
            quantity: 1,
            vehicleType: entry.vehicleType,
            code: entry.code,
            distributor: entry.distributor,
          },
        },
      },
    });

    console.log(`Invoice #${inv.id} [${inv.status}] — ${entry.firstName} ${entry.lastName} / ${entry.serviceType}`);
  }

  // ─────────────────────────────────────────────
  // 8. CASE: Appointment → generates Invoice
  // ─────────────────────────────────────────────
  const customerWithAppt = await prisma.customer.upsert({
    where: { namePhone: { firstName: "Maria", phone: "4037776655" } },
    update: { lastName: "Santos", companyId: aztec.id, customerType: "Retailer", locationId: downtown.id },
    create: {
      firstName: "Maria",
      lastName: "Santos",
      phone: "4037776655",
      companyId: aztec.id,
      customerType: "Retailer",
      locationId: downtown.id,
    },
  });

  const apptStart = new Date();
  apptStart.setHours(9, 0, 0, 0);
  const apptEnd = new Date();
  apptEnd.setHours(11, 0, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      title: `Windshield Replacement - ${customerWithAppt.firstName} ${customerWithAppt.lastName}`,
      startTime: apptStart,
      endTime: apptEnd,
      description: "Front windshield needs full replacement",
      status: "Confirmed",
      companyId: aztec.id,
      customerId: customerWithAppt.id,
      locationId: downtown.id,
      services: {
        create: {
          companyId: aztec.id,
          serviceType: "Windshield",
          price: 400,
          quantity: 1,
          vehicleType: "Suv",
          code: "DW2000",
          locationId: downtown.id,
        },
      },
    },
    include: { services: true },
  });
  console.log(`Appointment: #${appointment.id} "${appointment.title}"`);

  // Invoice generated from the appointment
  const apptInvoice = await prisma.invoice.create({
    data: {
      companyId: aztec.id,
      customerId: customerWithAppt.id,
      appointmentId: appointment.id,
      paymentType: "Mastercard",
      status: "Pending",
      locationId: downtown.id,
      services: {
        connect: appointment.services.map((s) => ({ id: s.id })),
      },
    },
  });
  console.log(`Invoice (from appointment): #${apptInvoice.id} linked to Appointment #${appointment.id}`);
}

main()
  .then(async () => {
    console.log("\nSeed complete.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

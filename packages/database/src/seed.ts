import { prisma } from "./index";

async function main() {
  // ─────────────────────────────────────────────
  // 0. CLEANUP (idempotent re-runs)
  // ─────────────────────────────────────────────
  await prisma.payment.deleteMany({});
  await prisma.revenue.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.statement.deleteMany({});
  await prisma.pricingBankEntry.deleteMany({});
  await prisma.serviceCatalog.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.location.deleteMany({});
  console.log("Database cleaned.");

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
  // 2. LOCATIONS (aztec only)
  // ─────────────────────────────────────────────
  const downtown = await prisma.location.create({
    data: { companyId: aztec.id, slug: "downtown", name: "Downtown", isActive: true },
  });
  const airdrie = await prisma.location.create({
    data: { companyId: aztec.id, slug: "airdrie", name: "Airdrie", isActive: true },
  });
  console.log("Locations: downtown, airdrie (aztec)");

  // ─────────────────────────────────────────────
  // 3. EMPLOYEES
  // ─────────────────────────────────────────────
  await prisma.employee.createMany({
    data: [
      // odetail
      { username: "oadmin",  name: "O-Detail Admin",        role: "admin",      companyId: odetail.id, email: "admin@odetail.ca" },
      { username: "jsmith",  name: "John Smith",             role: "technician", companyId: odetail.id, email: "jsmith@odetail.ca" },
      { username: "klee",    name: "Karen Lee",              role: "technician", companyId: odetail.id, email: "klee@odetail.ca" },
      // aztec
      { username: "misaele", name: "Misael Esperanzate",     role: "admin",      companyId: aztec.id, email: "misael.esperanzate@hotmail.com", locationId: downtown.id },
      { username: "admin",   name: "Aztec Admin",            role: "admin",      companyId: aztec.id, email: "aztecadmin@aztec.ca",            locationId: downtown.id },
      { username: "bsmith",  name: "Bob Smith",              role: "technician", companyId: aztec.id, email: "bsmith@aztec.ca",                locationId: downtown.id },
      { username: "asmith",  name: "Alice Smith",            role: "technician", companyId: aztec.id, email: "asmith@aztec.ca",                locationId: airdrie.id },
    ],
  });
  console.log("Employees created.");

  // ─────────────────────────────────────────────
  // 4. SERVICE CATALOG
  // ─────────────────────────────────────────────
  const catalogEntries = [
    { name: "Windshield Replacement",  description: "Full windshield replacement",                    code: "WR",   price: 350 },
    { name: "Chip Repair",             description: "Single chip repair",                             code: "CR",   price: 75  },
    { name: "Door Glass Replacement",  description: "Side door glass replacement",                    code: "DGR",  price: 200 },
    { name: "Back Glass Replacement",  description: "Rear windshield replacement",                    code: "BGR",  price: 280 },
    { name: "ADAS Calibration",        description: "Advanced driver assistance system calibration",  code: "ADAS", price: 120 },
    { name: "Quarter Glass",           description: "Quarter window replacement",                     code: "QGR",  price: 180 },
  ];

  await prisma.serviceCatalog.createMany({
    data: [
      ...catalogEntries.map((e) => ({ ...e, companyId: odetail.id })),
      ...catalogEntries.map((e) => ({ ...e, companyId: aztec.id, locationId: downtown.id })),
      ...catalogEntries.map((e) => ({ ...e, companyId: aztec.id, locationId: airdrie.id })),
    ],
  });
  console.log("ServiceCatalog created.");

  // ─────────────────────────────────────────────
  // 5. PRICING BANK ENTRIES (for quote pricing lookups)
  // ─────────────────────────────────────────────
  const pricingRows = [
    { code: "DW1000", distributor: "M", customerType: "Retailer", flatCharge: 50,  glassCost: 180 },
    { code: "DW1000", distributor: "T", customerType: "Retailer", flatCharge: 55,  glassCost: 190 },
    { code: "DW1234", distributor: "M", customerType: "Retailer", flatCharge: 60,  glassCost: 200 },
    { code: "DW2000", distributor: "M", customerType: "Retailer", flatCharge: 65,  glassCost: 220 },
    { code: "DW3000", distributor: "T", customerType: "Retailer", flatCharge: 70,  glassCost: 250 },
    { code: "DW3000", distributor: "T", customerType: "Fleet",    flatCharge: 60,  glassCost: 230 },
    { code: "DW3456", distributor: "M", customerType: "Retailer", flatCharge: 55,  glassCost: 210 },
    { code: "DW5678", distributor: "M", customerType: "Fleet",    flatCharge: 45,  glassCost: 160 },
    { code: "DW6000", distributor: "M", customerType: "Vendor",   flatCharge: 40,  glassCost: 150 },
    { code: "CR",     distributor: "M", customerType: "Retailer", flatCharge: 20,  glassCost: 30  },
  ];

  // One entry per companyId+code+distributor+customerType (unique constraint)
  await prisma.pricingBankEntry.createMany({
    data: [
      ...pricingRows.map((r) => ({ ...r, companyId: odetail.id })),
      ...pricingRows.map((r) => ({ ...r, companyId: aztec.id, locationId: downtown.id })),
    ],
  });
  console.log("PricingBankEntries created.");

  // ─────────────────────────────────────────────
  // DATE HELPERS
  // ─────────────────────────────────────────────
  const now = new Date();
  const d = (monthOffset: number, day: number, hour = 10) =>
    new Date(now.getFullYear(), now.getMonth() + monthOffset, day, hour);
  const thisMonth  = (day: number, hour = 10) => d(0,  day, hour);
  const lastMonth  = (day: number, hour = 10) => d(-1, day, hour);
  const twoAgo     = (day: number, hour = 10) => d(-2, day, hour);

  // ─────────────────────────────────────────────
  // 6. CUSTOMERS
  // ─────────────────────────────────────────────
  const [alex, neen, carlos, sandra, derek, priya, tom, fatima, james, pageTest] =
    await Promise.all([
      prisma.customer.create({ data: { firstName: "Alex",     lastName: "Turner",    phone: "4039998888", email: "alex.turner@gmail.com",    companyId: odetail.id, customerType: "Retailer" } }),
      prisma.customer.create({ data: { firstName: "Neen",     lastName: "Dulay",     phone: "4031234567", email: "neen.dulay@gmail.com",     companyId: odetail.id, customerType: "Retailer", returnCounter: 3 } }),
      prisma.customer.create({ data: { firstName: "Carlos",   lastName: "Reyes",     phone: "4031112222", email: "carlos.reyes@gmail.com",   companyId: odetail.id, customerType: "Retailer" } }),
      prisma.customer.create({ data: { firstName: "Sandra",   lastName: "Kim",       phone: "4032223333", email: "sandra.kim@gmail.com",     companyId: odetail.id, customerType: "Retailer" } }),
      prisma.customer.create({ data: { firstName: "Derek",    lastName: "Olsen",     phone: "4033334444", email: "derek.olsen@gmail.com",    companyId: odetail.id, customerType: "Vendor"   } }),
      prisma.customer.create({ data: { firstName: "Priya",    lastName: "Sharma",    phone: "4034445555", email: "priya.sharma@gmail.com",   companyId: odetail.id, customerType: "Retailer" } }),
      prisma.customer.create({ data: { firstName: "Tom",      lastName: "Wallace",   phone: "4035556666", email: "tom.wallace@gmail.com",    companyId: odetail.id, customerType: "Fleet"    } }),
      prisma.customer.create({ data: { firstName: "Fatima",   lastName: "Hassan",    phone: "4036667777", email: "fatima.hassan@gmail.com",  companyId: odetail.id, customerType: "Vendor"   } }),
      prisma.customer.create({ data: { firstName: "James",    lastName: "Whitfield", phone: "4038889999", email: "james.whitfield@gmail.com",companyId: odetail.id, customerType: "Retailer", returnCounter: 2 } }),
      prisma.customer.create({ data: { firstName: "PageTest", lastName: "User",      phone: "4039990000",                                   companyId: odetail.id, customerType: "Retailer" } }),
    ]);

  const [maria, ryan, lisa, ahmed] = await Promise.all([
    prisma.customer.create({ data: { firstName: "Maria",   lastName: "Santos",   phone: "4037776655", email: "maria.santos@gmail.com",   companyId: aztec.id, customerType: "Retailer", locationId: downtown.id } }),
    prisma.customer.create({ data: { firstName: "Ryan",    lastName: "Cooper",   phone: "4031110001", email: "ryan.cooper@gmail.com",    companyId: aztec.id, customerType: "Retailer", locationId: downtown.id } }),
    prisma.customer.create({ data: { firstName: "Lisa",    lastName: "Park",     phone: "4031110002", email: "lisa.park@gmail.com",      companyId: aztec.id, customerType: "Fleet",    locationId: downtown.id } }),
    prisma.customer.create({ data: { firstName: "Ahmed",   lastName: "Al-Farsi", phone: "4031110003", email: "ahmed.alfarsi@gmail.com",  companyId: aztec.id, customerType: "Vendor",   locationId: downtown.id } }),
  ]);

  const [tyler, jessica] = await Promise.all([
    prisma.customer.create({ data: { firstName: "Tyler",   lastName: "Brooks",   phone: "4031110004", email: "tyler.brooks@gmail.com",   companyId: aztec.id, customerType: "Retailer", locationId: airdrie.id } }),
    prisma.customer.create({ data: { firstName: "Jessica", lastName: "Nguyen",   phone: "4031110005", email: "jessica.nguyen@gmail.com", companyId: aztec.id, customerType: "Retailer", locationId: airdrie.id } }),
  ]);

  console.log("Customers created.");

  // ─────────────────────────────────────────────
  // 7. ODETAIL INVOICES (varied statuses & dates for filter testing)
  // ─────────────────────────────────────────────
  type VehicleType = "Sedan" | "Suv" | "Truck" | "Minivan" | "Convertible" | "Hatchback" | "Coupe";
  type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue";

  type OInvoiceEntry = {
    customerId: string; paymentType: string; status: InvoiceStatus;
    serviceType: string; price: number; vehicleType: VehicleType;
    code: string; distributor?: string; createdAt: Date;
  };

  const odetailInvoiceRows: OInvoiceEntry[] = [
    // ── this month ──
    { customerId: neen.id,   paymentType: "Visa",       status: "Paid",    serviceType: "Windshield",    price: 350, vehicleType: "Sedan",       code: "DW1000", distributor: "M", createdAt: thisMonth(3)  },
    { customerId: carlos.id, paymentType: "Cash",       status: "Paid",    serviceType: "Chip Repair",   price: 75,  vehicleType: "Truck",       code: "CR",     distributor: "M", createdAt: thisMonth(5)  },
    { customerId: sandra.id, paymentType: "Etransfer",  status: "Pending", serviceType: "Door Glass",    price: 220, vehicleType: "Suv",         code: "DW1234",                   createdAt: thisMonth(7)  },
    { customerId: derek.id,  paymentType: "Cheque",     status: "Overdue", serviceType: "Back Glass",    price: 480, vehicleType: "Minivan",     code: "DW3000", distributor: "T", createdAt: thisMonth(8)  },
    { customerId: priya.id,  paymentType: "Debit",      status: "Paid",    serviceType: "Sunroof",       price: 600, vehicleType: "Coupe",       code: "DW3456",                   createdAt: thisMonth(10) },
    { customerId: tom.id,    paymentType: "Visa",       status: "Draft",   serviceType: "Quarter Glass", price: 180, vehicleType: "Hatchback",   code: "DW5678", distributor: "M", createdAt: thisMonth(12) },
    { customerId: fatima.id, paymentType: "Mastercard", status: "Paid",    serviceType: "Windshield",    price: 130, vehicleType: "Sedan",       code: "DW6000",                   createdAt: thisMonth(14) },
    { customerId: james.id,  paymentType: "Cash",       status: "Pending", serviceType: "Windshield",    price: 375, vehicleType: "Convertible", code: "DW3000", distributor: "T", createdAt: thisMonth(15) },
    // ── last month ──
    { customerId: alex.id,   paymentType: "Visa",       status: "Paid",    serviceType: "Windshield",    price: 320, vehicleType: "Sedan",       code: "DW1000", distributor: "M", createdAt: lastMonth(5)  },
    { customerId: neen.id,   paymentType: "Cash",       status: "Paid",    serviceType: "Chip Repair",   price: 75,  vehicleType: "Suv",         code: "CR",     distributor: "M", createdAt: lastMonth(10) },
    { customerId: carlos.id, paymentType: "Etransfer",  status: "Paid",    serviceType: "Door Glass",    price: 200, vehicleType: "Truck",       code: "DW1234",                   createdAt: lastMonth(14) },
    { customerId: sandra.id, paymentType: "Debit",      status: "Overdue", serviceType: "Windshield",    price: 400, vehicleType: "Suv",         code: "DW2000", distributor: "M", createdAt: lastMonth(18) },
    { customerId: derek.id,  paymentType: "Cash",       status: "Paid",    serviceType: "Back Glass",    price: 300, vehicleType: "Minivan",     code: "DW3000",                   createdAt: lastMonth(22) },
    { customerId: priya.id,  paymentType: "Mastercard", status: "Draft",   serviceType: "Sunroof",       price: 550, vehicleType: "Coupe",       code: "DW3456", distributor: "T", createdAt: lastMonth(25) },
    { customerId: tom.id,    paymentType: "Visa",       status: "Pending", serviceType: "Windshield",    price: 320, vehicleType: "Hatchback",   code: "DW5678",                   createdAt: lastMonth(28) },
    // ── two months ago ──
    { customerId: fatima.id, paymentType: "Cash",       status: "Paid",    serviceType: "Chip Repair",   price: 75,  vehicleType: "Sedan",       code: "CR",     distributor: "M", createdAt: twoAgo(8)     },
    { customerId: james.id,  paymentType: "Visa",       status: "Paid",    serviceType: "Windshield",    price: 350, vehicleType: "Suv",         code: "DW1000", distributor: "M", createdAt: twoAgo(15)    },
    { customerId: alex.id,   paymentType: "Etransfer",  status: "Paid",    serviceType: "Back Glass",    price: 280, vehicleType: "Minivan",     code: "DW3000",                   createdAt: twoAgo(20)    },
    // ── pagination test: 15 invoices for PageTest ──
    { customerId: pageTest.id, paymentType: "Cash",       status: "Paid",    serviceType: "Windshield",    price: 350, vehicleType: "Sedan",       code: "DW1000", distributor: "M", createdAt: thisMonth(2)  },
    { customerId: pageTest.id, paymentType: "Visa",       status: "Paid",    serviceType: "Chip Repair",   price: 75,  vehicleType: "Truck",       code: "CR",     distributor: "M", createdAt: thisMonth(3)  },
    { customerId: pageTest.id, paymentType: "Etransfer",  status: "Pending", serviceType: "Door Glass",    price: 220, vehicleType: "Suv",         code: "DW1234",                   createdAt: thisMonth(4)  },
    { customerId: pageTest.id, paymentType: "Cheque",     status: "Overdue", serviceType: "Back Glass",    price: 480, vehicleType: "Minivan",     code: "DW3000", distributor: "T", createdAt: lastMonth(5)  },
    { customerId: pageTest.id, paymentType: "Debit",      status: "Paid",    serviceType: "Sunroof",       price: 600, vehicleType: "Coupe",       code: "DW3456",                   createdAt: lastMonth(8)  },
    { customerId: pageTest.id, paymentType: "Visa",       status: "Draft",   serviceType: "Quarter Glass", price: 180, vehicleType: "Hatchback",   code: "DW5678", distributor: "M", createdAt: lastMonth(11) },
    { customerId: pageTest.id, paymentType: "Mastercard", status: "Paid",    serviceType: "Windshield",    price: 130, vehicleType: "Sedan",       code: "DW6000",                   createdAt: lastMonth(14) },
    { customerId: pageTest.id, paymentType: "Cash",       status: "Pending", serviceType: "Windshield",    price: 375, vehicleType: "Convertible", code: "DW3000", distributor: "T", createdAt: lastMonth(17) },
    { customerId: pageTest.id, paymentType: "Visa",       status: "Paid",    serviceType: "Chip Repair",   price: 75,  vehicleType: "Sedan",       code: "CR",     distributor: "M", createdAt: twoAgo(5)     },
    { customerId: pageTest.id, paymentType: "Etransfer",  status: "Paid",    serviceType: "Door Glass",    price: 200, vehicleType: "Truck",       code: "DW1234",                   createdAt: twoAgo(8)     },
    { customerId: pageTest.id, paymentType: "Debit",      status: "Overdue", serviceType: "Windshield",    price: 400, vehicleType: "Suv",         code: "DW2000", distributor: "M", createdAt: twoAgo(11)    },
    { customerId: pageTest.id, paymentType: "Cash",       status: "Paid",    serviceType: "Back Glass",    price: 300, vehicleType: "Minivan",     code: "DW3000",                   createdAt: twoAgo(14)    },
    { customerId: pageTest.id, paymentType: "Mastercard", status: "Draft",   serviceType: "Sunroof",       price: 550, vehicleType: "Coupe",       code: "DW3456", distributor: "T", createdAt: twoAgo(17)    },
    { customerId: pageTest.id, paymentType: "Visa",       status: "Pending", serviceType: "Windshield",    price: 320, vehicleType: "Hatchback",   code: "DW5678",                   createdAt: twoAgo(20)    },
    { customerId: pageTest.id, paymentType: "Cash",       status: "Paid",    serviceType: "Chip Repair",   price: 75,  vehicleType: "Sedan",       code: "CR",     distributor: "M", createdAt: twoAgo(23)    },
  ];

  const odetailInvoices: Array<{ id: number; services: Array<{ id: number; price: number; serviceType: string }>; paymentType: string | null; createdAt: Date }> = [];
  for (const row of odetailInvoiceRows) {
    const inv = await prisma.invoice.create({
      data: {
        companyId: odetail.id,
        customerId: row.customerId,
        paymentType: row.paymentType,
        status: row.status,
        createdAt: row.createdAt,
        services: {
          create: {
            companyId: odetail.id,
            serviceType: row.serviceType,
            price: row.price,
            quantity: 1,
            vehicleType: row.vehicleType,
            code: row.code,
            distributor: row.distributor,
            createdAt: row.createdAt,
          },
        },
      },
      include: { services: true },
    });
    odetailInvoices.push(inv);
  }
  console.log(`odetail invoices created: ${odetailInvoices.length}`);

  // ─────────────────────────────────────────────
  // 8. AZTEC APPOINTMENTS & INVOICES (downtown)
  // ─────────────────────────────────────────────
  type AztecApptEntry = {
    customer: typeof maria; title: string; start: Date; end: Date;
    status: string; serviceType: string; price: number; vehicleType: VehicleType;
    code: string; distributor?: string; paymentType: string;
    invoiceStatus: InvoiceStatus | null; // null = no invoice yet
  };

  const downtownAppts: AztecApptEntry[] = [
    { customer: maria,  title: "Windshield Replacement", start: thisMonth(5,  9), end: thisMonth(5,  11), status: "Completed", serviceType: "Windshield",   price: 400, vehicleType: "Suv",     code: "DW2000",              paymentType: "Mastercard", invoiceStatus: "Paid"    },
    { customer: ryan,   title: "Chip Repair",            start: thisMonth(8,  10), end: thisMonth(8,  11), status: "Confirmed", serviceType: "Chip Repair",  price: 75,  vehicleType: "Sedan",   code: "CR",     distributor: "M", paymentType: "Cash",       invoiceStatus: "Pending" },
    { customer: lisa,   title: "Door Glass Replacement", start: thisMonth(12, 14), end: thisMonth(12, 16), status: "Confirmed", serviceType: "Door Glass",   price: 220, vehicleType: "Truck",   code: "DW1234",              paymentType: "Etransfer",  invoiceStatus: "Pending" },
    { customer: maria,  title: "Back Glass Replacement", start: lastMonth(10, 9),  end: lastMonth(10, 11), status: "Completed", serviceType: "Back Glass",   price: 300, vehicleType: "Suv",     code: "DW3000", distributor: "T", paymentType: "Visa",       invoiceStatus: "Paid"    },
    { customer: ahmed,  title: "Windshield Replacement", start: lastMonth(20, 10), end: lastMonth(20, 12), status: "Completed", serviceType: "Windshield",   price: 350, vehicleType: "Minivan", code: "DW1000", distributor: "M", paymentType: "Cash",       invoiceStatus: "Paid"    },
    { customer: ryan,   title: "Windshield Replacement", start: twoAgo(8,  9),    end: twoAgo(8,  11),    status: "Completed", serviceType: "Windshield",   price: 370, vehicleType: "Sedan",   code: "DW1000", distributor: "M", paymentType: "Visa",       invoiceStatus: "Paid"    },
    // upcoming (calendar test)
    { customer: ryan,   title: "ADAS Calibration",       start: d(0, now.getDate() + 2, 10), end: d(0, now.getDate() + 2, 12), status: "Confirmed", serviceType: "ADAS Calibration", price: 120, vehicleType: "Sedan", code: "ADAS", paymentType: "Visa", invoiceStatus: null },
    { customer: lisa,   title: "Quarter Glass",          start: d(0, now.getDate() + 5, 13), end: d(0, now.getDate() + 5, 15), status: "Confirmed", serviceType: "Quarter Glass",    price: 180, vehicleType: "Truck", code: "DW5678", distributor: "M", paymentType: "Etransfer", invoiceStatus: null },
  ];

  for (const appt of downtownAppts) {
    const a = await prisma.appointment.create({
      data: {
        title: `${appt.title} - ${appt.customer.firstName} ${appt.customer.lastName}`,
        startTime: appt.start,
        endTime: appt.end,
        status: appt.status,
        companyId: aztec.id,
        customerId: appt.customer.id,
        locationId: downtown.id,
        services: {
          create: {
            companyId: aztec.id,
            serviceType: appt.serviceType,
            price: appt.price,
            quantity: 1,
            vehicleType: appt.vehicleType,
            code: appt.code,
            distributor: appt.distributor,
            locationId: downtown.id,
            createdAt: appt.start,
          },
        },
      },
      include: { services: true },
    });

    if (appt.invoiceStatus) {
      await prisma.invoice.create({
        data: {
          companyId: aztec.id,
          customerId: appt.customer.id,
          appointmentId: a.id,
          paymentType: appt.paymentType,
          status: appt.invoiceStatus,
          locationId: downtown.id,
          createdAt: appt.start,
          services: { connect: a.services.map((s) => ({ id: s.id })) },
        },
      });
    }
  }
  console.log(`Aztec downtown appointments: ${downtownAppts.length}`);

  // ─────────────────────────────────────────────
  // 9. AZTEC APPOINTMENTS & INVOICES (airdrie)
  // ─────────────────────────────────────────────
  type AirdrieEntry = {
    customer: typeof tyler; serviceType: string; price: number;
    vehicleType: VehicleType; code: string; distributor?: string;
    paymentType: string; status: InvoiceStatus; createdAt: Date;
  };

  const airdrieRows: AirdrieEntry[] = [
    { customer: tyler,   serviceType: "Windshield",   price: 360, vehicleType: "Sedan", code: "DW1000", distributor: "M", paymentType: "Cash",     status: "Paid",    createdAt: thisMonth(6)  },
    { customer: jessica, serviceType: "Chip Repair",  price: 75,  vehicleType: "Suv",   code: "CR",     distributor: "M", paymentType: "Visa",     status: "Paid",    createdAt: thisMonth(11) },
    { customer: tyler,   serviceType: "Back Glass",   price: 290, vehicleType: "Truck", code: "DW3000", distributor: "T", paymentType: "Etransfer",status: "Overdue", createdAt: lastMonth(15) },
    { customer: jessica, serviceType: "Door Glass",   price: 210, vehicleType: "Sedan", code: "DW1234",                   paymentType: "Debit",    status: "Paid",    createdAt: lastMonth(22) },
    { customer: tyler,   serviceType: "Windshield",   price: 355, vehicleType: "Sedan", code: "DW1000", distributor: "M", paymentType: "Cash",     status: "Paid",    createdAt: twoAgo(10)    },
  ];

  for (const row of airdrieRows) {
    const appt = await prisma.appointment.create({
      data: {
        title: `${row.serviceType} - ${row.customer.firstName} ${row.customer.lastName}`,
        startTime: row.createdAt,
        endTime: new Date(row.createdAt.getTime() + 2 * 60 * 60 * 1000),
        status: row.status === "Paid" ? "Completed" : "Completed",
        companyId: aztec.id,
        customerId: row.customer.id,
        locationId: airdrie.id,
        services: {
          create: {
            companyId: aztec.id,
            serviceType: row.serviceType,
            price: row.price,
            quantity: 1,
            vehicleType: row.vehicleType,
            code: row.code,
            distributor: row.distributor,
            locationId: airdrie.id,
            createdAt: row.createdAt,
          },
        },
      },
      include: { services: true },
    });

    await prisma.invoice.create({
      data: {
        companyId: aztec.id,
        customerId: row.customer.id,
        appointmentId: appt.id,
        paymentType: row.paymentType,
        status: row.status,
        locationId: airdrie.id,
        createdAt: row.createdAt,
        services: { connect: appt.services.map((s) => ({ id: s.id })) },
      },
    });
  }
  console.log(`Aztec airdrie appointments: ${airdrieRows.length}`);

  // ─────────────────────────────────────────────
  // 10. REVENUE ENTRIES (billing page — paid invoices only)
  // ─────────────────────────────────────────────
  const makeRevenue = (grossSales: number, paymentType: string | null, companyId: string, locationId?: string) => {
    const grossSalesGst  = grossSales * 1.05;
    const costBeforeGst  = Math.round(grossSales * 0.55);
    const costAfterGst   = costBeforeGst * 1.05;
    const shopFees       = grossSales * 0.05;
    const labour         = grossSales * 0.15;
    const jobNet         = grossSales - costAfterGst;
    const subNet         = jobNet - shopFees;
    const trueNet        = subNet - labour;
    return {
      companyId,
      locationId,
      grossSales,
      grossSalesGst,
      costBeforeGst,
      costAfterGst,
      shopFees,
      labour,
      jobNet,
      subNet,
      trueNet,
      materialCost: costBeforeGst,
      totalWindshields: 0,
      totalChipRepairs: 0,
      totalWarranties: 0,
      visa:       paymentType === "Visa"       ? 1 : 0,
      mastercard: paymentType === "Mastercard" ? 1 : 0,
      debit:      paymentType === "Debit"      ? 1 : 0,
      cash:       paymentType === "Cash"       ? 1 : 0,
      etransfer:  paymentType === "Etransfer"  ? 1 : 0,
      amex:       paymentType === "Amex"       ? 1 : 0,
    };
  };

  const paidOdetail = await prisma.invoice.findMany({
    where: { companyId: odetail.id, status: "Paid" },
    include: { services: true },
  });
  for (const inv of paidOdetail) {
    for (const svc of inv.services) {
      const base = makeRevenue(svc.price, inv.paymentType, odetail.id);
      await prisma.revenue.create({
        data: {
          ...base,
          serviceId: svc.id,
          totalWindshields: svc.serviceType.toLowerCase().includes("windshield") ? 1 : 0,
          totalChipRepairs: svc.serviceType.toLowerCase().includes("chip")        ? 1 : 0,
          createdAt: inv.createdAt,
        },
      });
    }
  }

  const paidAztecDowntown = await prisma.invoice.findMany({
    where: { companyId: aztec.id, locationId: downtown.id, status: "Paid" },
    include: { services: true },
  });
  for (const inv of paidAztecDowntown) {
    for (const svc of inv.services) {
      const base = makeRevenue(svc.price, inv.paymentType, aztec.id, downtown.id);
      await prisma.revenue.create({
        data: {
          ...base,
          serviceId: svc.id,
          totalWindshields: svc.serviceType.toLowerCase().includes("windshield") ? 1 : 0,
          totalChipRepairs: svc.serviceType.toLowerCase().includes("chip")        ? 1 : 0,
          createdAt: inv.createdAt,
        },
      });
    }
  }

  const paidAztecAirdrie = await prisma.invoice.findMany({
    where: { companyId: aztec.id, locationId: airdrie.id, status: "Paid" },
    include: { services: true },
  });
  for (const inv of paidAztecAirdrie) {
    for (const svc of inv.services) {
      const base = makeRevenue(svc.price, inv.paymentType, aztec.id, airdrie.id);
      await prisma.revenue.create({
        data: {
          ...base,
          serviceId: svc.id,
          totalWindshields: svc.serviceType.toLowerCase().includes("windshield") ? 1 : 0,
          totalChipRepairs: svc.serviceType.toLowerCase().includes("chip")        ? 1 : 0,
          createdAt: inv.createdAt,
        },
      });
    }
  }
  console.log("Revenue entries created.");

  // ─────────────────────────────────────────────
  // 11. EXPENSES
  // ─────────────────────────────────────────────
  type ExpenseRow = {
    description: string; cost: number; date: Date;
    isRent?: boolean; isWage?: boolean; paymentType?: string;
    companyId: string; locationId?: string;
  };

  const expenseRows: ExpenseRow[] = [
    // odetail – this month
    { description: "Shop Rent",             cost: 2500, isRent: true, paymentType: "Cheque",    companyId: odetail.id, date: thisMonth(1)  },
    { description: "Technician Wages",      cost: 3200, isWage: true, paymentType: "Etransfer", companyId: odetail.id, date: thisMonth(15) },
    { description: "Adhesive & Materials",  cost: 450,                paymentType: "Visa",      companyId: odetail.id, date: thisMonth(7)  },
    { description: "Cleaning Supplies",     cost: 120,                paymentType: "Cash",      companyId: odetail.id, date: thisMonth(10) },
    // odetail – last month
    { description: "Shop Rent",             cost: 2500, isRent: true, paymentType: "Cheque",    companyId: odetail.id, date: lastMonth(1)  },
    { description: "Technician Wages",      cost: 3100, isWage: true, paymentType: "Etransfer", companyId: odetail.id, date: lastMonth(15) },
    { description: "Adhesive & Materials",  cost: 380,                paymentType: "Visa",      companyId: odetail.id, date: lastMonth(12) },
    // odetail – two months ago
    { description: "Shop Rent",             cost: 2500, isRent: true, paymentType: "Cheque",    companyId: odetail.id, date: twoAgo(1)     },
    { description: "Technician Wages",      cost: 3000, isWage: true, paymentType: "Etransfer", companyId: odetail.id, date: twoAgo(15)    },
    // aztec downtown – this month
    { description: "Shop Rent",             cost: 3500, isRent: true, paymentType: "Cheque",    companyId: aztec.id, locationId: downtown.id, date: thisMonth(1)  },
    { description: "Technician Wages",      cost: 4200, isWage: true, paymentType: "Etransfer", companyId: aztec.id, locationId: downtown.id, date: thisMonth(15) },
    { description: "Glass Materials",       cost: 600,                paymentType: "Visa",      companyId: aztec.id, locationId: downtown.id, date: thisMonth(8)  },
    // aztec downtown – last month
    { description: "Shop Rent",             cost: 3500, isRent: true, paymentType: "Cheque",    companyId: aztec.id, locationId: downtown.id, date: lastMonth(1)  },
    { description: "Technician Wages",      cost: 4000, isWage: true, paymentType: "Etransfer", companyId: aztec.id, locationId: downtown.id, date: lastMonth(15) },
    { description: "Glass Materials",       cost: 520,                paymentType: "Visa",      companyId: aztec.id, locationId: downtown.id, date: lastMonth(10) },
    // aztec airdrie – this month
    { description: "Shop Rent",             cost: 2200, isRent: true, paymentType: "Cheque",    companyId: aztec.id, locationId: airdrie.id, date: thisMonth(1)  },
    { description: "Technician Wages",      cost: 3000, isWage: true, paymentType: "Etransfer", companyId: aztec.id, locationId: airdrie.id, date: thisMonth(15) },
    // aztec airdrie – last month
    { description: "Shop Rent",             cost: 2200, isRent: true, paymentType: "Cheque",    companyId: aztec.id, locationId: airdrie.id, date: lastMonth(1)  },
    { description: "Technician Wages",      cost: 2900, isWage: true, paymentType: "Etransfer", companyId: aztec.id, locationId: airdrie.id, date: lastMonth(15) },
  ];

  for (const row of expenseRows) {
    await prisma.expense.create({
      data: {
        description: row.description,
        cost: row.cost,
        date: row.date,
        isRent: row.isRent,
        isWage: row.isWage,
        paymentType: row.paymentType,
        companyId: row.companyId,
        locationId: row.locationId,
        createdAt: row.date,
      },
    });
  }
  console.log(`Expenses created: ${expenseRows.length}`);

  // ─────────────────────────────────────────────
  // 12. STATEMENTS + PAYMENTS
  // ─────────────────────────────────────────────
  const odetailRevs = await prisma.revenue.findMany({ where: { companyId: odetail.id }, take: 4 });
  if (odetailRevs.length > 0) {
    const stmt = await prisma.statement.create({
      data: {
        companyId: odetail.id,
        startDate: lastMonth(1),
        endDate: lastMonth(28),
        distributor: "M",
        grossSalesGst: 1575,
        costBeforeGst: 850,
        costAfterGst: 892.5,
        amountPaid: 500,
        amountDue: 392.5,
        invoiceAmount: 1500,
        revenues: { connect: odetailRevs.map((r) => ({ id: r.id })) },
      },
    });
    await prisma.payment.create({
      data: {
        companyId: odetail.id,
        statementId: stmt.id,
        amount: 500,
        paymentType: "Cheque",
        note: "Partial payment – Feb distributor statement",
        paymentDate: thisMonth(5),
      },
    });
    console.log("odetail statement + payment created.");
  }

  const aztecDtRevs = await prisma.revenue.findMany({ where: { companyId: aztec.id, locationId: downtown.id }, take: 4 });
  if (aztecDtRevs.length > 0) {
    const stmt = await prisma.statement.create({
      data: {
        companyId: aztec.id,
        locationId: downtown.id,
        startDate: lastMonth(1),
        endDate: lastMonth(28),
        distributor: "M",
        grossSalesGst: 2205,
        costBeforeGst: 1155,
        costAfterGst: 1212.75,
        amountPaid: 1212.75,
        amountDue: 0,
        invoiceAmount: 2100,
        revenues: { connect: aztecDtRevs.map((r) => ({ id: r.id })) },
      },
    });
    await prisma.payment.create({
      data: {
        companyId: aztec.id,
        locationId: downtown.id,
        statementId: stmt.id,
        amount: 1212.75,
        paymentType: "Etransfer",
        note: "Full payment – Feb distributor statement",
        paymentDate: thisMonth(3),
      },
    });
    console.log("aztec downtown statement + payment created.");
  }

  const aztecAdRevs = await prisma.revenue.findMany({ where: { companyId: aztec.id, locationId: airdrie.id }, take: 3 });
  if (aztecAdRevs.length > 0) {
    const stmt = await prisma.statement.create({
      data: {
        companyId: aztec.id,
        locationId: airdrie.id,
        startDate: lastMonth(1),
        endDate: lastMonth(28),
        distributor: "M",
        grossSalesGst: 945,
        costBeforeGst: 495,
        costAfterGst: 519.75,
        amountPaid: 0,
        amountDue: 519.75,
        invoiceAmount: 900,
        revenues: { connect: aztecAdRevs.map((r) => ({ id: r.id })) },
      },
    });
    await prisma.payment.create({
      data: {
        companyId: aztec.id,
        locationId: airdrie.id,
        statementId: stmt.id,
        amount: 259.88,
        paymentType: "Cheque",
        note: "Partial payment – Feb distributor statement",
        paymentDate: thisMonth(8),
      },
    });
    console.log("aztec airdrie statement + payment created.");
  }

  // ─────────────────────────────────────────────
  // 13. QUOTES (Draft / Sent / Accepted statuses)
  // ─────────────────────────────────────────────
  type QuoteEntry = {
    companyId: string; customerId: string; customerType: string;
    status: string; notes?: string; locationId?: string;
    serviceType: string; price: number; vehicleType: VehicleType;
    code: string; distributor?: string;
  };

  const quoteRows: QuoteEntry[] = [
    // odetail
    { companyId: odetail.id, customerId: alex.id,   customerType: "Retailer", status: "Draft",    notes: "Customer wants windshield replaced, has comprehensive insurance", serviceType: "Windshield",   price: 350, vehicleType: "Sedan",   code: "DW1000", distributor: "M" },
    { companyId: odetail.id, customerId: carlos.id, customerType: "Retailer", status: "Sent",     notes: "Small chip near driver's field of view",                          serviceType: "Chip Repair",  price: 75,  vehicleType: "Truck",   code: "CR",     distributor: "M" },
    { companyId: odetail.id, customerId: tom.id,    customerType: "Fleet",    status: "Accepted", notes: "Fleet account – quarterly glass maintenance",                     serviceType: "Door Glass",   price: 220, vehicleType: "Hatchback",code: "DW1234"                  },
    { companyId: odetail.id, customerId: sandra.id, customerType: "Retailer", status: "Draft",    notes: "Back glass shattered in parking lot",                            serviceType: "Back Glass",   price: 480, vehicleType: "Suv",     code: "DW3000", distributor: "T" },
    // aztec downtown
    { companyId: aztec.id, locationId: downtown.id, customerId: ryan.id,  customerType: "Retailer", status: "Draft",    notes: "Windshield cracked from rock chip",                serviceType: "Windshield",       price: 400, vehicleType: "Sedan", code: "DW2000", distributor: "M" },
    { companyId: aztec.id, locationId: downtown.id, customerId: lisa.id,  customerType: "Fleet",    status: "Accepted", notes: "Fleet vehicle – back glass replacement",           serviceType: "Back Glass",       price: 300, vehicleType: "Truck", code: "DW3000", distributor: "T" },
    { companyId: aztec.id, locationId: downtown.id, customerId: ahmed.id, customerType: "Vendor",   status: "Sent",     notes: "Vendor account – windshield with ADAS calibration",serviceType: "ADAS Calibration", price: 120, vehicleType: "Suv",   code: "ADAS"                    },
    // aztec airdrie
    { companyId: aztec.id, locationId: airdrie.id, customerId: tyler.id,   customerType: "Retailer", status: "Sent",  notes: "ADAS recalibration after windshield replacement",  serviceType: "ADAS Calibration", price: 120, vehicleType: "Suv",   code: "ADAS"  },
    { companyId: aztec.id, locationId: airdrie.id, customerId: jessica.id, customerType: "Retailer", status: "Draft", notes: "Quarter glass cracked",                            serviceType: "Quarter Glass",    price: 180, vehicleType: "Sedan", code: "DW5678", distributor: "M" },
  ];

  for (const q of quoteRows) {
    await prisma.quote.create({
      data: {
        companyId: q.companyId,
        customerId: q.customerId,
        customerType: q.customerType,
        status: q.status,
        notes: q.notes,
        locationId: q.locationId,
        services: {
          create: {
            companyId: q.companyId,
            serviceType: q.serviceType,
            price: q.price,
            quantity: 1,
            vehicleType: q.vehicleType,
            code: q.code,
            distributor: q.distributor,
            locationId: q.locationId,
          },
        },
      },
    });
  }
  console.log(`Quotes created: ${quoteRows.length}`);
}

main()
  .then(async () => {
    console.log("\n✓ Seed complete.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { calculateCreditAgingBuckets, calculateInvoiceTotals, convertDateToUTC, formatPhoneNumber } from "@/lib/util";
import { Customer, Invoice, Service, prisma } from "@repo/database";
import { notFound } from "next/navigation";
import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
  renderToStream,
  Font,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";

type InvoiceWithServices = Invoice & { services: Service[] };

interface CustomerStatementProps {
  customer: Customer;
  invoices: InvoiceWithServices[];
  startDate: string;
  endDate: string;
  totals: {
    subtotal: string;
    gst: string;
    total: string;
  };
  chargeTotals: {
    subtotal: string;
    gst: string;
    total: string;
  };
  aging: {
    current: number;
    thirty: number;
    sixty: number;
    sixtyPlus: number;
  };
}

Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: `https://res.cloudinary.com/autolinkpro-prod/raw/upload/v1741110359/fonts/wikei0s9piuzvompfnge.ttf`,
      fontWeight: "normal",
    },
    {
      src: `https://res.cloudinary.com/autolinkpro-prod/raw/upload/v1741110315/fonts/pfoei2wt6396lqtvokgr.ttf`,
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      src: `https://res.cloudinary.com/autolinkpro-prod/raw/upload/v1743790550/fonts/sdsmolxgj9u4a8suejfs.ttf`,
      fontWeight: "semibold",
    },
    {
      src: `https://res.cloudinary.com/autolinkpro-prod/raw/upload/v1741110260/fonts/u4hlhwpkcn7mnrj2rgug.ttf`,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Montserrat",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  leftColumn: {
    flexDirection: "column",
  },
  rightColumn: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  supplierInfo: {
    flexDirection: "row",
    fontSize: 10,
  },
  supplierInfoTitle: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 5,
  },
  logo: {
    width: 130,
    height: 70,
    marginBottom: 8,
    marginRight: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "right",
  },
  customerName: {
    fontSize: 11,
    fontWeight: "semibold",
    textAlign: "right",
    marginBottom: 3,
  },
  dateLabel: {
    textAlign: "right",
  },
  dateFromToContainer: {
    marginTop: 5,
  },
  dateCreatedContainer: {
    marginTop: 2,
    marginBottom: 2,
  },
  statementDateCreated: {
    fontWeight: "semibold",
    textAlign: "right",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  columnDate: { width: "15%", textAlign: "left" },
  columnInvoice: { width: "20%", textAlign: "right" },
  columnDesc: { width: "25%", textAlign: "right" },
  columnCharges: { width: "20%", textAlign: "right" },
  columnBalance: { width: "20%", textAlign: "right" },
  agingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 8,
  },
  agingBox: {
    width: "23%",
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
    alignItems: "center",
  },
  agingLabel: {
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 4,
  },
  agingValue: {
    fontSize: 10,
  },
  totalsContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 8,
  },
  totalsColumn: {
    width: "13%",
  },
  totalsLabel: {
    fontWeight: "bold",
    fontSize: 10,
  },
  totalsLabelDue: {
    fontWeight: "bold",
    fontSize: 10,
    marginTop: 10,
  },
  totalsValue: {
    fontSize: 10,
    textAlign: "right",
  },
  totalsValueDue: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 10,
  },
});

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${mm}-${dd}-${yy}`;
};

const CustomerStatementDocument = ({
  customer,
  invoices,
  startDate,
  endDate,
  totals,
  chargeTotals,
  aging,
}: CustomerStatementProps) => {
  const rows = invoices.map((invoice, idx) => {
    const dateStr = formatDate(invoice.createdAt);
    const invoiceNo = invoice.id.toString().padStart(6, "0");
    const desc = invoice.services.map((s) => s.code).join(", ");
    const invoiceTotal = invoice.services.reduce((acc, s) => acc + s.price, 0);
    const isPaid = invoice.status === "Paid";
    const charges = isPaid ? invoiceTotal.toFixed(2) : "0.00";
    const balance = isPaid ? "0.00" : invoiceTotal.toFixed(2);

    return (
      <View style={styles.tableRow} key={idx}>
        <Text style={styles.columnDate}>{dateStr}</Text>
        <Text style={styles.columnInvoice}>{invoiceNo}</Text>
        <Text style={styles.columnDesc}>{desc}</Text>
        <Text style={styles.columnCharges}>${charges}</Text>
        <Text style={styles.columnBalance}>${balance}</Text>
      </View>
    );
  });

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);
  const today = formatDate(new Date());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.leftColumn}>
            <View style={styles.supplierInfo}>
              <Image
                src="https://res.cloudinary.com/autolinkpro-prod/image/upload/v1740790228/odetail/assets/nzmcwc4fkcneh3wvg40h.png"
                style={styles.logo}
              />
              <View>
                <Text style={styles.supplierInfoTitle}>O Detail</Text>
                <Text>{formatPhoneNumber("5873662254")}</Text>
                <Text>invoices@odetail.ca</Text>
                <Text>GST/HST: 723288155RT0001</Text>
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.title}>INVOICE STATEMENT</Text>
            <Text style={styles.customerName}>
              {customer.firstName} {customer.lastName}
            </Text>
            <View style={styles.dateCreatedContainer}>
              <Text style={styles.statementDateCreated}>
                Statement Date: {today}
              </Text>
            </View>
            <View style={styles.dateFromToContainer}>
              <Text style={styles.dateLabel}>Date From: {formattedStart}</Text>
              <Text style={styles.dateLabel}>Date To: {formattedEnd}</Text>
            </View>
          </View>
        </View>

        {/* TABLE HEADER */}
        <View style={styles.tableHeader}>
          <Text style={styles.columnDate}>DATE</Text>
          <Text style={styles.columnInvoice}>INVOICE NO.</Text>
          <Text style={styles.columnDesc}>DESCRIPTION</Text>
          <Text style={styles.columnCharges}>CHARGES</Text>
          <Text style={styles.columnBalance}>BALANCE</Text>
        </View>

        {/* TABLE ROWS */}
        {rows.length ? rows : <Text>No invoices found for this period</Text>}

        {/* AGING BUCKETS */}
        <View style={styles.agingContainer}>
          <View style={styles.agingBox}>
            <Text style={styles.agingLabel}>CURRENT</Text>
            <Text style={styles.agingValue}>${aging.current.toFixed(2)}</Text>
          </View>
          <View style={styles.agingBox}>
            <Text style={styles.agingLabel}>OVER 30 DAYS</Text>
            <Text style={styles.agingValue}>${aging.thirty.toFixed(2)}</Text>
          </View>
          <View style={styles.agingBox}>
            <Text style={styles.agingLabel}>OVER 60 DAYS</Text>
            <Text style={styles.agingValue}>${aging.sixty.toFixed(2)}</Text>
          </View>
          <View style={styles.agingBox}>
            <Text style={styles.agingLabel}>OVER 90 DAYS</Text>
            <Text style={styles.agingValue}>${aging.sixtyPlus.toFixed(2)}</Text>
          </View>
        </View>

        {/* TOTALS */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsColumn}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsLabel}>GST (5%)</Text>
            <Text style={styles.totalsLabelDue}>Total Charge</Text>
          </View>
          <View style={styles.totalsColumn}>
            <Text style={styles.totalsValue}>${chargeTotals.subtotal}</Text>
            <Text style={styles.totalsValue}>${chargeTotals.gst}</Text>
            <Text style={styles.totalsValueDue}>${chargeTotals.total}</Text>
          </View>
          <View style={[styles.totalsColumn, { marginLeft: 20 }]}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsLabel}>GST (5%)</Text>
            <Text style={styles.totalsLabelDue}>Total Balance</Text>
          </View>
          <View style={styles.totalsColumn}>
            <Text style={styles.totalsValue}>${totals.subtotal}</Text>
            <Text style={styles.totalsValue}>${totals.gst}</Text>
            <Text style={styles.totalsValueDue}>${totals.total}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate query params are required" },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  });

  if (!customer) {
    return notFound();
  }

  const start = convertDateToUTC(new Date(startDate));
  const end = convertDateToUTC(new Date(endDate));
  end.setHours(23, 59, 59, 999);

  const invoices = await prisma.invoice.findMany({
    where: {
      customerId: params.id,
      companyId: "odetail",
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      services: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const unpaidInvoices = invoices.filter((inv) => inv.status !== "Paid");
  const paidInvoices = invoices.filter((inv) => inv.status === "Paid");

  const unpaidServices = unpaidInvoices.flatMap((inv) => inv.services);
  const paidServices = paidInvoices.flatMap((inv) => inv.services);
  const totals = calculateInvoiceTotals(unpaidServices);
  const chargeTotals = calculateInvoiceTotals(paidServices);

  const agingRevenues = unpaidInvoices.map((inv) => ({
    createdAt: inv.createdAt,
    costBeforeGst: inv.services.reduce((acc, s) => acc + s.price, 0),
  }));
  const { current, thirty, sixty, sixtyPlus } = calculateCreditAgingBuckets(agingRevenues, 0);
  const aging = { current, thirty, sixty, sixtyPlus };

  const stream = await renderToStream(
    <CustomerStatementDocument
      customer={customer}
      invoices={invoices}
      startDate={startDate}
      endDate={endDate}
      totals={totals}
      chargeTotals={chargeTotals}
      aging={aging}
    />
  );

  return new NextResponse(stream as unknown as ReadableStream);
}

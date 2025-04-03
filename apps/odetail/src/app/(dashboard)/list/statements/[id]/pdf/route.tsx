import { calculateCreditAgingBuckets, formatPhoneNumber } from "@/lib/util";
import {
  Invoice,
  Payment,
  Revenue,
  Service,
  Statement,
  prisma,
} from "@repo/database";
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
  pdf,
  renderToBuffer,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";

type ExtendedRevenue = Revenue & {
  service: (Service & { invoice: Invoice | null }) | null;
};
type SingleStatement =
  | (Statement & { revenues: Revenue[]; payments: Payment[] })
  | null;

interface StatementProps {
  statement: SingleStatement;
  items: ExtendedRevenue[];
  amountPaid: number;
  buckets: {
    currentAmount: number;
    thirtyDayAmount: number;
    sixtyDayAmount: number;
    sixtyPlusAmount: number;
    amountDue: number;
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
      src: `https://res.cloudinary.com/autolinkpro-prod/raw/upload/v1741110260/fonts/u4hlhwpkcn7mnrj2rgug.ttf`,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Montserrat", // Or system default
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
  logo: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "right",
  },
  statementDate: {
    marginTop: 2,
  },
  companyInfo: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 5,
    fontWeight: "bold",
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
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
  },
  agingItem: {
    width: "20%", // 5 columns => 20% each
    textAlign: "center",
  },
  agingLabel: {
    fontWeight: "bold",
    fontSize: 10,
  },
  agingValue: {
    marginTop: 2,
    fontSize: 10,
  },
});

const StatementDocument = ({
  statement,
  items,
  amountPaid,
  buckets,
}: StatementProps) => {
  const rows = items.map((rev, idx) => {
    const dateStr = rev.createdAt.toLocaleDateString();
    const invoiceNo = rev.invoiceId?.toString().padStart(6, "0") || "";
    const desc = rev.service?.code || "";
    const charges = rev.costBeforeGst?.toFixed(2) || "0.00";
    const balance = rev.costBeforeGst?.toFixed(2) || "0.00";

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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          {/* Left Column: Logo & Company Info */}
          <View style={styles.leftColumn}>
            <Image
              src="https://res.cloudinary.com/autolinkpro-prod/image/upload/v1740790228/odetail/assets/nzmcwc4fkcneh3wvg40h.png"
              style={styles.logo}
            />
            <Text>Platinum Auto Group LTD</Text>
            <Text>Unit 9, 1818 1st ave NW</Text>
            <Text>{formatPhoneNumber("5877032852")}</Text>
            <Text>Calgary AB T2M 0K3</Text>
          </View>

          {/* Right Column: Statement Title, Date, Last Payment */}
          <View style={styles.rightColumn}>
            <Text style={styles.title}>STATEMENT</Text>
            <Text style={styles.statementDate}>
              Date: {statement?.startDate.toLocaleDateString()}
            </Text>
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
        {rows?.length ? rows : <Text>No items found</Text>}

        {/* FOOTER: AGING BUCKETS */}
        <View style={styles.agingContainer}>
          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>CURRENT</Text>
            <Text style={styles.agingValue}>${buckets.currentAmount}</Text>
          </View>

          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>30 DAYS</Text>
            <Text style={styles.agingValue}>${buckets.thirtyDayAmount}</Text>
          </View>

          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>60 DAYS</Text>
            <Text style={styles.agingValue}>${buckets.sixtyDayAmount}</Text>
          </View>

          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>60+ DAYS</Text>
            <Text style={styles.agingValue}>${buckets.sixtyPlusAmount}</Text>
          </View>

          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>AMOUNT DUE</Text>
            <Text style={styles.agingValue}>${buckets.amountDue}</Text>
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
  const statementId = parseInt(params.id);

  const statement = await prisma.statement.findUnique({
    where: { id: statementId },
    include: {
      revenues: true,
      payments: true,
    },
  });

  if (!statement) {
    return notFound();
  }

  const [items, payments] = await prisma.$transaction([
    prisma.revenue.findMany({
      where: {
        service: {
          distributor: statement.distributor,
          createdAt: {
            gte: new Date(statement.startDate),
            lte: new Date(statement.endDate),
          },
          serviceType: {
            in: [
              "Windshield",
              "Door Glass",
              "Back Glass",
              "Sunroof",
              "Mirror",
              "Quarter Glass",
            ],
          },
        },
        companyId: "odetail",
      },
      include: {
        service: {
          include: {
            invoice: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: { statementId: statementId },
    }),
  ]);

  const amountPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);
  const {
    current: currentAmount,
    thirty: thirtyDayAmount,
    sixty: sixtyDayAmount,
    sixtyPlus: sixtyPlusAmount,
    amountDue,
  } = calculateCreditAgingBuckets(statement.revenues, amountPaid);
  const newStatement = {
    statement: {
      ...statement,
    },
    items: items,
    amountPaid: amountPaid,
    buckets: {
      currentAmount,
      thirtyDayAmount,
      sixtyDayAmount,
      sixtyPlusAmount,
      amountDue,
    },
  };

  const stream = await renderToStream(<StatementDocument {...newStatement} />);

  return new NextResponse(stream as unknown as ReadableStream);
}

/**
 * ✅ POST: Generate PDF in Memory & Send via Email
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const statementId = parseInt(params.id);
    const statement = await prisma.statement.findUnique({
      where: { id: statementId },
      include: {
        revenues: true,
        payments: true,
      },
    });

    if (!statement) {
      return notFound();
    }

    const [items, payments] = await prisma.$transaction([
      prisma.revenue.findMany({
        where: {
          service: {
            distributor: statement.distributor,
            createdAt: {
              gte: new Date(statement.startDate),
              lte: new Date(statement.endDate),
            },
            serviceType: {
              in: [
                "Windshield",
                "Door Glass",
                "Back Glass",
                "Sunroof",
                "Mirror",
                "Quarter Glass",
              ],
            },
          },
          companyId: "odetail",
        },
        include: {
          service: {
            include: {
              invoice: true,
            },
          },
        },
      }),
      prisma.payment.findMany({
        where: { statementId: statementId },
      }),
    ]);

    const amountPaid = payments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );
    const {
      current: currentAmount,
      thirty: thirtyDayAmount,
      sixty: sixtyDayAmount,
      sixtyPlus: sixtyPlusAmount,
      amountDue,
    } = calculateCreditAgingBuckets(statement.revenues, amountPaid);
    const newStatement = {
      statement: {
        ...statement,
      },
      items: items,
      amountPaid: amountPaid,
      buckets: {
        currentAmount,
        thirtyDayAmount,
        sixtyDayAmount,
        sixtyPlusAmount,
        amountDue,
      },
    };

    // Generate PDF in memory as a stream
    const pdfStream = await renderToBuffer(
      <StatementDocument {...newStatement} />
    );

    // ✅ Convert Buffer to Base64
    const pdfBase64 = pdfStream.toString("base64");

    return NextResponse.json({ success: true, pdfBase64 });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}

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
    totalGST: number;
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
  statementDate: {
    textAlign: "left",
  },
  statementDateLeft: {
    textAlign: "left",
    alignSelf: "flex-end",
  },
  statementDateCreated: {
    fontWeight: "semibold",
    textAlign: "left",
  },
  dateFromToContainer: {
    marginTop: 5,
  },
  dateCreatedContainer: {
    marginTop: 2,
    marginBottom: 2,
  },
  companyInfo: {
    textTransform: "uppercase",
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
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
  },
  againgTotals: {
    flexDirection: "row",
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
  totalsContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 25,
    textAlign: "right",
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
            <View style={styles.supplierInfo}>
              <Image
                src="https://res.cloudinary.com/autolinkpro-prod/image/upload/v1740599132/suppliers/mb1imixwwqfnxqayredw.png"
                style={styles.logo}
              />
              <View>
                <Text style={styles.supplierInfoTitle}>
                  Platinum Auto Group LTD
                </Text>
                <Text>Unit 9, 1818 1st ave NW</Text>
                <Text>Calgary AB T2M 0K3</Text>
                <Text>{formatPhoneNumber("5877032852")}</Text>
              </View>
            </View>

            <View style={styles.companyInfo}>
              <Text>O Detail</Text>
              <Text>203 - 2914 Kingsview Boulevard SE</Text>
              <Text>Airdrie AB T4A 0E1</Text>
              <Text>{formatPhoneNumber("5873662254")}</Text>
            </View>
          </View>

          {/* Right Column: Statement Title, Date, Last Payment */}
          <View style={styles.rightColumn}>
            <Text style={styles.title}>CUSTOMER STATEMENT</Text>
            <View style={styles.dateCreatedContainer}>
              <Text style={styles.statementDateCreated}>
                Statement Date:{" "}
                {statement?.createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View style={styles.dateFromToContainer}>
              <Text style={styles.statementDateLeft}>
                Date From:{" "}
                {statement?.startDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.statementDateLeft}>
                Date To:{" "}
                {statement?.endDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
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
        {rows?.length ? rows : <Text>No items found</Text>}

        {/* FOOTER: AGING BUCKETS */}
        <View style={styles.agingContainer}>
          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>CURRENT</Text>
            <Text style={styles.agingValue}>
              ${buckets.currentAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>30 DAYS</Text>
            <Text style={styles.agingValue}>
              ${buckets.thirtyDayAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>60 DAYS</Text>
            <Text style={styles.agingValue}>
              ${buckets.sixtyDayAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.agingItem}>
            <Text style={styles.agingLabel}>60+ DAYS</Text>
            <Text style={styles.agingValue}>
              ${buckets.sixtyPlusAmount.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.totalsContainer}>
          <View style={styles.totalsColumn}>
            <Text style={styles.agingLabel}>Subtotal</Text>
            <Text style={styles.totalsLabel}>GST</Text>
            <Text style={styles.totalsLabelDue}>Amount Due</Text>
          </View>

          <View style={styles.totalsColumn}>
            <Text style={styles.totalsValue}>
              ${buckets.amountDue.toFixed(2)}
            </Text>
            <Text style={styles.totalsValue}>
              ${buckets.totalGST.toFixed(2)}
            </Text>
            <Text style={styles.totalsValueDue}>
              ${(buckets.amountDue + buckets.totalGST).toFixed(2)}
            </Text>
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
    totalGST,
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
      totalGST,
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
      totalGST,
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
        totalGST,
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

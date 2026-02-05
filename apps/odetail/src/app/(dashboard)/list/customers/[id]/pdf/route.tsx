import {
  calculateInvoiceTotals,
  formatPhoneNumber,
  splitAddress,
} from "@/lib/util";
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
  pdf,
  renderToBuffer,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";

type SingleCustomerInvoice =
  | (Customer & {
      invoices: (Invoice & { services: Service[] })[];
    })
  | null;

interface CustomerStatementProps {
  customer: SingleCustomerInvoice;
  totals: {
    subtotal: string;
    gst: string;
    total: string;
  };
}

const replacementEligibleServices = [
  "Windshield",
  "Door Glass",
  "Back Glass",
  "Sunroof",
  "Mirror",
  "Quarter Glass",
];

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
  page: { padding: 40, fontSize: 12, fontFamily: "Montserrat" },
  divider: { height: 1, backgroundColor: "grey", marginVertical: 10 },
  headerDivider: { height: 5, backgroundColor: "grey", marginVertical: 10 },
  section: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  header: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: { width: 110, height: 110, padding: 4 },
  companyInfo: { flex: 1, marginLeft: 10 },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  contactInfo: { fontSize: 10, color: "grey" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  // Define table styles with equal flex values for each column
  tableHeader: {
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "grey",
    paddingBottom: 5,
    flexDirection: "row",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  itemColumn: { flex: 1, flexDirection: "column" },
  item: { textTransform: "uppercase" },
  quantityColumn: { flex: 1, textAlign: "center" },
  priceColumn: { flex: 1, textAlign: "center" },
  amountColumn: { flex: 1, textAlign: "center" },
  total: { marginTop: 10, fontSize: 14, fontWeight: "bold" },
  label: { fontWeight: "bold" },
  subSection: {
    color: "grey",
    fontStyle: "italic",
    textTransform: "uppercase",
    fontSize: 10,
    marginTop: 2,
  },
  disclaimerPage: {
    padding: 30,
    fontSize: 12,
    color: "grey",
    textAlign: "center",
  },
  disclaimerSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
  },
  disclaimerText: {
    fontSize: 10,
    color: "grey",
    marginTop: 5,
  },
});

const CustomerStatementDocument = ({
  customer,
  totals,
}: CustomerStatementProps) => {
  const { line1, line2 } = splitAddress(customer?.streetAddress1);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* Logo on the left */}
          <Image
            src={`https://res.cloudinary.com/autolinkpro-prod/image/upload/v1740790228/odetail/assets/nzmcwc4fkcneh3wvg40h.png`}
            style={styles.logo}
          />

          {/* Company info on the right */}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{"O Detail"}</Text>

            <Text style={styles.contactInfo}>
              {formatPhoneNumber("5873662254")} | {"invoices@odetail.ca"}
            </Text>

            <Text style={styles.contactInfo}>GST/HST: {"723288155RT0001"}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.headerDivider} />
        {/* Title */}
        <View style={styles.section}>
          {/* <Text style={styles.title}>
            Statement #{String(customer.).padStart(6, "0")}
          </Text> */}
          <View style={styles.divider} />
        </View>

        {/* Customer and Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Customer:</Text>
              <Text>
                {customer?.firstName} {customer?.lastName}
              </Text>
              <Text>{customer?.email}</Text>
              <Text>{formatPhoneNumber(customer?.phone as string)}</Text>
              <Text>{line1}</Text>
              <Text>{line2}</Text>
            </View>
            <View>
              <Text style={styles.label}>Invoice Details:</Text>
              <Text>
                PDF created {customer?.createdAt?.toLocaleDateString()}
              </Text>
              <Text>${totals.total}</Text>
            </View>
            {/* <View>
              <Text style={styles.label}>Payment:</Text>
              <Text>
                {cuspaymentType ? invoice?.paymentType : "Due on Receipt"}
              </Text>
            </View> */}
          </View>
          <View style={styles.divider} />
        </View>

        {/* Services Table */}
        <View style={styles.section}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.itemColumn}>Date</Text>
            <Text style={styles.priceColumn}>Invoice #</Text>
            <Text style={styles.amountColumn}>Amount</Text>
          </View>
          {customer?.invoices && customer.invoices.length > 0 ? (
            customer.invoices.map((inv) => {
              const amount = inv.services.reduce(
                (sum, s) => sum + s.price * s.quantity,
                0,
              );

              return (
                <View key={inv.id} style={styles.tableRow}>
                  <Text style={styles.itemColumn}>
                    {inv.createdAt.toLocaleDateString()}
                  </Text>

                  <Text style={styles.item}>
                    #{String(inv.id).padStart(6, "0")}
                  </Text>

                  <Text style={styles.amountColumn}>${amount.toFixed(2)}</Text>
                </View>
              );
            })
          ) : (
            <Text>No invoices available</Text>
          )}
          <View style={styles.divider} />
        </View>

        {/* Subtotal, GST, and Total */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Subtotal:</Text>
            <Text>${totals.subtotal}</Text>
          </View>
          <View style={styles.row}>
            <Text>GST (5%):</Text>
            <Text>${totals.gst}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.total}>Total:</Text>
            <Text style={styles.total}>${totals.total}</Text>
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.disclaimerPage}>
        <View>
          <Text style={styles.title}>DISCLAIMER</Text>
          {/* Chip Repair Section */}
          <Text style={styles.disclaimerSubtitle}>Chip Repair:</Text>
          <Text style={styles.disclaimerText}>
            Chip repairs are meant to prevent further damage, but we cannot
            guarantee that the chip or crack will disappear completely. Some
            chips may still be visible after repair, and there is a small chance
            the windshield may crack during or after the process. O Detail is
            not responsible for additional damage resulting from the repair.
          </Text>

          {/* Warranty Section */}
          <Text style={styles.disclaimerSubtitle}>WARRANTY</Text>
          <Text style={styles.disclaimerText}>
            Lifetime Warranty for Leaks and Whistling Noises: We offer a
            lifetime warranty on any leaks or whistling noises related to
            windshield installation. If you experience these issues at any time
            after service, we will inspect and correct the problem at no
            additional cost.
          </Text>

          {/* Cracks within 24 Hours Section */}
          <Text style={styles.disclaimerSubtitle}>Cracks within 24 Hours:</Text>
          <Text style={styles.disclaimerText}>
            If your windshield cracks within 24 hours of replacement, please
            notify us immediately. We will assess the situation, and if the
            damage is related to installation, we will replace the windshield at
            no cost. Cracks caused by external factors (e.g., rocks, debris) are
            not covered.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const customerId = params.id;

  const result: SingleCustomerInvoice = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        include: {
          services: true,
        },
      },
    },
  });

  if (!result) {
    return notFound();
  }

  const { subtotal, gst, total } = calculateInvoiceTotals(
    result.invoices.flatMap((inv) => inv.services),
  );

  const customer = {
    customer: {
      ...result,
    },

    totals: {
      subtotal,
      gst,
      total,
    },
  };

  const stream = await renderToStream(
    <CustomerStatementDocument {...customer} />,
  );

  return new NextResponse(stream as unknown as ReadableStream);
}

/**
 * ✅ POST: Generate PDF in Memory & Send via Email
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const customerId = params.id;
    const result: SingleCustomerInvoice = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        invoices: {
          include: {
            services: true,
          },
        },
      },
    });

    if (!result) {
      return notFound();
    }

    const { subtotal, gst, total } = calculateInvoiceTotals(
      result.invoices.flatMap((inv) => inv.services),
    );
    const invoice = {
      customer: result,
      totals: {
        subtotal,
        gst,
        total,
      },
    };

    // Generate PDF in memory as a stream
    const pdfStream = await renderToBuffer(
      <CustomerStatementDocument {...invoice} />,
    );

    // ✅ Convert Buffer to Base64
    const pdfBase64 = pdfStream.toString("base64");

    return NextResponse.json({ success: true, pdfBase64 });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 },
    );
  }
}

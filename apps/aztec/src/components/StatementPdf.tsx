import { formatPhoneNumber } from "@/lib/util";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { Invoice, Service } from "@repo/database";

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

type SingleInvoice = (Invoice & { services: Service[] }) | null;

interface StatementProps {
  invoice: SingleInvoice;
  totals: {
    subtotal: string;
    gst: string;
    total: string;
  };
}

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
  itemColumn: { flex: 2, flexDirection: "column" },
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

const StatementDocument = ({ invoice, totals }: StatementProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* Logo on the left */}
          <Image
            src={`https://res.cloudinary.com/autolinkpro-prod/image/upload/v1740790228/aztec/assets/nzmcwc4fkcneh3wvg40h.png`}
            style={styles.logo}
          />

          {/* Company info on the right */}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{"Aztec"}</Text>

            <Text style={styles.contactInfo}>
              {formatPhoneNumber("5873662254")} | {"invoices@aztecautoglass.ca"}
            </Text>

            <Text style={styles.contactInfo}>GST/HST: {"723288155RT0001"}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.headerDivider} />
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>
            Invoice #{String(invoice?.id).padStart(6, "0")}
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Statement Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View></View>
            <View>
              <Text style={styles.label}>Invoice Details:</Text>
              <Text>
                PDF created {invoice?.createdAt?.toLocaleDateString()}
              </Text>
              <Text>${totals.total}</Text>
            </View>
            <View>
              <Text style={styles.label}>Payment:</Text>
              <Text>{"Due on Receipt"}</Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>

        {/* Services Table */}
        <View style={styles.section}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.itemColumn}>Item</Text>
            <Text style={styles.quantityColumn}>Quantity</Text>
            <Text style={styles.priceColumn}>Price</Text>
            <Text style={styles.amountColumn}>Amount</Text>
          </View>
          {invoice?.services && invoice.services.length > 0 ? (
            invoice.services.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.itemColumn}>
                  <Text style={styles.subSection}>
                    {item.code} ({item.distributor})
                  </Text>
                  <Text style={styles.subSection}>{item.notes}</Text>
                </View>
                <Text style={styles.quantityColumn}>{item.quantity}</Text>
                <Text style={styles.priceColumn}>${item.price}</Text>
                <Text style={styles.amountColumn}>
                  ${item.price * item.quantity}
                </Text>
              </View>
            ))
          ) : (
            <Text>No services available</Text>
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
    </Document>
  );
};

export default StatementDocument;

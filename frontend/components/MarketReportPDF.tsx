// components/MarketReportPDF.tsx
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  title: { fontSize: 18, marginBottom: 10 },
  text: { fontSize: 12 },
});

export const MarketReportPDF = ({ stats, whatIfResult }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Market Analysis Report</Text>
        <Text>Average Price: ${stats?.averagePrice?.toLocaleString()}</Text>
        <Text>What-If Prediction: ${whatIfResult?.toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);
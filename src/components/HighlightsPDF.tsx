import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

type Highlight = {
  quote: string;
  timestamp: string;
  loc?: string;
  pageNo?: string;
};

type BookHighlights = {
  bookname: string;
  author: string;
  highlights: Highlight[];
};

const styles = StyleSheet.create({
  page: { padding: 30 },
  bookSection: { marginBottom: 24 },
  bookTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  author: { fontSize: 12, marginBottom: 8, color: '#555' },
  highlight: { marginBottom: 10, paddingLeft: 8, borderLeft: '2px solid #eee' },
  quote: { fontSize: 12, marginBottom: 2 },
  meta: { fontSize: 10, color: '#888' },
});

const HighlightsPDF = ({ books }: { books: BookHighlights[] }) => (
  <Document>
    <Page style={styles.page}>
      {books.map((book, idx) => (
        <View key={idx} style={styles.bookSection}>
          <Text style={styles.bookTitle}>{book.bookname}</Text>
          <Text style={styles.author}>by {book.author}</Text>
          {book.highlights.map((hl, hidx) => (
            <View key={hidx} style={styles.highlight}>
              <Text style={styles.quote}>“{hl.quote}”</Text>
              <Text style={styles.meta}>
                {hl.pageNo && `Page: ${hl.pageNo} `}
                {hl.loc && `Loc: ${hl.loc} `}
                {hl.timestamp && `— ${hl.timestamp}`}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

export default HighlightsPDF;
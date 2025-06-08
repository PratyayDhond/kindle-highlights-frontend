import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.6,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  author: {
    textAlign: 'right',
    fontSize: 12,
    marginBottom: 24,
    color: '#444',
    fontStyle: 'italic'
  },
  quoteBox: {
    borderLeft: '3px solid #aaa',
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 4,
  },
  highlightText: {
    fontStyle: 'italic',
    fontSize: 12,
  },
  counterText: {
    fontSize: 10,
    color: '#222',
    fontWeight: 500,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
  },
  spacer: {
    height: 10,
  }
});

const BookPdf = ({ title, author, content }) => {
  let highlightCount = 0;
  let noteCount = 0;

  const filteredContent = content.filter(item => item.type !== 'bookmark');
  console.log('Creating PDF for:', title);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>~ {author}</Text>

        {filteredContent.map((item, idx) => {
          let counterLabel = '';
          if (item.type === 'highlight') {
            highlightCount += 1;
            counterLabel = `Highlight ${highlightCount}`;
          } else if (item.type === 'note') {
            noteCount += 1;
            counterLabel = `Note ${noteCount}`;
          }

          return (
            <View key={idx}>
              <View style={styles.quoteBox}>
                <Text style={styles.highlightText}>"{item.highlight}"</Text>
              </View>


              <Text style={styles.metaText}>
                {counterLabel}
                {item.page ? ` | Page: ${item.page}` : ''}
                {item.location ? ` | Location: ${item.location}` : ''}
                {item.location && item.timestamp ? ' | ' : ''}
                {item.timestamp ? ` | ${item.timestamp}` : ''}
              </Text>

              <View style={styles.spacer} />
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default BookPdf;

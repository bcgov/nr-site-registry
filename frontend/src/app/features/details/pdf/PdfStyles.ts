import { Font, StyleSheet } from '@react-pdf/renderer';

Font.register({
  family: 'BCSans',
  fonts: [
    {
      src: require('@bcgov/bc-sans/fonts/BCSans-Regular.woff'),
      fontWeight: 'normal',
    },
    {
      src: require('@bcgov/bc-sans/fonts/BCSans-Bold.woff'),
      fontWeight: 'bold',
    },
    {
      src: require('@bcgov/bc-sans/fonts/BCSans-Italic.woff'),
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    {
      src: require('@bcgov/bc-sans/fonts/BCSans-BoldItalic.woff'),
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'BCSans',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: '#2d2d2d',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#003366',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'BCSans',
    fontWeight: 'bold',
    color: '#003366',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#474543',
    marginTop: 4,
  },
  snapshotBadge: {
    fontSize: 9,
    color: '#7a4f00',
    backgroundColor: '#fff3cd',
    padding: 4,
    borderRadius: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'BCSans',
    fontWeight: 'bold',
    color: '#003366',
    backgroundColor: '#e8f0fe',
    padding: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '35%',
    fontFamily: 'BCSans',
    fontWeight: 'bold',
    color: '#474543',
  },
  value: {
    width: '65%',
    color: '#2d2d2d',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#003366',
    padding: 5,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontFamily: 'BCSans',
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCell: {
    fontSize: 9,
    color: '#2d2d2d',
  },
  noData: {
    fontSize: 9,
    color: '#9f9d9c',
    fontStyle: 'italic',
    padding: 4,
  },
  subSectionTitle: {
    fontSize: 10,
    fontFamily: 'BCSans',
    fontWeight: 'bold',
    color: '#474543',
    marginTop: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: '#9f9d9c',
  },
});

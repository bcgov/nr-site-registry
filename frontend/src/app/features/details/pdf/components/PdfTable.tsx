import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../PdfStyles';

export interface PdfTableColumn {
  label: string;
  width: string;
  getValue: (row: any) => string | null | undefined;
}

interface PdfTableProps {
  columns: PdfTableColumn[];
  rows: any[];
  rowKey?: (row: any, index: number) => string;
}

const PdfTable: React.FC<PdfTableProps> = ({ columns, rows, rowKey }) => (
  <>
    <View style={pdfStyles.tableHeader}>
      {(columns ?? []).map((col) => (
        <Text
          key={col.label}
          style={[pdfStyles.tableHeaderCell, { width: col.width }]}
        >
          {col.label}
        </Text>
      ))}
    </View>
    {(rows ?? []).map((row, index) => (
      <View
        key={rowKey ? rowKey(row, index) : index}
        style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}
      >
        {(columns ?? []).map((col) => (
          <Text
            key={col.label}
            style={[pdfStyles.tableCell, { width: col.width }]}
          >
            {col.getValue(row) ?? '—'}
          </Text>
        ))}
      </View>
    ))}
  </>
);

export default PdfTable;

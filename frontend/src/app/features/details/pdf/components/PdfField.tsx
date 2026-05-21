import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../PdfStyles';

interface PdfFieldProps {
  label: string;
  value?: string | null;
}

const PdfField: React.FC<PdfFieldProps> = ({ label, value }) => (
  <View style={pdfStyles.row}>
    <Text style={pdfStyles.label}>{label}</Text>
    <Text style={pdfStyles.value}>{value ?? '—'}</Text>
  </View>
);

export default PdfField;

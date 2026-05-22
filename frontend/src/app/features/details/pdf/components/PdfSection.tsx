import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../PdfStyles';

interface PdfSectionProps {
  title: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
}

const PdfSection: React.FC<PdfSectionProps> = ({
  title,
  emptyMessage,
  isEmpty,
  children,
}) => (
  <View style={pdfStyles.section}>
    <Text style={pdfStyles.sectionTitle}>{title}</Text>
    {isEmpty ? (
      <Text style={pdfStyles.noData}>{emptyMessage ?? 'No data found.'}</Text>
    ) : (
      children
    )}
  </View>
);

export default PdfSection;

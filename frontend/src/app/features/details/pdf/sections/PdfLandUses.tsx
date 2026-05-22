import React from 'react';
import PdfSection from '../components/PdfSection';
import PdfTable, { PdfTableColumn } from '../components/PdfTable';

const columns: PdfTableColumn[] = [
  {
    label: 'Land Use',
    width: '40%',
    getValue: (lu) => lu.landUse?.description ?? lu.lutCode,
  },
  { label: 'Note', width: '30%', getValue: (lu) => lu.note },
  {
    label: 'Profile Date Received',
    width: '30%',
    getValue: (lu) => lu.profileDateReceived,
  },
];

interface PdfLandUsesProps {
  landUses: any[];
}

const PdfLandUses: React.FC<PdfLandUsesProps> = ({ landUses }) => (
  <PdfSection
    title="Suspect Land Uses"
    isEmpty={!landUses?.length}
    emptyMessage="No land use history found."
  >
    <PdfTable columns={columns} rows={landUses} rowKey={(lu) => lu.guid} />
  </PdfSection>
);

export default PdfLandUses;

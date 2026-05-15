import React from 'react';
import PdfSection from '../components/PdfSection';
import PdfTable, { PdfTableColumn } from '../components/PdfTable';
import { formatDate } from '../../../../helpers/utility';

const columns: PdfTableColumn[] = [
  { label: 'Type', width: '20%', getValue: (p) => p.descriptionType },
  { label: 'PIN / PID', width: '25%', getValue: (p) => p.idPinNumber },
  {
    label: 'Date Noted',
    width: '20%',
    getValue: (p) => formatDate(p.dateNoted ?? null),
  },
  {
    label: 'Land Description',
    width: '35%',
    getValue: (p) => p.landDescription,
  },
];

interface PdfParcelDescriptionsProps {
  parcelDescriptions: any[];
}

const PdfParcelDescriptions: React.FC<PdfParcelDescriptionsProps> = ({
  parcelDescriptions,
}) => (
  <PdfSection
    title="Parcel Descriptions"
    isEmpty={!parcelDescriptions?.length}
    emptyMessage="No parcel descriptions found."
  >
    <PdfTable
      columns={columns}
      rows={parcelDescriptions}
      rowKey={(p) => p.id}
    />
  </PdfSection>
);

export default PdfParcelDescriptions;

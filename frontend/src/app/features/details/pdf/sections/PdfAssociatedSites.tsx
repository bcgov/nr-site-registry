import React from 'react';
import PdfSection from '../components/PdfSection';
import PdfTable, { PdfTableColumn } from '../components/PdfTable';
import { formatDate } from '../../../../helpers/utility';

const columns: PdfTableColumn[] = [
  {
    label: 'Associated Site ID',
    width: '30%',
    getValue: (a) => a.siteIdAssociatedWith,
  },
  {
    label: 'Effective Date',
    width: '30%',
    getValue: (a) => formatDate(a.effectiveDate ?? null),
  },
  { label: 'Note', width: '40%', getValue: (a) => a.note },
];

interface PdfAssociatedSitesProps {
  associatedSites: any[];
}

const PdfAssociatedSites: React.FC<PdfAssociatedSitesProps> = ({
  associatedSites,
}) => (
  <PdfSection
    title="Associated Sites"
    isEmpty={!associatedSites?.length}
    emptyMessage="No associated sites found."
  >
    <PdfTable columns={columns} rows={associatedSites} rowKey={(a) => a.id} />
  </PdfSection>
);

export default PdfAssociatedSites;

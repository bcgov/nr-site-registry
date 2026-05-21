import React from 'react';
import PdfSection from '../components/PdfSection';
import PdfTable, { PdfTableColumn } from '../components/PdfTable';
import { formatDate } from '../../../../helpers/utility';

const columns: PdfTableColumn[] = [
  { label: 'Title', width: '26%', getValue: (d) => d.title },
  { label: 'Author', width: '19%', getValue: (d) => d.displayName },
  { label: 'Organization', width: '19%', getValue: (d) => d.organizationName },
  {
    label: 'Submission Date',
    width: '18%',
    getValue: (d) => formatDate(d.submissionDate ?? null),
  },
  {
    label: 'Document Date',
    width: '18%',
    getValue: (d) => formatDate(d.documentDate ?? null),
  },
];

interface PdfDocumentsProps {
  documents: any[];
}

const PdfDocuments: React.FC<PdfDocumentsProps> = ({ documents }) => (
  <PdfSection
    title="Documents"
    isEmpty={!documents?.length}
    emptyMessage="No documents found."
  >
    <PdfTable columns={columns} rows={documents} rowKey={(d) => d.id} />
  </PdfSection>
);

export default PdfDocuments;

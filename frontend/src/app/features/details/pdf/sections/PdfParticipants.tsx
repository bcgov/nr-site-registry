import React from 'react';
import PdfSection from '../components/PdfSection';
import PdfTable, { PdfTableColumn } from '../components/PdfTable';
import { formatDate } from '../../../../helpers/utility';

interface PdfParticipantsProps {
  participants: any[];
  participantRoleData: any[];
}

const getColumns = (participantRoleData: any[]): PdfTableColumn[] => [
  { label: 'Name', width: '22%', getValue: (p) => p.displayName },
  {
    label: 'Role',
    width: '18%',
    getValue: (p) => {
      const match = participantRoleData?.find(
        (item: any) => item.key === p.prCode,
      );
      return match?.value || p.description || p.prCode;
    },
  },
  {
    label: 'Start Date',
    width: '18%',
    getValue: (p) => formatDate(p.effectiveDate ?? null),
  },
  {
    label: 'End Date',
    width: '18%',
    getValue: (p) => formatDate(p.endDate ?? null),
  },
  { label: 'Note', width: '24%', getValue: (p) => p.note },
];

const PdfParticipants: React.FC<PdfParticipantsProps> = ({
  participants,
  participantRoleData,
}) => (
  <PdfSection
    title="Site Participants"
    isEmpty={!participants?.length}
    emptyMessage="No participants found."
  >
    <PdfTable
      columns={getColumns(participantRoleData)}
      rows={participants}
      rowKey={(p) => p.id}
    />
  </PdfSection>
);

export default PdfParticipants;

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../PdfStyles';
import PdfField from '../components/PdfField';
import PdfSection from '../components/PdfSection';
import PdfTable, { PdfTableColumn } from '../components/PdfTable';
import { formatDate } from '../../../../helpers/utility';
import {
  NotationDto,
  NotationDropdownDto,
  NotationParticipantDto,
} from '../../../../../graphql/generated';

const getParticipantColumns = (
  notationParticRoleData: any[],
): PdfTableColumn[] => [
  {
    label: 'Name',
    width: '40%',
    getValue: (p: NotationParticipantDto) => p.displayName,
  },
  {
    label: 'Role',
    width: '30%',
    getValue: (p: NotationParticipantDto) => {
      const match = notationParticRoleData?.find(
        (item: any) => item.key === p.eprCode,
      );
      return match?.value ?? p.eprCode ?? '—';
    },
  },
  {
    label: 'Organization',
    width: '30%',
    getValue: (p: NotationParticipantDto) => p.displayName,
  },
];

// NotationDto from codegen does not include eventDate — it is added by the backend service mapping
interface PdfNotation extends NotationDto {
  eventDate?: string;
}

interface PdfNotationsProps {
  notations: PdfNotation[];
  notationTypeData: NotationDropdownDto[];
  notationClassData: any[];
  ministryContactData: any[];
  notationParticRoleData: any[];
}

const getMinistryContactName = (
  psnorgId: string,
  ministryContactData: any[],
): string => {
  const match = ministryContactData?.find((item: any) => item.key === psnorgId);
  return match?.value ?? psnorgId ?? '—';
};

const getNotationClassDescription = (
  eclsCode: string,
  notationClassData: any[],
): string => {
  const match = notationClassData?.find((item: any) => item.key === eclsCode);
  return match?.value ?? eclsCode ?? '—';
};

const getNotationTypeDescription = (
  eclsCode: string,
  etypCode: string,
  notationTypeData: NotationDropdownDto[],
): string => {
  const group = notationTypeData?.find((item) => item.metaData === eclsCode);
  const match = group?.dropdownDto?.find((d) => d.key === etypCode);
  return match?.value ?? etypCode ?? '—';
};

const PdfNotations: React.FC<PdfNotationsProps> = ({
  notations,
  notationTypeData,
  notationClassData,
  ministryContactData,
  notationParticRoleData,
}) => (
  <PdfSection
    title="Notations"
    isEmpty={!notations?.length}
    emptyMessage="No notations found."
  >
    {notations.map((notation: PdfNotation, index: number) => (
      <View key={notation.id ?? index} style={{ marginBottom: 10 }}>
        <Text style={pdfStyles.subSectionTitle}>
          Notation {index + 1} — {notation.etypCode ?? ''}
        </Text>
        <PdfField
          label="Notation"
          value={getNotationTypeDescription(
            notation.eclsCode,
            notation.etypCode,
            notationTypeData,
          )}
        />
        <PdfField
          label="Event Class"
          value={getNotationClassDescription(
            notation.eclsCode ?? '',
            notationClassData,
          )}
        />
        <PdfField
          label="Ministry Contact"
          value={getMinistryContactName(
            notation.psnorgId ?? '',
            ministryContactData,
          )}
        />
        <PdfField
          label="Initiated Date"
          value={formatDate(notation.eventDate ?? null)}
        />
        <PdfField
          label="Required Date"
          value={formatDate(notation.requirementReceivedDate ?? null)}
        />
        <PdfField
          label="Completion Date"
          value={formatDate(notation.completionDate ?? null)}
        />
        <PdfField label="Required Action" value={notation.requiredAction} />
        <PdfField label="Note" value={notation.note} />
        <PdfField
          label="Requirement Due Date"
          value={formatDate(notation.requirementDueDate ?? null)}
        />

        {(notation.notationParticipant ?? []).length > 0 && (
          <View style={{ marginTop: 4 }}>
            <Text
              style={[
                pdfStyles.tableCell,
                { fontFamily: 'BCSans', fontWeight: 'bold', marginBottom: 3 },
              ]}
            >
              Participants
            </Text>
            <PdfTable
              columns={getParticipantColumns(notationParticRoleData)}
              rows={notation.notationParticipant ?? []}
              rowKey={(p) => p.eventParticId}
            />
          </View>
        )}
      </View>
    ))}
  </PdfSection>
);

export default PdfNotations;

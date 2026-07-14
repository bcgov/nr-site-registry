import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import PdfField from '../components/PdfField';
import PdfSection from '../components/PdfSection';
import PdfTable, { PdfTableColumn } from '../components/PdfTable';
import { formatDate } from '../../../../helpers/utility';
import { pdfStyles } from '../PdfStyles';

interface Schedule2Ref {
  id?: string;
  schedule2ReferenceCode?: string | null;
  description?: string | null;
}

interface ProfileQA {
  question?: string | null;
  category?: string | null;
}

interface DisclosureItem {
  id?: string;
  siteRegDateRecd?: string | Date | null;
  dateCompleted?: string | Date | null;
  localAuthDateRecd?: string | Date | null;
  rwmDateDecision?: string | Date | null;
  siteRegDateEntered?: string | Date | null;
  plannedActivityComment?: string | null;
  siteDisclosureComment?: string | null;
  govDocumentsComment?: string | null;
  siteProfileSchedule2Refs?: Schedule2Ref[] | null;
  siteProfileQA?: ProfileQA[] | null;
}

interface PdfDisclosureProps {
  disclosure: DisclosureItem[] | DisclosureItem | null | undefined;
}

const schedule2Columns: PdfTableColumn[] = [
  {
    label: 'Schedule 2 Reference',
    width: '40%',
    getValue: (row) => row.schedule2ReferenceCode ?? null,
  },
  {
    label: 'Description',
    width: '60%',
    getValue: (row) => row.description ?? null,
  },
];

const qaColumns: PdfTableColumn[] = [
  {
    label: 'Question',
    width: '50%',
    getValue: (row) => row.question ?? null,
  },
  {
    label: 'Category',
    width: '50%',
    getValue: (row) => row.category ?? null,
  },
];

const PdfDisclosure: React.FC<PdfDisclosureProps> = ({ disclosure }) => {
  const disclosures: DisclosureItem[] = Array.isArray(disclosure)
    ? disclosure
    : disclosure && typeof disclosure === 'object'
      ? [disclosure as DisclosureItem]
      : [];
  const isEmpty = disclosures.length === 0;

  return (
    <PdfSection
      title="Site Disclosure"
      isEmpty={isEmpty}
      emptyMessage="No disclosure information recorded."
    >
      {disclosures.map((item: DisclosureItem, index: number) => (
        <View key={item.id ?? index} style={{ marginBottom: 15 }}>
          {disclosures.length > 1 && (
            <Text style={pdfStyles.subSectionTitle}>
              Disclosure Statement {index + 1}
            </Text>
          )}

          <PdfField
            label="Date Received"
            value={formatDate(item.siteRegDateRecd ?? null)}
          />
          <PdfField
            label="Date Completed"
            value={formatDate(item.dateCompleted ?? null)}
          />
          <PdfField
            label="Local Authority Received"
            value={formatDate(item.localAuthDateRecd ?? null)}
          />
          <PdfField
            label="Date Registrar Received"
            value={formatDate(item.rwmDateDecision ?? null)}
          />
          <PdfField
            label="Date Entered"
            value={formatDate(item.siteRegDateEntered ?? null)}
          />

          {item.siteProfileSchedule2Refs &&
            item.siteProfileSchedule2Refs.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={pdfStyles.subSectionTitle}>
                  III Commercial and Industrial Purposes or Activities on Site
                </Text>
                <PdfTable
                  columns={schedule2Columns}
                  rows={item.siteProfileSchedule2Refs}
                  rowKey={(row, i) => row.id ?? String(i)}
                />
              </View>
            )}

          <View style={{ marginTop: 8 }}>
            <Text style={pdfStyles.subSectionTitle}>
              Site Disclosure Questions Answered with Yes
            </Text>
            {item.siteProfileQA && item.siteProfileQA.length > 0 ? (
              <PdfTable
                columns={qaColumns}
                rows={item.siteProfileQA}
                rowKey={(_row, i) => String(i)}
              />
            ) : (
              <Text style={pdfStyles.noData}>
                There are no questions and categories found for this site
                disclosure.
              </Text>
            )}
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={pdfStyles.subSectionTitle}>
              IV Additional Comments and Explanations
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={[pdfStyles.label, { width: '100%' }]}>
                Provide a brief summary of the planned activity and proposed
                land use at the site.
              </Text>
              <Text style={pdfStyles.value}>
                {item.plannedActivityComment ?? '—'}
              </Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <Text style={[pdfStyles.label, { width: '100%' }]}>
                Indicate the information used to complete this site disclosure
                statement including a list of record searches completed.
              </Text>
              <Text style={pdfStyles.value}>
                {item.siteDisclosureComment ?? '—'}
              </Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <Text style={[pdfStyles.label, { width: '100%' }]}>
                List any past or present government orders, permits, approvals,
                certificates or notifications pertaining to the environmental
                condition of the site.
              </Text>
              <Text style={pdfStyles.value}>
                {item.govDocumentsComment ?? '—'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </PdfSection>
  );
};

export default PdfDisclosure;

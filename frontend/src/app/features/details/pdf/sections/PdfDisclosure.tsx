import React from 'react';
import PdfField from '../components/PdfField';
import PdfSection from '../components/PdfSection';
import { formatDate } from '../../../../helpers/utility';

interface PdfDisclosureProps {
  disclosure: any;
}

const PdfDisclosure: React.FC<PdfDisclosureProps> = ({ disclosure }) => {
  const isEmpty = !disclosure || Object.keys(disclosure).length === 0;

  return (
    <PdfSection
      title="Site Disclosure"
      isEmpty={isEmpty}
      emptyMessage="No disclosure information recorded."
    >
      <PdfField
        label="Date Completed"
        value={formatDate(disclosure?.dateCompleted ?? null)}
      />
      <PdfField
        label="Site Registry Date Received"
        value={formatDate(disclosure?.siteRegDateRecd ?? null)}
      />
      <PdfField
        label="Site Registry Date Entered"
        value={formatDate(disclosure?.siteRegDateEntered ?? null)}
      />
      <PdfField
        label="Local Authority Name"
        value={disclosure?.localAuthName}
      />
      <PdfField
        label="Local Authority Agency"
        value={disclosure?.localAuthAgency}
      />
      <PdfField
        label="Local Authority Address"
        value={disclosure?.localAuthAddress1}
      />
      <PdfField
        label="Local Authority Date Submitted"
        value={formatDate(disclosure?.localAuthDateSubmitted ?? null)}
      />
      <PdfField
        label="Investigation Required"
        value={disclosure?.investigationRequired}
      />
      <PdfField label="Site Address" value={disclosure?.siteAddress} />
      <PdfField label="Site City" value={disclosure?.siteCity} />
      <PdfField label="Comments" value={disclosure?.comments} />
      <PdfField
        label="Planned Activity Comment"
        value={disclosure?.plannedActivityComment}
      />
      <PdfField
        label="Site Disclosure Comment"
        value={disclosure?.siteDisclosureComment}
      />
      <PdfField
        label="Government Documents Comment"
        value={disclosure?.govDocumentsComment}
      />
    </PdfSection>
  );
};

export default PdfDisclosure;

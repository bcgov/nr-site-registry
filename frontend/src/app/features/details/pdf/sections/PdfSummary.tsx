import React from 'react';
import PdfField from '../components/PdfField';
import PdfSection from '../components/PdfSection';
import { formatDate } from '../../../../helpers/utility';

interface PdfSummaryProps {
  site: any;
}

const PdfSummary: React.FC<PdfSummaryProps> = ({ site }) => {
  if (!site) return null;

  const address = [
    site.addrLine_1,
    site.addrLine_2,
    site.addrLine_3,
    site.addrLine_4,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <PdfSection title="Summary">
      <PdfField label="Site ID" value={site.id} />
      <PdfField label="Common Name" value={site.commonName} />
      <PdfField label="Address" value={address} />
      <PdfField label="City" value={site.city} />
      <PdfField label="Province / State" value={site.provState} />
      <PdfField label="Postal Code" value={site.postalCode} />
      <PdfField label="Site Risk Code" value={site.siteRiskCode} />
      <PdfField label="Location Description" value={site.generalDescription} />
      <PdfField label="Latitude (deg)" value={site.latdeg?.toString()} />
      <PdfField label="Longitude (deg)" value={site.longdeg?.toString()} />
      <PdfField
        label="Last Updated Date"
        value={formatDate(site.whenUpdated)}
      />
    </PdfSection>
  );
};

export default PdfSummary;

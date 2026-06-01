import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles } from './PdfStyles';
import PdfSummary from './sections/PdfSummary';
import PdfNotations from './sections/PdfNotations';
import PdfParticipants from './sections/PdfParticipants';
import PdfDocuments from './sections/PdfDocuments';
import PdfLandUses from './sections/PdfLandUses';
import PdfAssociatedSites from './sections/PdfAssociatedSites';
import PdfParcelDescriptions from './sections/PdfParcelDescriptions';
import PdfDisclosure from './sections/PdfDisclosure';
import { formatDate, formatDateTime } from '../../../helpers/utility';
import { SiteDetailsPdfData } from './useSiteDetailsPdfData';
import bcGovLogo from '../../../images/logos/logo-banner.png';

interface SiteDetailsPdfProps {
  data: SiteDetailsPdfData;
}

const SiteDetailsPdf: React.FC<SiteDetailsPdfProps> = ({ data }) => {
  const {
    site,
    notations,
    participants,
    documents,
    disclosure,
    associatedSites,
    landUses,
    parcelDescriptions,
    isSnapshot,
    snapshotDate,
    notationTypeData,
    notationClassData,
    ministryContactData,
    notationParticRoleData,
    participantRoleData,
  } = data;

  const siteAddress = site
    ? [site.addrLine_1, site.city].filter(Boolean).join(', ')
    : 'Site Details';

  const now = new Date();
  const generatedOn = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <Document title={`Site ${site?.id ?? ''} — ${siteAddress}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Image
            src={bcGovLogo}
            style={{ width: 100, height: 40, marginBottom: 8 }}
          />
          <Text style={pdfStyles.headerTitle}>SITE DETAILS REPORT</Text>
          <Text style={pdfStyles.headerSubtitle}>
            Site ID: {site?.id ?? '—'} | {site?.commonName ?? '—'}
          </Text>
          {(site?.bcerCode2?.description || site?.bcerCode) && (
            <Text style={pdfStyles.headerSubtitle}>
              Region: {site?.bcerCode2?.description ?? site?.bcerCode}
            </Text>
          )}
          {isSnapshot && snapshotDate && (
            <Text style={pdfStyles.snapshotBadge}>
              Snapshot purchased at: {formatDateTime(snapshotDate)}
            </Text>
          )}
        </View>

        <PdfSummary site={site} />
        <PdfNotations
          notations={notations}
          notationTypeData={notationTypeData}
          notationClassData={notationClassData}
          ministryContactData={ministryContactData}
          notationParticRoleData={notationParticRoleData}
        />
        <PdfParticipants
          participants={participants}
          participantRoleData={participantRoleData}
        />
        <PdfDocuments documents={documents} />
        <PdfLandUses landUses={landUses} />
        <PdfAssociatedSites associatedSites={associatedSites} />
        <PdfParcelDescriptions parcelDescriptions={parcelDescriptions} />
        <PdfDisclosure disclosure={disclosure} />

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>
            Site Details Report — Government of British Columbia
          </Text>
          <Text style={pdfStyles.footerText}>Generated: {generatedOn}</Text>
          <Text
            style={pdfStyles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default SiteDetailsPdf;

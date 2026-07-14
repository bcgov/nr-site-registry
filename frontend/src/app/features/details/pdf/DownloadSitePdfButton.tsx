import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import SiteDetailsPdf from './SiteDetailsPdf';
import { useSiteDetailsPdfData } from './useSiteDetailsPdfData';
import { notifyError } from '../../../components/alert/Alert';
import { Button } from '../../../components/button/Button';

const DownloadSitePdfButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { fetchForPdf, isSiteReady } = useSiteDetailsPdfData();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const data = await fetchForPdf();
      const blob = await pdf(<SiteDetailsPdf data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `site-${data.site?.id ?? 'details'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      notifyError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleDownload}
      disabled={loading || !isSiteReady}
      aria-label="Download site details as PDF"
    >
      {loading ? 'Generating PDF...' : 'Download PDF'}
    </Button>
  );
};

export default DownloadSitePdfButton;

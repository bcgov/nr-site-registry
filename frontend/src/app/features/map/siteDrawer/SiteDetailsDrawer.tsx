import { FC } from 'react';

import {
  useMapSearch_FindSiteBySiteIdQuery,
  MapSearch_FindSiteBySiteIdQuery,
} from '../../../../graphql/generated';
import { StringParam, useQueryParam } from 'use-query-params';
import { SpinnerIcon } from '../../../components/common/icon';
import { Drawer } from '../../../components/drawer/Drawer';
import './SiteDetailsDrawer.css';

const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value?: number | string | null;
}) => {
  return (
    <div className="summary-item">
      <div className="fw-bold">{label}</div>
      <div>{value || ''}</div>
    </div>
  );
};

type Site = MapSearch_FindSiteBySiteIdQuery['findSiteBySiteId']['data'];
const formatAddress = (site: Site) => {
  const addressLines = [
    site?.addrLine_1,
    site?.addrLine_2,
    site?.addrLine_3,
    site?.addrLine_4,
  ];
  return addressLines.filter(Boolean).join(', ');
};

const formatCoordinates = (coords: Array<number | undefined | null>) => {
  const [d, m, s] = coords;
  let result = '';
  if (d) result += `${d}d`;
  if (m) result += `, ${m}m`;
  if (s) result += `, ${s}s`;
  return result;
};

export const SiteDetailsDrawer: FC = () => {
  const [selectedSiteId, setSelectedSiteId] = useQueryParam(
    'site',
    StringParam,
  );

  const { data, loading } = useMapSearch_FindSiteBySiteIdQuery({
    variables: { siteId: selectedSiteId || '' },
    skip: !selectedSiteId,
  });

  const siteData = data?.findSiteBySiteId.data;

  return (
    <Drawer
      isOpen={!!selectedSiteId}
      onClose={() => {
        setSelectedSiteId(null);
      }}
      title="Selected Site"
    >
      <div className="mb-2">
        <span className="fw-bold mb-2">Site ID:</span> {selectedSiteId}
      </div>
      {loading && <SpinnerIcon size={20} className="site-fa-spin" />}
      {!loading && (
        <div className="d-grid gap-3">
          <h4 className="fw-bold">{formatAddress(siteData)}</h4>
          <div className="site-drawer-info-summary">
            <SummaryItem
              label="Latitude"
              value={formatCoordinates([
                siteData?.latDegrees,
                siteData?.latMinutes,
                siteData?.latSeconds,
              ])}
            />
            <SummaryItem
              label="Site Risk Classification"
              value={siteData?.siteRiskCode || 'N/A'}
            />
            <SummaryItem
              label="Longitude"
              value={formatCoordinates([
                siteData?.longDegrees,
                siteData?.longMinutes,
                siteData?.longSeconds,
              ])}
            />
            <SummaryItem label="Region" value={siteData?.city} />
          </div>
          <div>
            <div className="fw-bold mb-2">Location Description</div>
            <div>{siteData?.generalDescription}</div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

import { FC, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Map } from 'leaflet';
import {
  MapSearch_FindSiteBySiteIdQuery,
  useMapSearch_AddCartItemMutation,
} from '../../../../graphql/generated';
import { gql, useQuery } from '@apollo/client';
import {
  MagnifyingGlassPlusIcon,
  ShoppingCartIcon,
  SpinnerIcon,
} from '../../../components/common/icon';
import './MapSearchDrawer.css';
import { Button } from '../../../components/button/Button';
import AddToFolio from '../../folios/AddToFolio';
import { getZoom, MAP_FLY_OPTIONS } from '../mapOptions';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';
import { AppDispatch } from '../../../Store';
import { fetchCartItems } from '../../cart/CartSlice';
import { notifyError, notifySuccess } from '../../../components/alert/Alert';
import { isUserOfType, getUser, UserRoleType } from '../../../helpers/utility';
import { useAuth } from 'react-oidc-context';

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

interface SiteDetailsDrawerContentProps {
  mapRef: RefObject<Map | null>;
}
export const SiteDetailsDrawerContent: FC<SiteDetailsDrawerContentProps> = ({
  mapRef,
}) => {
  const { selectedSiteId } = useMapSearchContext();

  const dispatch = useDispatch<AppDispatch>();
  const auth = useAuth();

  const isAuthenticated = auth?.user != null;

  const siteDetailsQuery = isAuthenticated
    ? gql`
        query SiteDetailsDrawer_findSiteBySiteId_loggedIn($siteId: String!) {
          findSiteBySiteIdLoggedInUser(siteId: $siteId) {
            data {
              id
              addrLine_1
              addrLine_2
              addrLine_3
              addrLine_4
              city
              latdeg
              longdeg
              latDegrees
              latMinutes
              latSeconds
              longDegrees
              longMinutes
              longSeconds
              generalDescription
              siteRiskCode
            }
          }
        }
      `
    : gql`
        query SiteDetailsDrawer_findSiteBySiteId_public($siteId: String!) {
          findSiteBySiteId(siteId: $siteId) {
            data {
              id
              addrLine_1
              addrLine_2
              addrLine_3
              addrLine_4
              city
              latdeg
              longdeg
              latDegrees
              latMinutes
              latSeconds
              longDegrees
              longMinutes
              longSeconds
              generalDescription
              siteRiskCode
            }
          }
        }
      `;

  const { data, loading: siteDetailsLoading } = useQuery(siteDetailsQuery, {
    variables: { siteId: selectedSiteId || '' },
    skip: !selectedSiteId,
  });

  const [addCartItem, { loading: addCartItemLoading }] =
    useMapSearch_AddCartItemMutation({
      onCompleted: () => {
        dispatch(fetchCartItems()); // updates cart items count in the sidebar
        notifySuccess('Successfully added the site to cart');
      },
      onError: () => notifyError('Failed to add the site to cart'),
    });

  const handleAddCartItemClick = () => {
    if (!selectedSiteId) return;

    const loggedInUser = getUser();
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
      return;
    }

    addCartItem({
      variables: {
        siteId: selectedSiteId,
      },
    });
  };

  const siteData = isAuthenticated
    ? data?.findSiteBySiteIdLoggedInUser?.data
    : data?.findSiteBySiteId?.data;

  const zoomToSite = () => {
    if (!mapRef.current || !siteData || !siteData.latdeg || !siteData.longdeg)
      return;

    const lat = siteData.latdeg;
    const lng = siteData.longdeg;

    mapRef.current.flyTo(
      { lat, lng },
      getZoom(mapRef.current),
      MAP_FLY_OPTIONS,
    );
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 flex-column flex-sm-row justify-content-between">
        <Button
          onClick={zoomToSite}
          variant="secondary"
          className="justify-content-center"
          disabled={siteDetailsLoading}
        >
          <MagnifyingGlassPlusIcon />
          Zoom To
        </Button>
        <div className="d-flex justify-content-end gap-2 flex-column flex-sm-row">
          <Link
            to={`/site/details/${selectedSiteId}`}
            className="justify-content-center"
            state={{
              fromPath: `${'map?site=' + selectedSiteId}`,
              fromLabel: 'Map',
            }}
          >
            <Button
              variant="secondary"
              className="justify-content-center w-100"
            >
              View Site Details
            </Button>
          </Link>
          {!isUserOfType(UserRoleType.INTERNAL) && (
            <>
              <AddToFolio
                selectedSiteIds={[selectedSiteId || '']}
                label="Add to Folio"
                triggerClassName="justify-content-center"
              />
              <Button
                onClick={handleAddCartItemClick}
                disabled={addCartItemLoading}
                className="justify-content-center"
              >
                <ShoppingCartIcon />
                Add to Cart
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="">
        <span className="fw-bold">Site ID:</span> {selectedSiteId}
      </div>
      {siteDetailsLoading && <SpinnerIcon size={20} className="site-fa-spin" />}
      {!siteDetailsLoading && (
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
    </div>
  );
};

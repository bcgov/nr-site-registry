import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { print } from 'graphql';
import { selectSiteDetails } from '../../site/dto/SiteSlice';
import { notationParticipants } from '../notations/NotationSlice';
import { siteParticipants } from '../participants/ParticipantSlice';
import { documents as siteDocumentsSelector } from '../documents/DocumentsSlice';
import { siteDisclosure as siteDisclosureSelector } from '../disclosure/DisclosureSlice';
import { associatedSites as siteAssociateSelector } from '../associates/AssociateSlice';
import { landUses as landUsesSelector } from '../landUses/LandUsesSlice';
import { parcelDescriptions } from '../parcelDescriptions/parcelDescriptionsSlice';
import { snapshots, hasUserPurchasedSnapshot } from '../snapshot/SnapshotSlice';
import {
  isUserOfType,
  UserRoleType,
  getAxiosInstance,
} from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { graphQLParcelDescriptionBySiteId } from '../../site/graphql/ParcelDescriptions';
import { getLandHistoriesForSiteQuery } from '../landUses/graphql/LandUses';

import {
  notationTypeDrpdown,
  notationClassDrpdown,
  ministryContactDrpdown,
  notationParticipantRoleDrpdown,
  participantRoleDrpdown,
} from '../dropdowns/DropdownSlice';

export interface SiteDetailsPdfData {
  site: any;
  notations: any[];
  participants: any[];
  documents: any[];
  disclosure: any;
  associatedSites: any[];
  landUses: any[];
  parcelDescriptions: any[];
  isSnapshot: boolean;
  snapshotDate: string | null;
  notationTypeData: any[];
  notationClassData: any[];
  ministryContactData: any[];
  notationParticRoleData: any[];
  participantRoleData: any[];
}

const fetchAllParcelDescriptions = async (
  siteId: string,
  pending: boolean,
): Promise<any[]> => {
  try {
    const response = await getAxiosInstance().post(GRAPHQL, {
      query: print(graphQLParcelDescriptionBySiteId()),
      variables: {
        siteId: Number(siteId),
        page: 1,
        pageSize: 9999,
        searchParam: '',
        sortBy: 'id',
        sortByDir: 'ASC',
        pending,
      },
    });
    return response.data?.data?.getParcelDescriptionsBySiteId?.data ?? [];
  } catch (error) {
    console.error(
      'useSiteDetailsPdfData Failed to fetch parcel descriptions for PDF',
      { siteId, pending, error },
    );
    return [];
  }
};

const fetchAllLandUses = async (
  siteId: string,
  pending: boolean,
): Promise<any[]> => {
  try {
    const response = await getAxiosInstance().post(GRAPHQL, {
      query: print(getLandHistoriesForSiteQuery),
      variables: { siteId, pending },
    });
    return response.data?.data?.getLandHistoriesForSite?.data ?? [];
  } catch (error) {
    console.error('useSiteDetailsPdfData Failed to fetch land uses for PDF', {
      siteId,
      pending,
      error,
    });
    return [];
  }
};

export const useSiteDetailsPdfData = () => {
  const isExternalUser = useMemo(() => isUserOfType(UserRoleType.CLIENT), []);

  const siteDetails = useSelector(selectSiteDetails);
  const snapshotState = useSelector(snapshots);
  const notationState = useSelector(notationParticipants);
  const participantState = useSelector(siteParticipants);
  const documentState = useSelector(siteDocumentsSelector);
  const disclosureState = useSelector(siteDisclosureSelector);
  const associateState = useSelector(siteAssociateSelector);
  const landUsesState = useSelector(landUsesSelector);
  const parcelState = useSelector(parcelDescriptions);
  const notationTypeState = useSelector(notationTypeDrpdown);
  const notationClassState = useSelector(notationClassDrpdown);
  const ministryContactState = useSelector(ministryContactDrpdown);
  const notationParticRoleState = useSelector(notationParticipantRoleDrpdown);
  const participantRoleState = useSelector(participantRoleDrpdown);

  const hasPurchasedSnapshot = useSelector(hasUserPurchasedSnapshot);

  const latestSnapshot = snapshotState?.snapshot?.data?.[0];
  const isSnapshot = isExternalUser && !!latestSnapshot;
  const isSiteReady = isExternalUser
    ? hasPurchasedSnapshot && !!latestSnapshot
    : !!siteDetails;

  const getBaseData = (): SiteDetailsPdfData => {
    const dropdownData = {
      notationTypeData: notationTypeState?.data ?? [],
      notationClassData: notationClassState?.data ?? [],
      ministryContactData: ministryContactState?.data ?? [],
      notationParticRoleData: notationParticRoleState?.data ?? [],
      participantRoleData: participantRoleState?.data ?? [],
    };

    return {
      site: siteDetails ?? null,
      notations: notationState?.siteNotation ?? [],
      participants: participantState?.siteParticipants ?? [],
      documents: documentState?.siteDocuments ?? [],
      disclosure: disclosureState?.siteDisclosure ?? {},
      associatedSites: associateState?.siteAssociate ?? [],
      landUses: landUsesState?.landUses ?? [],
      parcelDescriptions: parcelState?.data ?? [],
      isSnapshot: !!isSnapshot,
      snapshotDate: latestSnapshot?.whenCreated ?? null,
      ...dropdownData,
    };
  };

  // Called on PDF download action
  const fetchForPdf = async (): Promise<SiteDetailsPdfData> => {
    const base = getBaseData();
    const siteId = base.site?.id;

    if (!siteId) return base;

    const [allParcelDescriptions, allLandUses] = await Promise.all([
      fetchAllParcelDescriptions(siteId, false),
      fetchAllLandUses(siteId, false),
    ]);
    return {
      ...base,
      parcelDescriptions: allParcelDescriptions,
      landUses: allLandUses,
    };
  };

  return { fetchForPdf, isSiteReady };
};

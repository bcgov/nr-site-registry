import { BceRegionCd } from '../entities/bceRegionCd.entity';
import { Cart } from '../entities/cart.entity';
import { ClassificationCd } from '../entities/classificationCd.entity';
import { Folio } from '../entities/folio.entity';
import { FolioContents } from '../entities/folioContents.entity';
import { RecentViews } from '../entities/recentViews.entity';
import { SiteCrownLandContaminated } from '../entities/siteCrownLandContaminated.entity';
import { SiteRiskCd } from '../entities/siteRiskCd.entity';
import { SiteStatusCd } from '../entities/siteStatusCd.entity';
import { SiteSubdivisions } from '../entities/siteSubdivisions.entity';
import { Sites } from '../entities/sites.entity';
import { Snapshots } from '../entities/snapshots.entity';
import { Subdivisions } from '../entities/subdivisions.entity';

const siteId = '123';
const subdivId1 = '321';
const subdivId2 = '500321';
const subdivId3 = '500322';

let sampleSites: Sites[];
let siteSubdivisions: SiteSubdivisions[];

const siteCrownLandContaminated = new SiteCrownLandContaminated();
const recentViewedSites = [new RecentViews()];
const sstCode: SiteStatusCd = {
  code: '1',
  description: 'test',
  sites: [],
  eventTypeCds: [],
};
const siteRiskCd: SiteRiskCd = { code: '1', description: 'test', sites: [] };
const bceRegionCd: BceRegionCd = {
  code: '1',
  description: 'test',
  cityRegions: [],
  mailouts: [],
  peopleOrgs: [],
  sites: [],
};
const classCd: ClassificationCd = { code: '1', description: 'test', sites: [] };
const snapshots = [new Snapshots()];
const cart = [new Cart()];
const folio = [new FolioContents()];

const subdivisions: Subdivisions[] = [
  {
    id: subdivId1,
    dateNoted: new Date('1995-07-14'),
    pin: '123456789',
    pid: null,
    bcaaFolioNumber: null,
    entityType: null,
    addrLine_1: null,
    addrLine_2: null,
    addrLine_3: null,
    addrLine_4: null,
    city: null,
    postalCode: null,
    legalDescription: 'SUBDIVIDED LOT 1',
    whoCreated: 'LTO-LOAD',
    whoUpdated: 'LTO-LOAD',
    whenCreated: new Date('1995-07-14'),
    whenUpdated: new Date('1995-07-14'),
    crownLandsFileNo: null,
    pidStatusCd: 'A',
    validPid: 'Y',
    siteSubdivisions: null,
    userAction:'',
    srAction:''
  },
  {
    id: subdivId2,
    dateNoted: new Date('2000-02-26'),
    pin: null,
    pid: '555666777',
    bcaaFolioNumber: null,
    entityType: null,
    addrLine_1: null,
    addrLine_2: null,
    addrLine_3: null,
    addrLine_4: null,
    city: null,
    postalCode: null,
    legalDescription: 'SUBDIVIDED LOT 2',
    whoCreated: 'LTO-LOAD',
    whoUpdated: 'LTO-LOAD',
    whenCreated: new Date('2000-02-26'),
    whenUpdated: new Date('2000-02-26'),
    crownLandsFileNo: null,
    pidStatusCd: 'I',
    validPid: 'Y',
    siteSubdivisions: null,
    userAction:'',
    srAction:''
  },
  {
    id: subdivId3,
    dateNoted: new Date('2000-02-26'),
    pin: null,
    pid: null,
    bcaaFolioNumber: null,
    entityType: null,
    addrLine_1: null,
    addrLine_2: null,
    addrLine_3: null,
    addrLine_4: null,
    city: null,
    postalCode: null,
    legalDescription: 'SUBDIVIDED LOT 3',
    whoCreated: 'LTO-LOAD',
    whoUpdated: 'LTO-LOAD',
    whenCreated: new Date('2000-02-26'),
    whenUpdated: new Date('2000-02-26'),
    crownLandsFileNo: '223355',
    pidStatusCd: 'E',
    validPid: null,
    siteSubdivisions: null,
    userAction:'',
    srAction:''
  },
];
siteSubdivisions = [
  {
    siteSubdivId: '456',
    siteId: siteId,
    subdivId: subdivId1,
    dateNoted: new Date('1995-07-14'),
    initialIndicator: 'Y',
    whoCreated: 'LTO-LOAD',
    whoUpdated: null,
    whenCreated: new Date('1995-07-14'),
    whenUpdated: null,
    sprofDateCompleted: null,
    sendToSr: 'Y',
    site: null,
    subdivision: null,
    userAction: 'pending',
    srAction: 'pending',
  },
  {
    siteSubdivId: '457',
    siteId: siteId,
    subdivId: subdivId2,
    dateNoted: new Date('2000-02-26'),
    initialIndicator: 'Y',
    whoCreated: 'LTO-LOAD',
    whoUpdated: null,
    whenCreated: new Date('2000-02-26'),
    whenUpdated: null,
    sprofDateCompleted: null,
    sendToSr: 'Y',
    site: null,
    subdivision: null,
    userAction: 'pending',
    srAction: 'pending',
  },
  {
    siteSubdivId: '458',
    siteId: siteId,
    subdivId: subdivId2,
    dateNoted: new Date('2000-02-26'),
    initialIndicator: 'Y',
    whoCreated: 'LTO-LOAD',
    whoUpdated: null,
    whenCreated: new Date('2000-02-26'),
    whenUpdated: null,
    sprofDateCompleted: null,
    sendToSr: 'Y',
    site: null,
    subdivision: null,
    userAction: 'pending',
    srAction: 'pending',
  },
];

sampleSites = [
  {
    id: siteId,
    commonName: 'victoria',
    bcerCode: 'BCER123',
    sstCode: 'SST123',
    addrType: 'type',
    addrLine_1: 'Address 1',
    addrLine_2: 'Address 2',
    addrLine_3: 'Address 3',
    addrLine_4: 'Address 4',
    city: 'City',
    provState: 'Province/State',
    postalCode: 'Postal Code',
    latdeg: 0, // Example latitude
    longdeg: 0, // Example longitude
    victoriaFileNo: 'File No 1',
    regionalFileNo: 'File No 2',
    classCode: 'Class Code',
    generalDescription: 'Description',
    whoCreated: 'Creator',
    whoUpdated: 'Updater',
    whenCreated: new Date(), // Example date
    whenUpdated: new Date(), // Example date
    rwmFlag: 1,
    rwmGeneralDescFlag: 1,
    consultantSubmitted: 'Consultant Submitted',
    longDegrees: 0, // Example long degrees
    longMinutes: 0, // Example long minutes
    longSeconds: '0', // Example long seconds
    latDegrees: 0, // Example lat degrees
    latMinutes: 0, // Example lat minutes
    latSeconds: '0', // Example lat seconds
    srStatus: 'SR Status',
    latlongReliabilityFlag: 'LatLong Reliability Flag',
    siteRiskCode: 'Site Risk Code',
    geometry: '{}', // Example geometry
    events: [], // Example events
    landHistories: [], // Example land histories
    mailouts: [], // Example mailouts
    siteAssocs: [], // Example site associations
    siteAssocs2: [], // Example site associations 2
    siteDocs: [], // Example site documents
    sitePartics: [], // Example site participants
    siteProfiles: [], // Example site profiles
    siteSubdivisions: [], // Example site subdivisions
    bcerCode2: bceRegionCd, // Example BCER code 2
    classCode2: classCd, // Example class code 2
    siteRiskCode2: siteRiskCd,
    sstCode2: sstCode,
    siteCrownLandContaminated: siteCrownLandContaminated,
    recentViewedSites: recentViewedSites,
    snapshots: snapshots,
    cart: cart,
    folioContents: folio,
    srAction: '',
    userAction: '',
  },
  {
    id: '222',
    commonName: 'vancouver',
    bcerCode: 'BCER222',
    sstCode: 'SST222',
    addrType: 'type',
    addrLine_1: 'Address 5',
    addrLine_2: 'Address 6',
    addrLine_3: 'Address 7',
    addrLine_4: 'Address 8',
    city: 'City',
    provState: 'Province/State',
    postalCode: 'Postal Code',
    latdeg: 0, // Example latitude
    longdeg: 0, // Example longitude
    victoriaFileNo: 'File No 3',
    regionalFileNo: 'File No 4',
    classCode: 'Class Code',
    generalDescription: 'Description',
    whoCreated: 'Creator',
    whoUpdated: 'Updater',
    whenCreated: new Date(), // Example date
    whenUpdated: new Date(), // Example date
    rwmFlag: 1,
    rwmGeneralDescFlag: 1,
    consultantSubmitted: 'Consultant Submitted',
    longDegrees: 0, // Example long degrees
    longMinutes: 0, // Example long minutes
    longSeconds: '0', // Example long seconds
    latDegrees: 0, // Example lat degrees
    latMinutes: 0, // Example lat minutes
    latSeconds: '0', // Example lat seconds
    srStatus: 'SR Status',
    latlongReliabilityFlag: 'LatLong Reliability Flag',
    siteRiskCode: 'Site Risk Code',
    geometry: '{}', // Example geometry
    events: [], // Example events
    landHistories: [], // Example land histories
    mailouts: [], // Example mailouts
    siteAssocs: [], // Example site associations
    siteAssocs2: [], // Example site associations 2
    siteDocs: [], // Example site documents
    sitePartics: [], // Example site participants
    siteProfiles: [], // Example site profiles
    siteSubdivisions: [], // Example site subdivisions
    bcerCode2: bceRegionCd, // Example BCER code 2
    classCode2: classCd, // Example class code 2
    siteRiskCode2: siteRiskCd,
    sstCode2: sstCode,
    siteCrownLandContaminated: siteCrownLandContaminated,
    recentViewedSites: recentViewedSites,
    snapshots: snapshots,
    cart: cart,
    folioContents: folio,
    srAction: '',
    userAction: '',
  },
];

// Hook up the subdivision relationships last because they have a circular dependency.
subdivisions[0].siteSubdivisions = [siteSubdivisions[0]];
subdivisions[1].siteSubdivisions = [siteSubdivisions[1]];
subdivisions[2].siteSubdivisions = [siteSubdivisions[2]];

siteSubdivisions[0].subdivision = subdivisions[0];
siteSubdivisions[1].subdivision = subdivisions[1];
siteSubdivisions[2].subdivision = subdivisions[2];
siteSubdivisions[0].site = sampleSites[0];
siteSubdivisions[1].site = sampleSites[0];
siteSubdivisions[2].site = sampleSites[0];

sampleSites[0].siteSubdivisions = siteSubdivisions;

export { sampleSites };

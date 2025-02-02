export const DATA_LAYERS = {
  PMBC_PARCEL_FABRIC_POLY_SVW: {
    name: 'PMBC Parcel Cadastre – Crown Provincial',
    url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW/ows',
    layers: 'pub:WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW',
    styles: '5899',
    webUrl:
      'https://catalogue.data.gov.bc.ca/dataset/4cf233c2-f020-4f7a-9b87-1923252fbc24',
  },
  ADM_INDIAN_RESERVES_BANDS_SP: {
    name: 'Indian Reserves Including Band Names',
    url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_ADMIN_BOUNDARIES.ADM_INDIAN_RESERVES_BANDS_SP/ows',
    layers: 'pub:WHSE_ADMIN_BOUNDARIES.ADM_INDIAN_RESERVES_BANDS_SP',
    styles: '381_382',
    webUrl:
      'https://catalogue.data.gov.bc.ca/dataset/indian-reserves-and-band-names-administrative-boundaries',
  },
};

export type LayerKey = keyof typeof DATA_LAYERS;

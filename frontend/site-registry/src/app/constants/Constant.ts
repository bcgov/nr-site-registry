export const FOOTER_TEXT_1 =
  'The B.C. Public Service acknowledges the territories of First Nations around B.C. and is grateful to carry out our work on these lands. We acknowledge the rights, interests, priorities, and concerns of all Indigenous Peoples - First Nations, Métis, and Inuit - respecting and acknowledging their distinct cultures, histories, rights, laws, and governments.';
export const FOOTER_TEXT_2 =
  'We can help in over 120 languages and through Telephone Device For The Deaf (TDD). Call, email or text us, or find a service centre';
export const INFO_TEXT_1 =
  'Ea similique eum id illo et commodi. Itaque ducimus accusantium qui consequatur. Vitae nulla impedit laborum suscipit dolor ex at numquam. Optio rerum et enim impedit. Labore deserunt cupiditate deleniti.';

/**
 * The minimum number of characters required before performing a text search.
 */
export const MIN_SEARCH_LENGTH = 3;

/**
 * How long to wait before performing a search.
 */
export const SEARCH_DELAY = 300;

/**
 * The zoom level when zooming to a place.
 */
export const DEFAULT_PLACE_ZOOM = 13;

/**
 * The zoom level when zooming to an authorization.
 */
export const DEFAULT_AUTHORIZATION_ZOOM = 13;

export const HEADER_HEIGHT = 64;
export const FOOTER_HEIGHT = 64;

/**
 * The map bottom drawer component is 320px in height
 * in its initial state. It can be expanded to full height.
 */
export const MAP_BOTTOM_DRAWER_HEIGHT = 320;
/**
 * The search by, polygon and point search will have a smaller height.
 */
export const MAP_BOTTOM_DRAWER_HEIGHT_SMALL = 160;

// The positions of the map controls (zoom in/out etc)
export const MAP_CONTROLS_RIGHT_XL = 64;
export const MAP_CONTROLS_RIGHT_LG = 48;
export const MAP_CONTROLS_RIGHT_SM = 24;
export const MAP_CONTROLS_BOTTOM_LG = 40;
export const MAP_CONTROLS_BOTTOM_SM = 24;

export enum ActiveToolEnum {
  dataLayers = 'dataLayers',
  pointSearch = 'pointSearch',
  polygonSearch = 'polygonSearch',
  searchBy = 'searchBy',
  filterBy = 'filterBy',
}

/**
 * The smallest allowed radius in meters for the Point Search feature.
 */
export const MIN_CIRCLE_RADIUS = 500;

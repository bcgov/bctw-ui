import { ICbRoutes } from './types';

const selectFormat = `format=asSelect`;
const detailedFormat = `format=detailed`;
const cb = 'cb';
export const CbRouters = {
  lookups: `${cb}/lookups`,
  critters: `${cb}/critters`,
  captures: `${cb}/captures`,
  mortality: `${cb}/mortality`,
  markings: `${cb}/markings`,
  xref: `${cb}/xref`,
  bulk: `${cb}/bulk`,
  login: `${cb}/login`,
  signup: `${cb}/signup`,

  get lookupsEnum(): string {
    return this.lookups + '/enum';
  },
  get lookupsTaxons(): string {
    return this.lookups + '/taxons';
  }
};

const { lookups, lookupsEnum, lookupsTaxons, xref } = CbRouters;
const CbRoutes: ICbRoutes = {
  //? lookups
  region_env: `${lookups}/region-envs`,
  region_nr: `${lookups}/region-nrs`,
  wmu: `${lookups}/wmus`,
  cod: `${lookups}/cods`,
  marking_materials: `${lookups}/marking-materials`,
  marking_type: `${lookups}/marking-types`,
  collection_category: `${lookups}/collection-unit-categories`,
  taxons: lookupsTaxons,
  species: `${lookupsTaxons}/species`,
  colours: `${lookups}/colours`,

  //? lookups/enum
  sex: `${lookupsEnum}/sex`,
  critter_status: `${lookupsEnum}/critter-status`,
  cause_of_death_confidence: `${lookupsEnum}/cod-confidence`,
  coordinate_uncertainty_unit: `${lookupsEnum}/coordinate-uncertainty-unit`,
  frequency_units: `${lookupsEnum}/frequency-units`,
  measurement_units: `${lookupsEnum}/measurement-units`,
  supported_systems: `${lookupsEnum}/supported-systems`,

  //? xref
  collection_units: `${xref}/collection-units`,
  //? taxon xrefs
  taxon_collection_categories: `${xref}/taxon-collection-categories`,
  taxon_marking_body_locations: `${xref}/taxon-marking-body-locations`
};
export { CbRoutes, selectFormat, detailedFormat };

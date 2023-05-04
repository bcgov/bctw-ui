import { ICbRoutes, ICbSelect } from './types';

const selectFormat = `?format=asSelect`;
const detailedFormat = `?format=detailed`;

export const CbRouters = {
  lookups: '/lookups',
  critters: '/critters',

  get lookupsEnum(): string {
    return this.lookups + '/enum';
  },
  get lookupsTaxons(): string {
    return this.lookups + '/taxons';
  }
};

const { lookups, lookupsEnum, lookupsTaxons } = CbRouters;
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
  //? lookups/enum
  sex: `${lookupsEnum}/sex`,
  critter_status: `${lookupsEnum}/critter-status`,
  cause_of_death_confidence: `${lookupsEnum}/cod-confidence`,
  coordinate_uncertainty_unit: `${lookupsEnum}/coordinate-uncertainty-unit`,
  frequency_units: `${lookupsEnum}/frequency-units`,
  measurement_units: `${lookupsEnum}/measurement-units`,
  supported_systems: `${lookupsEnum}/supported-systems`
} as const;

export { CbRoutes, selectFormat, detailedFormat };

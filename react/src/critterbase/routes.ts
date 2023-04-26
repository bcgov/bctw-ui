import { ICbRoutes, ICbSelect } from './types';

const selectQuery = `?format=asSelect`;
const CbEnumRoute = `enum`;
const CbRouters = {
  lookups: '/lookups'
};

//Lookup Routes
const regionNrRoute = `${CbRouters.lookups}/region-nrs`;
const regionEnvRoute = `${CbRouters.lookups}/region-envs`;
const wmuRoute = `${CbRouters.lookups}/wmus`;
const codsRoute = `${CbRouters.lookups}/cods`;
const markingMaterialsRoute = `${CbRouters.lookups}/marking-materials`;
const markingTypesRoute = `${CbRouters.lookups}/marking-types`;
const collectionUnitCategoriesRoute = `${CbRouters.lookups}/collection-unit-categories`;

//Enum Routes
const lookupEnumRoute = `${CbRouters.lookups}/${CbEnumRoute}`;
const sexRoute = `${lookupEnumRoute}/sex`;
const codConfidenceRoute = `${lookupEnumRoute}/cod-confidence`;
const coordURoute = `${lookupEnumRoute}/coordinate-uncertainty-unit`;
const measurementUnitsRoute = `${lookupEnumRoute}/measurement-units`;
const supportedSystemsRoute = `${lookupEnumRoute}/supported-systems`;
const frequencyUnitsRoute = `${lookupEnumRoute}/frequency-units`;
const critterStatusRoute = `${lookupEnumRoute}/critter-status`;

const CbRoutes: ICbRoutes = {
  responsible_region: {
    route: regionNrRoute,
    formatRoute: `${regionNrRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  region_env: {
    route: regionEnvRoute,
    formatRoute: `${regionEnvRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  region_nr: {
    route: regionNrRoute,
    formatRoute: `${regionNrRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  wmu: {
    route: wmuRoute,
    formatRoute: `${wmuRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  cod_id: {
    route: codsRoute,
    formatRoute: `${codsRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  marking_materials_id: {
    route: markingMaterialsRoute,
    formatRoute: `${markingMaterialsRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  marking_type_id: {
    route: markingTypesRoute,
    formatRoute: `${markingTypesRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  collection_category_id: {
    route: collectionUnitCategoriesRoute,
    formatRoute: `${collectionUnitCategoriesRoute}${selectQuery}`,
    formatResponse: 'select'
  },
  //Enums
  sex: {
    route: sexRoute,
    formatRoute: `${sexRoute}${selectQuery}`,
    formatResponse: 'enum'
  },
  //This one might be dedundant or not needed
  critter_status: {
    route: critterStatusRoute,
    formatRoute: `${critterStatusRoute}${selectQuery}`,
    formatResponse: 'enum'
  },
  cause_of_death_confidence: {
    route: codConfidenceRoute,
    formatRoute: `${codConfidenceRoute}${selectQuery}`,
    formatResponse: 'enum'
  },
  coordinate_uncertainty_unit: {
    route: coordURoute,
    formatRoute: `${coordURoute}${selectQuery}`,
    formatResponse: 'enum'
  },
  frequency_units: {
    route: frequencyUnitsRoute,
    formatRoute: `${frequencyUnitsRoute}${selectQuery}`,
    formatResponse: 'enum'
  },
  measurement_units: {
    route: measurementUnitsRoute,
    formatRoute: `${measurementUnitsRoute}${selectQuery}`,
    formatResponse: 'enum'
  },
  supported_systems: {
    route: supportedSystemsRoute,
    formatRoute: `${supportedSystemsRoute}${selectQuery}`,
    formatResponse: 'enum'
  }
};

export { CbRoutes };

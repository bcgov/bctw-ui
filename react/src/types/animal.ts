import { Exclude, Transform } from 'class-transformer';
import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { BCTWBase, DayjsToPlain, nullToDayjs, toClassOnly, toPlainOnly, uuid } from 'types/common_types';
import { FormFieldObject, eInputType, isRequired } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { classToArray, columnToHeader } from 'utils/common_helpers';
import { ICollarHistory } from './collar_history';
import { DataLife } from './data_life';

export enum eTaxon {
  caribou = 'caribou',
  grizzly_bear = 'grizzly bear',
  moose = 'moose',
  grey_wolf = 'grey wolf'
}

const { caribou, grizzly_bear, moose, grey_wolf } = eTaxon;

// // used in critter getters to specify collar attachment status

export interface Itaxon {
  id: string;
  name: string;
}

export enum eCritterFetchType {
  assigned = 'assigned',
  unassigned = 'unassigned'
}

export enum eCritterStatus {
  alive = 'Alive',
  mortality = 'Mortality'
}

export type ICollectionUnit = Record<string, string>;

// * CRITTERBASE INTEGRATION *
export class Critter {
  readonly critter_id: uuid;
  wlh_id: string;
  animal_id: string;
  sex: string;
  taxon: string;
  collection_units: ICollectionUnit[];
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) mortality_timestamp: Dayjs;

  get critter_status(): string {
    return this.mortality_timestamp ? eCritterStatus.mortality : eCritterStatus.alive;
  }

  get collection_unit(): string {
    return this.collection_units
      ?.map((unit) => {
        const [category] = Object.keys(unit);
        `${category}: ${unit[category]}`;
      })
      .join(', ');
  }

  tagColor(): string {
    switch (this.taxon.toLowerCase()) {
      case 'caribou' || 'rangifer tarandus':
        return '#9575cd';
      case 'moose' || 'alces alces':
        return '#64b5f6';
      case 'grey wolf' || 'canis lupus':
        return '#4db6ac';
      case 'grizzly bear' || 'usrsus arctos':
        return '#81c784';
      default:
        return '#bdbdbd';
    }
  }

  constructor(critter_id = '') {
    this.critter_id = critter_id;
  }
}
//TODO CRITTERBASE INTEGRATION go through and double check the types are correct for each property.
// * CRITTERBASE INTEGRATION *
export class CritterDetails extends Critter {
  responsible_region_nr_id: uuid;
  responsible_region: string;
  system_origin: string;
  create_user: uuid;
  update_user: uuid;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) create_timestamp: Dayjs;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) update_timestamp: Dayjs;
  critter_comment: string;
  //Finish these types;
  mortality: unknown[];
  capture: {
    capture_id: uuid;
    capture_location_id: uuid;
    relase_location_id: uuid;
    capture_timestamp: Dayjs;
    release_timestamp: Dayjs;
    capture_location: {
      latitude: number;
      longitude: number;
      region_env_name: string;
      region_nr_name: string;
      wmu_name: string;
    };
    release_location: {
      latitude: number;
      longitude: number;
      region_env_name: string;
      region_nr_name: string;
      wmu_name: string;
    };
  }[];
  marking: {
    marking_id: uuid;
    capture_id: uuid | null;
    mortality_id: uuid | null;
    identifier: string;
    frequency: number;
    frequency_unit: string; //This is an enum in critterbase
    order: number;
    comment: string;
    attached_timestamp: Dayjs;
    removed_timestamp: Dayjs;
    body_location: string;
    marking_type: string;
    marking_material: string;
    primary_colour: string;
    secondary_colour: string;
    text_colour: string;
  }[];
  measurement: {
    qualitative: {
      measurement_qualitative_id: uuid;
      taxon_measurement_id: uuid;
      capture_id: uuid;
      mortality_id: uuid | null;
      qualitative_option_id: uuid;
      measurement_comment: string;
      measured_timestamp: Dayjs | null;
      measurement_name: string;
      option_label: string;
      option_value: number;
    }[];
    quantitative: {
      measurement_quantitative_id: uuid;
      taxon_measurement_id: uuid;
      capture_id: uuid;
      mortality_id: uuid | null;
      value: number;
      measurement_comment: string;
      measured_timestamp: Dayjs;
      measurement_name: string;
    }[];
  };

  formatPropAsHeader(str: keyof CritterDetails): string {
    switch (str) {
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }
}

/**
 * Animal properties that are re-used in Telemetry classes (map.ts)
 */
export interface IAnimalTelemetryBase {
  animal_id: string;
  critter_status: eCritterStatus;
  capture_date: Dayjs | Date;
  collective_unit: string;
  map_colour: Code;
  taxon: string;
  collection_unit: ICollectionUnit[];
  wlh_id: string;
}

// export interface IAnimal extends BaseTimestamps, IAnimalTelemetryBase {
//   animal_colouration: string;
//   animal_comment: string;
//   associated_animal_id: string;
//   associated_animal_relationship: Code;

//   capture_comment: string;
//   capture_latitude: number;
//   capture_longitude: number;
//   capture_utm_easting: number;
//   capture_utm_northing: number;
//   capture_utm_zone: number;

//   readonly critter_id: uuid;
//   readonly critter_transaction_id: uuid;
//   ear_tag_left_id: string;
//   ear_tag_right_id: string;
//   ear_tag_left_colour: string;
//   ear_tag_right_colour: string;
//   estimated_age: number;
//   juvenile_at_heel: Code;
//   juvenile_at_heel_count: number;
//   life_stage: Code;

//   mortality_comment: string;
//   mortality_date: Dayjs;
//   mortality_latitude: number;
//   mortality_longitude: number;
//   mortality_utm_easting: number;
//   mortality_utm_northing: number;
//   mortality_utm_zone: number;
//   mortality_report_ind: boolean;
//   mortality_investigation: Code;
//   captivity_status_ind: boolean;
//   mortality_captivity_status_ind: boolean;

//   permission_type?: eCritterPermission; // critters should contain this
//   predator_known_ind: boolean;
//   predator_taxon_pcod: Code;
//   predator_taxon_ucod: Code;
//   proximate_cause_of_death: Code;
//   ucod_confidence: Code;
//   pcod_confidence: Code;
//   recapture_ind: boolean;
//   region: Code;

//   release_comment: string;
//   release_date: Dayjs;
//   release_latitude: number;
//   release_longitude: number;
//   release_utm_easting: number;
//   release_utm_northing: number;
//   release_utm_zone: number;

//   sex: Code;
//   translocation_ind: boolean;
//   ultimate_cause_of_death: Code;
// }

export class Animal implements BCTWBase<Animal> {
  readonly critter_id: uuid;
  @Exclude(toPlainOnly) critter_transaction_id: uuid;
  readonly _merged?: boolean;
  animal_id: string;
  critter_status: eCritterStatus;
  associated_animal_id: string;
  associated_animal_relationship: Code;
  capture_comment: string;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) capture_date: Dayjs;
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;
  collective_unit: string;
  animal_colouration: string;
  ear_tag_left_id: string;
  ear_tag_right_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  estimated_age: number;
  juvenile_at_heel: Code;
  juvenile_at_heel_count: number;
  life_stage: Code;
  @Exclude(toPlainOnly) map_colour: Code;
  mortality_comment: string;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) mortality_date: Dayjs;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  predator_known_ind: boolean;
  predator_taxon_pcod: Code;
  predator_taxon_ucod: Code;
  proximate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  ultimate_cause_of_death: Code;
  collection_unit: ICollectionUnit[];
  recapture_ind: boolean;
  region: Code;
  release_comment: string;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) release_date: Dayjs;
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;
  sex: Code;
  taxon: string;
  translocation_ind: boolean;
  wlh_id: string;
  animal_comment: string;
  @Transform(nullToDayjs) last_transmission_date?: Dayjs;
  @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_from: Dayjs;
  @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_to: Dayjs;
  @Exclude(toPlainOnly) owned_by_user_id: number;

  mortality_report_ind: boolean;
  mortality_investigation: Code;
  captivity_status_ind: boolean;
  mortality_captivity_status_ind: boolean;

  @Exclude(toPlainOnly) permission_type: eCritterPermission;

  get identifier(): keyof Animal {
    return 'critter_id';
  }
  get name(): string {
    return this.wlh_id ?? this.animal_id;
  }

  static get toCSVHeaderTemplate(): string[] {
    const excluded: (keyof Animal)[] = ['critter_transaction_id'];
    const keys = Object.keys(new Animal()).filter((k) => !(excluded as string[]).includes(k));
    return keys;
  }

  toJSON(): Animal {
    const n = Object.assign(new Animal(), this);
    delete n.permission_type;
    delete n.map_colour;
    delete n.valid_from;
    delete n.valid_to;
    delete n.owned_by_user_id;
    return n;
  }

  formatPropAsHeader(str: keyof Animal): string {
    switch (str) {
      case 'associated_animal_relationship':
        return 'Associated Relationship';
      case 'collective_unit':
        return 'Collective Unit Name';
      case 'juvenile_at_heel_count':
        return 'Juvenile Count';
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }

  get displayProps(): (keyof Animal)[] {
    return ['taxon', 'collection_unit', 'wlh_id', 'animal_id', 'critter_status'];
    //return Animal.toCSVHeaderTemplate;
  }

  historyDisplayProps(): (keyof Animal)[] {
    const keys = Object.keys(new Animal()) as unknown as (keyof Animal)[];
    const startsWith = this.displayProps;
    const excludes = ['critter_id', 'critter_transaction_id'] as (keyof Animal)[];
    return classToArray(keys, startsWith, excludes);
  }

  tagColor(): string {
    switch (this.taxon.toLowerCase()) {
      case 'caribou':
        return '#9575cd';
      case 'moose':
        return '#64b5f6';
      case 'grey wolf':
        return '#4db6ac';
      case 'grizzly bear':
        return '#81c784';
      default:
        return '#bdbdbd';
    }
  }

  constructor(critter_id = '') {
    this.critter_id = critter_id;
  }
}

// animals attached to devices should have additional properties
export interface IAttachedAnimal extends ICollarHistory, DataLife {}

export class AttachedAnimal extends Animal implements IAttachedAnimal, BCTWBase<AttachedAnimal> {
  @Exclude(toPlainOnly) assignment_id: uuid;
  collar_id: uuid;
  device_id: number;
  device_make: Code;
  device_type: Code;
  frequency: number;
  device_status: string;
  latitude: number;
  longitude: number;
  @Exclude(toPlainOnly) attachment_start: Dayjs;
  @Exclude(toPlainOnly) data_life_start: Dayjs;
  @Exclude(toPlainOnly) data_life_end: Dayjs;
  @Exclude(toPlainOnly) attachment_end: Dayjs;
  @Transform(nullToDayjs) last_fetch_date?: Dayjs;
  @Transform(nullToDayjs) last_transmission_date?: Dayjs;

  get lastLatLong(): string {
    if (this.latitude && this.longitude) {
      return `${this.latitude.toFixed(2)} ${this.longitude.toFixed(2)}`;
    } else {
      return null;
    }
  }
  // con't overide since this class is inherited
  static get attachedCritterDisplayProps(): (keyof AttachedAnimal)[] {
    return [
      'taxon',
      'wlh_id',
      'animal_id',
      'device_status',
      'critter_status',
      'device_id',
      'frequency',
      'lastLatLong'
      // 'telemetry_updated',
      // 'last_fetch'
      //'lastKnownLocation'
      // 'latitude',
      // 'longitude'
    ];
  }

  static get attachedCritterExportProps(): (keyof AttachedAnimal)[] {
    return [
      'taxon',
      'wlh_id',
      'animal_id',
      'device_status',
      'critter_status',
      'device_id',
      'frequency',
      'latitude',
      'longitude'
    ];
  }

  tagColor(): string {
    return super.tagColor();
  }

  formatPropAsHeader(str: keyof Animal | keyof AttachedAnimal): string {
    if (str in Animal) {
      return super.formatPropAsHeader(str as keyof Animal);
    } else {
      switch (str) {
        case 'device_status':
          return 'Collar Status';
        case 'lastLatLong':
          return 'Last Lat Long';
        case 'last_transmission_date':
          return 'Last Transmission';
        case 'last_fetch_date':
          return 'Last Update Attempt';
        default:
          return columnToHeader(str);
      }
    }
  }
}

// taxon: [] represents field applies to all taxon, used for optimization on searching
export type CritterDetailsForm = Partial<CritterDetails> &
  CritterDetails['marking'][0] &
  CritterDetails['capture'][0] &
  CritterDetails['capture'][0] &
  CritterDetails['capture'][0]['capture_location'] &
  CritterDetails['mortality'][0] &
  CritterDetails['measurement']['qualitative'][0] &
  CritterDetails['measurement']['quantitative'][0];

// capture: {
//   capture_id: uuid;
//   capture_location_id: uuid;
//   relase_location_id: uuid;
//   capture_timestamp: Dayjs;
//   release_timestamp: Dayjs;
//   capture_location: {
//     latitude: number;
//     longitude: number;
//     region_env_name: string;
//     region_nr_name: string;
//     wmu_name: string;
//   };
//   release_location: {
//     latitude: number;
//     longitude: number;
//     region_env_name: string;
//     region_nr_name: string;
//     wmu_name: string;
//   };

export const critterFormFields: Record<string, FormFieldObject<CritterDetailsForm>[]> = {
  taxonField: [{ prop: 'taxon', type: eInputType.code, taxon: [], ...isRequired }],
  //TODO critterbase integration does not support these in the same way
  // associatedAnimalFields: [
  //   { prop: 'associated_animal_id', type: eInputType.text, taxon: [] },
  //   { prop: 'associated_animal_relationship', type: eInputType.code, taxon: [] }
  // ],
  //! Add capture fields to detailed critter
  captureFields: [
    { prop: 'capture_timestamp', type: eInputType.datetime, taxon: [] }, //TODO critterbase integration change to capture_timestamp
    { prop: 'latitude', type: eInputType.number, taxon: []},
    { prop: 'longitude', type: eInputType.number, taxon: []},
    { prop: 'region_env_name', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_env' },
    { prop: 'region_nr_name', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_nr' },
    { prop: 'wmu_name', type: eInputType.cb_select, taxon: [], cbRouteKey: 'wmu'},
  ],
  releaseFields: [
    { prop: 'release_timestamp', type: eInputType.datetime, taxon: [] }, //TODO critterbase integration change to capture_timestamp
    { prop: 'latitude', type: eInputType.number, taxon: []},
    { prop: 'longitude', type: eInputType.number, taxon: []},
    { prop: 'region_env_name', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_env' },
    { prop: 'region_nr_name', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_nr' },
    { prop: 'wmu_name', type: eInputType.cb_select, taxon: [], cbRouteKey: 'wmu'},
  ],
  characteristicsFields: [
    { prop: 'critter_status', type: eInputType.cb_select, taxon: [], ...isRequired, cbRouteKey: 'critter_status' },
    { prop: 'responsible_region', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_nr' },
    //{ prop: 'collection_unit', type: eInputType.cb_select, taxon: [] } //This select will need additional work, array of objects. Flatten and display multiple selects for array
    //TODO these properties do not exist on critterbase critter in the same way
    // { prop: 'animal_colouration', type: eInputType.text, taxon: [] },
    // { prop: 'estimated_age', type: eInputType.number, taxon: [], validate: mustbePositiveNumber },
    // { prop: 'life_stage', type: eInputType.code, taxon: [] } //taxon dependant, with code table
  ],
  //TODO critterbase integration does not support these in the same way
  // characteristicFields2: [
  //   { prop: 'juvenile_at_heel', type: eInputType.code, taxon: [] },
  //   { prop: 'juvenile_at_heel_count', type: eInputType.number, taxon: [], validate: mustbePositiveNumber }
  // ],
  identifierFields: [
    { prop: 'wlh_id', type: eInputType.text, taxon: [] },
    { prop: 'animal_id', type: eInputType.text, taxon: [] },
    { prop: 'sex', type: eInputType.cb_select, taxon: [], ...isRequired, cbRouteKey: 'sex' }
  ],
  // markingFields: [
  //   { prop: 'ear_tag_left_colour', type: eInputType.text, taxon: [] },
  //   { prop: 'ear_tag_right_colour', type: eInputType.text, taxon: [] },
  //   { prop: 'ear_tag_left_id', type: eInputType.text, taxon: [] },
  //   { prop: 'ear_tag_right_id', type: eInputType.text, taxon: [] }
  // ],
  //TODO add mortality fields back
  // mortalityFields: [
  //   { prop: 'mortality_date', type: eInputType.datetime, taxon: [] }, //TODO critterbase integration change to mortality_timestamp
  //   { prop: 'mortality_latitude', type: eInputType.number, taxon: [] },
  //   { prop: 'mortality_longitude', type: eInputType.number, taxon: [] },
  //   { prop: 'mortality_utm_zone', type: eInputType.number, taxon: [] },
  //   { prop: 'mortality_utm_easting', type: eInputType.number, taxon: [] },
  //   { prop: 'mortality_utm_northing', type: eInputType.number, taxon: [] },
  //   { prop: 'proximate_cause_of_death', type: eInputType.code, taxon: [caribou] },
  //   { prop: 'ultimate_cause_of_death', type: eInputType.code, taxon: [caribou] },
  //   { prop: 'pcod_confidence', type: eInputType.code, taxon: [caribou], codeName: 'cod_confidence' },
  //   { prop: 'ucod_confidence', type: eInputType.code, taxon: [caribou], codeName: 'cod_confidence' },
  //   { prop: 'predator_taxon_pcod', type: eInputType.code, taxon: [caribou], codeName: 'predator_taxon' },
  //   { prop: 'predator_taxon_ucod', type: eInputType.code, taxon: [caribou], codeName: 'predator_taxon' },
  //   { prop: 'mortality_investigation', type: eInputType.code, taxon: [caribou] },
  //   { prop: 'mortality_report_ind', type: eInputType.check, taxon: [caribou] },
  //   { prop: 'predator_known_ind', type: eInputType.check, taxon: [caribou] },
  //   { prop: 'mortality_comment', type: eInputType.multiline, taxon: [] }
  // ],
  //TODO critterbase integration does not support release values in the same way
  // releaseFields: [
  //   { prop: 'release_date', type: eInputType.datetime, taxon: [] },
  //   { prop: 'release_latitude', type: eInputType.number, taxon: [] },
  //   { prop: 'release_longitude', type: eInputType.number, taxon: [] },
  //   { prop: 'release_utm_zone', type: eInputType.number, taxon: [] },
  //   { prop: 'release_utm_easting', type: eInputType.number, taxon: [] },
  //   { prop: 'release_utm_northing', type: eInputType.number, taxon: [] },
  //   { prop: 'translocation_ind', type: eInputType.check, taxon: [] },
  //   { prop: 'release_comment', type: eInputType.multiline, taxon: [] }
  // ],
  animalCommentField: [{ prop: 'critter_comment', type: eInputType.multiline, taxon: [] }]
};

// a 'flatteneed' critterFormFields array
export const getAnimalFormFields = (): FormFieldObject<Partial<CritterDetailsForm>>[] => {
  return Object.values(critterFormFields).reduce((previous, current) => [...previous, ...current], []);
};

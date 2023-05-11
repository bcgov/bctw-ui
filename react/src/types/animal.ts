import { Exclude, Transform } from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
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
  alive = 'alive',
  mortality = 'mortality'
}

export type ICollectionUnit = Record<string, string>;

export type Critters = Critter | AttachedCritter;

interface CritterLocation {
  latitude: number;
  longitude: number;
  region_env_name: string;
  region_nr_name: string;
  wmu_name: string;
}

interface CritterReleaseLocation extends CritterLocation {
  release_latitude: never;
  release_longitude: never;
  release_region_env_id: never;
  release_region_nr_id: never;
  release_wmu_id: never;
}

interface CritterCaptureLocation extends CritterLocation {
  capture_latitude: never;
  capture_longitude: never;
  capture_region_env_id: never;
  capture_region_nr_id: never;
  capture_wmu_id: never;
  
}
interface CritterCapture {
  capture_id: uuid;
  capture_location_id: uuid;
  relase_location_id: uuid;
  capture_timestamp: Dayjs;
  release_timestamp: Dayjs;
  capture_location: CritterCaptureLocation;
  release_location: CritterReleaseLocation;
}

interface CritterMortality {
  mortality_id: uuid;
  location_id: uuid;
  mortality_timestamp: Dayjs;
  proximate_cause_of_death_id: uuid;
  proximate_cause_of_death_confidence: 'Probable' | 'Definite';
  proximate_predated_by_taxon_id: uuid;
  ultimate_cause_of_death_id: uuid;
  ultimate_cause_of_death_confidence: 'Probable' | 'Definite';
  ultimate_predated_by_taxon_id: uuid;
}

interface CritterMarking {
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
}

interface CritterQualitativeMeasurement {
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
}

interface CritterQuantitativeMeasurement {
  measurement_quantitative_id: uuid;
  taxon_measurement_id: uuid;
  capture_id: uuid;
  mortality_id: uuid | null;
  value: number;
  measurement_comment: string;
  measured_timestamp: Dayjs;
  measurement_name: string;
}

interface CritterMeasurement {
  qualitative: CritterQualitativeMeasurement[];
  quantitative: CritterQuantitativeMeasurement[];
}

/**
 * Critter properties that are re-used in Telemetry classes (map.ts)
 */
export type ICritterTelemetryBase = {map_colour: Code} & Pick<Critter, 'animal_id' | 'critter_status' | 'taxon' | 'collection_unit' | 'collection_units' | 'wlh_id'>


// * CRITTERBASE INTEGRATION *
export class Critter implements BCTWBase<Critter>{
  readonly critter_id: uuid;
  wlh_id: string;
  animal_id: string;
  sex: string;
  taxon_id: uuid;
  readonly taxon: string;
  collection_units: ICollectionUnit[];
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) mortality_timestamp: Dayjs;
  responsible_region_nr_id?: uuid;
  readonly responsible_region?: string;
  readonly system_origin?: string;
  readonly create_user?: uuid;
  readonly update_user?: uuid;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) readonly create_timestamp?: Dayjs;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) readonly update_timestamp?: Dayjs;
  critter_comment?: string;
  //Extra details
  //mortality?: CritterMortality[];
  capture?: CritterCapture[];
  marking?: CritterMarking[];
  measurement?: CritterMeasurement[];

  readonly _merged?: boolean;
  permission_type?: eCritterPermission;

  get identifier(): keyof Critter {
    return 'critter_id';
  }

  get name(): string {
    return this.wlh_id ?? this.animal_id;
  }

  get critter_status(): string {
    return dayjs(this.mortality_timestamp).isValid() ? eCritterStatus.mortality : eCritterStatus.alive;
  }

  get displayProps(): (keyof Critter)[] {
    return ['taxon', 'collection_unit', 'wlh_id', 'animal_id', 'critter_status'];
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

  formatPropAsHeader(str: keyof Critter): string {
    switch (str) {
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }
  historyDisplayProps(): (keyof Critter)[] {
    const keys = Object.keys(new Critter()) as unknown as (keyof Critter)[];
    const startsWith = this.displayProps;
    const excludes = ['critter_id'] as (keyof Critter)[];
    return classToArray(keys, startsWith, excludes);
  }

  toJSON(): Critter {
    const n = Object.assign(new Critter(), this);
    delete n.permission_type;
    return n;
  }


  constructor(critter_id = '') {
    this.critter_id = critter_id;
  }

}

export class AttachedCritter extends Critter implements BCTWBase<AttachedCritter> {
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

  static get attachedCritterDisplayProps(): (keyof AttachedCritter)[] {
    return [
      'taxon',
      'wlh_id',
      'animal_id',
      'device_status',
      'critter_status',
      'device_id',
      'frequency',
      'lastLatLong'
    ];
  }

  static get attachedCritterExportProps(): (keyof AttachedCritter)[] {
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

  formatPropAsHeader(str: keyof Critter | keyof AttachedCritter): string {
    if (str in Critter) {
      return super.formatPropAsHeader(str as keyof Critter);
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

export type CritterDetailsForm = Partial<Critter> & 
CritterCapture & 
CritterCapture['capture_location'] & 
CritterCapture['release_location'] & 
CritterMarking & 
CritterMeasurement

export const critterFormFields: Record<string, FormFieldObject<CritterDetailsForm>[]> = {
  identifierFields: [
    { prop: 'taxon_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'species', ...isRequired },
    { prop: 'wlh_id', type: eInputType.text, taxon: [] },
    { prop: 'animal_id', type: eInputType.text, taxon: [] },
    { prop: 'sex', type: eInputType.cb_select, taxon: [], ...isRequired, cbRouteKey: 'sex' }
  ],
  characteristicsFields: [
    { prop: 'critter_status', type: eInputType.cb_select, taxon: [], ...isRequired, cbRouteKey: 'critter_status' },
    { prop: 'responsible_region_nr_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_nr' },
    { prop: 'critter_comment', type: eInputType.multiline, taxon: [] }
    //{ prop: 'collection_unit', type: eInputType.cb_select, taxon: [] } //This select will need additional work, array of objects. Flatten and display multiple selects for array
  ],
  captureFields: [
    { prop: 'capture_timestamp', type: eInputType.datetime, taxon: [] }, //TODO critterbase integration change to capture_timestamp
    { prop: 'latitude', type: eInputType.number, taxon: []},
    { prop: 'longitude', type: eInputType.number, taxon: []},
    { prop: 'capture_region_env_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_env' },
    { prop: 'capture_region_nr_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_nr' },
    { prop: 'capture_wmu_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'wmu'},
  ],
  releaseFields: [
    { prop: 'release_timestamp', type: eInputType.datetime, taxon: [] }, //TODO critterbase integration change to capture_timestamp
    { prop: 'latitude', type: eInputType.number, taxon: []},
    { prop: 'longitude', type: eInputType.number, taxon: []},
    { prop: 'release_region_env_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_env' },
    { prop: 'release_region_nr_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'region_nr' },
    { prop: 'release_wmu_id', type: eInputType.cb_select, taxon: [], cbRouteKey: 'wmu'},
  ],
  //TODO critterbase integration does not support these in the same way
  // characteristicFields2: [
  //   { prop: 'juvenile_at_heel', type: eInputType.code, taxon: [] },
  //   { prop: 'juvenile_at_heel_count', type: eInputType.number, taxon: [], validate: mustbePositiveNumber }
  // ],
  //TODO critterbase integration does not support these in the same way
  // associatedAnimalFields: [
  //   { prop: 'associated_animal_id', type: eInputType.text, taxon: [] },
  //   { prop: 'associated_animal_relationship', type: eInputType.code, taxon: [] }
  // ],
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
  // animalCommentField: [{ prop: 'critter_comment', type: eInputType.multiline, taxon: [] }]
};

// a 'flatteneed' critterFormFields array
export const getAnimalFormFields = (): FormFieldObject<Partial<CritterDetailsForm>>[] => {
  return Object.values(critterFormFields).reduce((previous, current) => [...previous, ...current], []);
};



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

// export class Critter implements BCTWBase<Critter> {
//   readonly critter_id: uuid;
//   @Exclude(toPlainOnly) critter_transaction_id: uuid;
//   readonly _merged?: boolean;
//   animal_id: string;
//   critter_status: eCritterStatus;
//   associated_animal_id: string;
//   associated_animal_relationship: Code;
//   capture_comment: string;
//   @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) capture_date: Dayjs;
//   capture_latitude: number;
//   capture_longitude: number;
//   capture_utm_easting: number;
//   capture_utm_northing: number;
//   capture_utm_zone: number;
//   collective_unit: string;
//   animal_colouration: string;
//   ear_tag_left_id: string;
//   ear_tag_right_id: string;
//   ear_tag_left_colour: string;
//   ear_tag_right_colour: string;
//   estimated_age: number;
//   juvenile_at_heel: Code;
//   juvenile_at_heel_count: number;
//   life_stage: Code;
//   @Exclude(toPlainOnly) map_colour: Code;
//   mortality_comment: string;
//   @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) mortality_date: Dayjs;
//   mortality_latitude: number;
//   mortality_longitude: number;
//   mortality_utm_easting: number;
//   mortality_utm_northing: number;
//   mortality_utm_zone: number;
//   predator_known_ind: boolean;
//   predator_taxon_pcod: Code;
//   predator_taxon_ucod: Code;
//   proximate_cause_of_death: Code;
//   ucod_confidence: Code;
//   pcod_confidence: Code;
//   ultimate_cause_of_death: Code;
//   collection_unit: ICollectionUnit[];
//   recapture_ind: boolean;
//   region: Code;
//   release_comment: string;
//   @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) release_date: Dayjs;
//   release_latitude: number;
//   release_longitude: number;
//   release_utm_easting: number;
//   release_utm_northing: number;
//   release_utm_zone: number;
//   sex: Code;
//   taxon: string;
//   translocation_ind: boolean;
//   wlh_id: string;
//   animal_comment: string;
//   @Transform(nullToDayjs) last_transmission_date?: Dayjs;
//   @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_from: Dayjs;
//   @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_to: Dayjs;
//   @Exclude(toPlainOnly) owned_by_user_id: number;

//   mortality_report_ind: boolean;
//   mortality_investigation: Code;
//   captivity_status_ind: boolean;
//   mortality_captivity_status_ind: boolean;

//   @Exclude(toPlainOnly) permission_type: eCritterPermission;

//   get identifier(): keyof Critter {
//     return 'critter_id';
//   }
//   get name(): string {
//     return this.wlh_id ?? this.animal_id;
//   }

//   static get toCSVHeaderTemplate(): string[] {
//     const excluded: (keyof Critter)[] = ['critter_transaction_id'];
//     const keys = Object.keys(new Critter()).filter((k) => !(excluded as string[]).includes(k));
//     return keys;
//   }

//   toJSON(): Critter {
//     const n = Object.assign(new Critter(), this);
//     delete n.permission_type;
//     delete n.map_colour;
//     delete n.valid_from;
//     delete n.valid_to;
//     delete n.owned_by_user_id;
//     return n;
//   }

//   formatPropAsHeader(str: keyof Critter): string {
//     switch (str) {
//       case 'associated_animal_relationship':
//         return 'Associated Relationship';
//       case 'collective_unit':
//         return 'Collective Unit Name';
//       case 'juvenile_at_heel_count':
//         return 'Juvenile Count';
//       case 'wlh_id':
//         return 'WLH ID';
//       default:
//         return columnToHeader(str);
//     }
//   }

//   get displayProps(): (keyof Critter)[] {
//     return ['taxon', 'collection_unit', 'wlh_id', 'animal_id', 'critter_status'];
//     //return Critter.toCSVHeaderTemplate;
//   }

//   historyDisplayProps(): (keyof Critter)[] {
//     const keys = Object.keys(new Critter()) as unknown as (keyof Critter)[];
//     const startsWith = this.displayProps;
//     const excludes = ['critter_id', 'critter_transaction_id'] as (keyof Critter)[];
//     return classToArray(keys, startsWith, excludes);
//   }

//   tagColor(): string {
//     switch (this.taxon.toLowerCase()) {
//       case 'caribou':
//         return '#9575cd';
//       case 'moose':
//         return '#64b5f6';
//       case 'grey wolf':
//         return '#4db6ac';
//       case 'grizzly bear':
//         return '#81c784';
//       default:
//         return '#bdbdbd';
//     }
//   }

//   constructor(critter_id = '') {
//     this.critter_id = critter_id;
//   }
// }

// // animals attached to devices should have additional properties
// export interface IAttachedAnimal extends ICollarHistory, DataLife {}



// taxon: [] represents field applies to all taxon, used for optimization on searching


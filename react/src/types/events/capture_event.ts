import { classToPlain, plainToClass } from 'class-transformer';
import { mustBeLessThan50Words } from 'components/form/form_validators';
import { WorkflowStrings } from 'constants/strings';
import dayjs, { Dayjs } from 'dayjs';
import { Critter, ICollectionUnit } from 'types/animal';
import { Code } from 'types/code';
import { CollarHistory } from 'types/collar_history';
import { uuid } from 'types/common_types';
import { IDataLifeStartProps } from 'types/data_life';
import { BCTWWorkflow, OptionalAnimal, WorkflowType, eventToJSON } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { FormCommentStyle, FormFieldObject, eInputType } from 'types/form_types';
import { columnToHeader, omitNull } from 'utils/common_helpers';

export class CaptureEvent2 implements BCTWWorkflow<CaptureEvent2>, CaptureAnimalEventProps {
  readonly event_type: WorkflowType;
  readonly critter_id: uuid;
  readonly wlh_id: string;
  readonly taxon: string;
  readonly animal_id: string;
  readonly collection_unit: string; // This will probably need to be changed to collection_units: ICollectionUnit[]

  //Critterbase fields
  capture_id: uuid;
  capture_timestamp: Dayjs;
  capture_comment: string;
  release_comment: string;
  capture_location: LocationEvent;
  release_location: LocationEvent;
  release_timestamp: Dayjs;

  //Leftovers from BCTW implementation. Are these needed?
  shouldSaveAnimal: boolean;
  shouldSaveDevice: boolean;

  //Additional workflow fields
  capture_mortality: boolean;
  release_mortality: boolean;
  show_release: boolean;
  get captureCritterbaseProps(): (keyof CaptureEvent2)[] {
    return [
      'capture_id',
      'capture_timestamp',
      'capture_comment',
      'release_location',
      'release_timestamp',
      'release_comment',
      'release_location'
    ];
  }

  constructor() {
    this.event_type = 'capture';
    // this.capture_timestamp = capture_timestamp ?? dayjs();
    this.capture_location = new LocationEvent('capture');
    this.release_location = new LocationEvent('release');
  }

  get displayProps(): (keyof CaptureEvent2)[] {
    return ['taxon', 'wlh_id', 'critter_id'];
  }

  formatPropAsHeader(s: keyof CaptureEvent2): string {
    return columnToHeader(s);
  }

  getWorkflowTitle(): string {
    return WorkflowStrings.capture.workflowTitle;
  }
  // getCritterbasePayload() {
  //   const payload = {
  //     critter_id: this.critter_id,
  //     capture_timestamp: this.capture_timestamp,
  //     capture_comment: this.capture_comment,
  //     release_comment: this.release_comment,
  //     capture_location: this.capture_location,
  //     release_location: this.release_location,
  //     release_timestamp: this.release_timestamp
  //   };
  //   return omitNull(payload);
  // }

  fields: CaptureFormField2 = {
    capture_timestamp: { prop: 'capture_timestamp', type: eInputType.date, required: true },
    capture_mortality: { prop: 'capture_mortality', type: eInputType.check },
    capture_comment: {
      prop: 'capture_comment',
      type: eInputType.text,
      style: FormCommentStyle,
      validate: mustBeLessThan50Words
    },
    release_timestamp: { prop: 'release_timestamp', type: eInputType.date, required: true },
    release_comment: {
      prop: 'release_comment',
      type: eInputType.text,
      style: FormCommentStyle,
      validate: mustBeLessThan50Words
    },
    release_mortality: { prop: 'release_mortality', type: eInputType.check },
    show_release: { prop: 'show_release', type: eInputType.check }
  };
}

type CaptureAnimalEventProps = Pick<
  Critter,
  | 'critter_id'
  | 'animal_id'
  | 'wlh_id'
  | 'taxon'
  // | 'recapture_ind'
  // | 'translocation_ind'
  // | 'associated_animal_id'
  // | 'associated_animal_relationship'
  // | 'region'
  | 'collection_unit'
  // | 'captivity_status_ind'
>;

type ReleaseAnimalProps = Pick<
  Critter,
  // | 'ear_tag_left_id'
  // | 'ear_tag_right_id'
  // | 'ear_tag_left_colour'
  // | 'ear_tag_right_colour'
  // | 'juvenile_at_heel'
  // | 'juvenile_at_heel_count'
  // | 'animal_colouration'
  // | 'life_stage'
  //TODO CRITTERBASE INTEGRATION temp fix
  'critter_id'
>;

type CaptureReleaseProps = {
  // workflow should proceed to release workflow
  wasReleased: boolean;
  // workflow should proceed to mortality workflow
  didDieDuringCapture: boolean;
  didDieDuringTransloc: boolean;
  // indicates the animal was released after successful translocation
  // workflow should proceed to release
  isTranslocationComplete: boolean;
};

export type CaptureFormField2 = {
  [Property in keyof CaptureEvent2]+?: FormFieldObject<CaptureEvent2>;
};

export type CaptureFormField = {
  [Property in keyof CaptureEvent]+?: FormFieldObject<CaptureEvent>;
};
/**
 * capture date / data life ??!?
 * assume data life is the capture date?
 */
export default class CaptureEvent
  implements
    CaptureAnimalEventProps,
    ReleaseAnimalProps,
    Readonly<Pick<CollarHistory, 'assignment_id'>>,
    IDataLifeStartProps,
    BCTWWorkflow<CaptureEvent>,
    CaptureReleaseProps
{
  // workflow props
  readonly event_type: WorkflowType;
  shouldSaveDevice: boolean;
  readonly shouldSaveAnimal = true;
  isAssociated: boolean; // has an animal association
  location_event: LocationEvent;
  wasReleased: boolean;
  didDieDuringCapture: boolean;
  didDieDuringTransloc: boolean;
  isTranslocationComplete: boolean;
  // data life props
  readonly assignment_id: uuid;
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  // critter props
  readonly critter_id: uuid;
  readonly wlh_id: string;
  readonly animal_id: string;
  taxon: Code;
  recapture_ind: boolean;
  translocation_ind: boolean;
  associated_animal_id: string;
  associated_animal_relationship: Code; // required if associated_animal_id populated
  // region & popunit are enabled when animal is translocated
  region: Code;
  collection_unit: string;
  captivity_status_ind: boolean;
  // characteristic fields
  ear_tag_left_id: string;
  ear_tag_right_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  juvenile_at_heel: Code;
  juvenile_at_heel_count: number;
  animal_colouration: string;
  life_stage: Code;

  constructor() {
    this.event_type = 'capture';
    this.recapture_ind = false;
    this.translocation_ind = false;
    this.isTranslocationComplete = true;
    this.location_event = new LocationEvent('capture');
  }

  formatPropAsHeader(s: keyof CaptureEvent): string {
    switch (s) {
      case 'captivity_status_ind':
        return WorkflowStrings.captivity.isCaptive;
      case 'associated_animal_relationship':
        return 'Associated Relationship';
      case 'isTranslocationComplete':
        return WorkflowStrings.capture.isTranslocCompleted;
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof CaptureEvent)[] {
    return ['wlh_id', 'animal_id'];
  }
  getWorkflowTitle(): string {
    return WorkflowStrings.capture.workflowTitle;
  }

  get captureCritterPropsToSave(): (keyof Critter)[] {
    return [
      'critter_id',
      // 'recapture_ind',
      // 'translocation_ind',
      'taxon'
      // 'associated_animal_id',
      // 'associated_animal_relationship',
      // 'captivity_status_ind',
      // 'ear_tag_left_colour',
      // 'ear_tag_left_id',
      // 'ear_tag_right_colour',
      // 'ear_tag_right_id',
      // 'juvenile_at_heel',
      // 'juvenile_at_heel_count',
      // 'animal_colouration',
      // 'life_stage'
    ];
  }

  getAnimal(): OptionalAnimal {
    const props = this.captureCritterPropsToSave;
    if (this.translocation_ind) {
      // if the translocation is completed, save the new region/population unit.
      // otherwise, need to update critter_status to 'in translocation';
      if (this.isTranslocationComplete) {
        props.push('responsible_region', 'collection_unit');
      } else {
        props.push('critter_status');
      }
    }
    const ret = eventToJSON(props, this);
    if (!this.juvenile_at_heel) {
      delete ret.juvenile_at_heel_count;
    }
    if (this.translocation_ind && !this.isTranslocationComplete) {
      ret['critter_status'] = 'In Translocation';
    }
    if (!ret.associated_animal_id) {
      delete ret.associated_animal_relationship;
    }
    //TODO Critterbase integration old code
    //return omitNull({ ...ret, ...this.location_event.toJSON() });
    return omitNull({ ...ret });
  }

  // todo: should data life be updated??
  // getDataLife(): ChangeDataLifeInput{
  //   if (!this.assignment_id|| !this.location_event.date) {
  //     console.error('cannot update data life in capture event, missing props', this);
  //     return null;
  //   }
  //   const ret: ChangeDataLifeInput = {
  //     assignment_id: this.assignment_id,
  //     data_life_start: this.location_event.date.format(formatTime)
  //   }
  //   return ret;
  // }

  fields: CaptureFormField = {
    isTranslocationComplete: { prop: 'isTranslocationComplete', type: eInputType.check },
    didDieDuringTransloc: { prop: 'didDieDuringTransloc', type: eInputType.check }
  };
}

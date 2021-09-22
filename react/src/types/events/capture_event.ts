import dayjs, { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, eventToJSON } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { Animal } from 'types/animal';
import { IDataLifeStartProps } from 'types/data_life';
import { FormFieldObject } from 'types/form_types';
import { WorkflowStrings } from 'constants/strings';

type CaptureAnimalEventProps = Pick<Animal, 
| 'animal_id'
| 'wlh_id'
| 'species'
| 'recapture'
| 'translocation'
| 'associated_animal_id'
| 'associated_animal_relationship'
| 'region'
| 'population_unit'
| 'captivity_status'
>;

type ReleaseAnimalProps = Pick<Animal,
| 'ear_tag_left_id'
| 'ear_tag_right_id'
| 'ear_tag_left_colour'
| 'ear_tag_right_colour'
| 'juvenile_at_heel'
| 'juvenile_at_heel_count'
| 'animal_colouration'
| 'life_stage'
>;

export type CaptureFormField = {
  [Property in keyof CaptureEvent]+?: FormFieldObject<CaptureEvent>;
};
/**
 * todo:
 * if translocation, enable release fields
 * add captivity component
 * isassociated ? enable association fields
 */

export default class CaptureEvent implements CaptureAnimalEventProps, IDataLifeStartProps, BCTWWorkflow<CaptureEvent> {
  // workflow props
  readonly event_type: WorkflowType;
  shouldSaveDevice: boolean;
  readonly shouldSaveAnimal = true;
  isAssociated: boolean;
  location_event: LocationEvent;
  // data life props
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  // critter props
  readonly wlh_id: string;
  readonly animal_id: string;
  species: Code;
  recapture: boolean;
  translocation: boolean;
  associated_animal_id: string;
  associated_animal_relationship: Code; // required if associated_animal_id populated
  region: Code; // enabled when animal is translocated
  population_unit: Code; // enabled when animal is translocated
  captivity_status: boolean;

  constructor() {
    this.event_type = 'capture';
    this.recapture = false;
    this.translocation = false;
    this.location_event = new LocationEvent('capture', dayjs());
  }

  formatPropAsHeader(s: keyof CaptureEvent): string {
    switch (s) {
      case 'captivity_status':
        return WorkflowStrings.captivity.isCaptive;
      case 'associated_animal_relationship':
        return 'Associated Relationship';
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

  getAnimal(): OptionalAnimal {
    const props: (keyof Animal)[] =
      [
        'critter_id',
      ];
    const ret = eventToJSON(props, this);
    return omitNull({ ...ret, ...this.location_event.toJSON()});
  }

}

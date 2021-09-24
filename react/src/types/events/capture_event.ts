import dayjs, { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, eventToJSON } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { Animal } from 'types/animal';
import { ChangeDataLifeInput, IDataLifeStartProps } from 'types/data_life';
import { FormFieldObject } from 'types/form_types';
import { WorkflowStrings } from 'constants/strings';
import { CollarHistory } from 'types/collar_history';
import { uuid } from 'types/common_types';
import { formatTime } from 'utils/time';

type CaptureAnimalEventProps = Pick<Animal, 
| 'critter_id'
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

export type CaptureFormField = {
  [Property in keyof CaptureEvent]+?: FormFieldObject<CaptureEvent>;
};
/**
 * todo:
 * if translocation, enable release fields
 * capture date / data life ??!?
 * maybe assume data life is the capture date?
 */
export default class CaptureEvent implements 
CaptureAnimalEventProps, 
Readonly<Pick<CollarHistory, 'assignment_id'>>,
IDataLifeStartProps, BCTWWorkflow<CaptureEvent> {
  // workflow props
  readonly event_type: WorkflowType;
  shouldSaveDevice: boolean;
  readonly shouldSaveAnimal = true;
  isAssociated: boolean;
  location_event: LocationEvent;
  // data life props
  readonly assignment_id: uuid;
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  // critter props
  readonly critter_id: uuid;
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
      ['critter_id', 'recapture', 'translocation', 'associated_animal_id',
        'associated_animal_relationship', 'region', 'population_unit', 'captivity_status'];
    const ret = eventToJSON(props, this);
    if (!ret.associated_animal_id) {
      delete ret.associated_animal_relationship
    }
    return omitNull({ ...ret, ...this.location_event.toJSON()});
  }

  getDataLife(): ChangeDataLifeInput{
    if (!this.assignment_id|| !this.location_event.date) {
      console.error('cannot update data life in capture event, missing props', this);
      return null;
    }
    const ret: ChangeDataLifeInput = {
      assignment_id: this.assignment_id,
      data_life_start: this.location_event.date.format(formatTime)
    }
    return ret;
  }

}

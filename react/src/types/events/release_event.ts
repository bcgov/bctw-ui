import dayjs, { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, eventToJSON, IBCTWWorkflow } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { Animal } from 'types/animal';
import { IDataLifeEndProps } from 'types/data_life';
import { eInputType, FormFieldObject } from 'types/form_types';
import { WorkflowStrings } from 'constants/strings';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { uuid } from 'types/common_types';
import { Collar } from 'types/collar';

type ReleaseProps = Pick<Animal,
| 'species'
| 'translocation'
| 'region'
| 'population_unit'
| 'animal_status'
>;

export type ReleaseFormField = {
  [Property in keyof ReleaseEvent]+?: FormFieldObject<ReleaseEvent>;
};

interface IReleaseEvent extends ReleaseProps,
  Readonly<Pick<CollarHistory, 'assignment_id'>>,
  Pick<IBCTWWorkflow, 'shouldUnattachDevice'>,
  Pick<Collar, 'device_id' | 'collar_id'>,
  IDataLifeEndProps {}

/**
 * todo:
 */
export default class ReleaseEvent implements IReleaseEvent, BCTWWorkflow<ReleaseEvent> {
  // workflow props
  readonly event_type: WorkflowType;
  shouldSaveDevice: boolean;
  readonly shouldSaveAnimal = true;
  location_event: LocationEvent;
  readonly assignment_id: uuid;
  shouldUnattachDevice: boolean;
  // data life props
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  // critter props
  readonly wlh_id: string;
  readonly animal_id: string;
  readonly animal_status: Code;
  readonly species: Code;
  translocation: boolean;
  region: Code;
  population_unit: Code;
  //
  readonly collar_id: uuid;
  readonly device_id: number;

  constructor(loc = new LocationEvent('release', dayjs())) {
    this.event_type = 'release';
    // if a location event instance is provided, it will be of type 'capture'. update it
    this.location_event = Object.assign(loc, {location_type: 'release'});
    this.shouldUnattachDevice = false;
  }

  formatPropAsHeader(s: keyof ReleaseEvent): string {
    switch (s) {
      case 'shouldUnattachDevice': 
        return WorkflowStrings.release.isNewDevice;
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof ReleaseEvent)[] {
    return ['species', 'wlh_id', 'animal_id', 'animal_status', 'translocation'];
  }
  getWorkflowTitle(): string {
    return WorkflowStrings.release.workflowTitle;
  }

  getAnimal(): OptionalAnimal {
    const props: (keyof Animal)[] = [ 'critter_id' ];
    // if the critter was being translocated, preserve the region/population unit
    if (this.translocation) {
      props.push('region', 'population_unit');
    }
    const ret = eventToJSON(props, this);
    // if translocation an the animal status was 'in translocation', revert it to alive.
    if (this.translocation && this.animal_status === 'In Translocation') {
      ret['animal_status'] = 'Alive';
    }
    return omitNull({ ...ret, ...this.location_event.toJSON()});
  }

  // todo:
  getAttachment(): RemoveDeviceInput {
    return null;
  }

  fields: ReleaseFormField = {
    // todo: move these to common fields
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
    data_life_start: { prop: 'data_life_start', type: eInputType.datetime },
  }

}

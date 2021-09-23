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

export type ReleaseFormField = {
  [Property in keyof ReleaseEvent]+?: FormFieldObject<ReleaseEvent>;
};

interface IReleaseEvent extends ReleaseAnimalProps,
  Readonly<Pick<CollarHistory, 'assignment_id'>>,
  Pick<IBCTWWorkflow, 'shouldUnattachDevice'>,
  IDataLifeEndProps {}

/**
 * todo:
 * auto-populate release location to capture location unless translocation=true
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
  ear_tag_left_id: string;
  ear_tag_right_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  juvenile_at_heel: Code;
  juvenile_at_heel_count: number;
  animal_colouration: string;
  life_stage: Code;
  species: Code;

  constructor(private isTranslocated: boolean, loc = new LocationEvent('release', dayjs())) {
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
    return ['wlh_id', 'animal_id'];
  }
  getWorkflowTitle(): string {
    return WorkflowStrings.release.workflowTitle;
  }

  getAnimal(): OptionalAnimal {
    const props: (keyof Animal)[] =
      [ 'critter_id', 'ear_tag_left_colour', 'ear_tag_left_id', 'ear_tag_right_colour', 
        'ear_tag_right_id', 'juvenile_at_heel', 'juvenile_at_heel_count', 'animal_colouration',
        'life_stage'
      ];
    const ret = eventToJSON(props, this);
    if (!this.juvenile_at_heel) {
      delete ret.juvenile_at_heel_count;
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

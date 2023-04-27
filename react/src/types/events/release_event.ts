import dayjs, { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, eventToJSON, IBCTWWorkflow } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { Critter, ICollectionUnit, eCritterStatus } from 'types/animal';
import { IDataLifeEndProps } from 'types/data_life';
import { eInputType, FormFieldObject } from 'types/form_types';
import { WorkflowStrings } from 'constants/strings';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { uuid } from 'types/common_types';
import { Collar } from 'types/collar';
import { formatTime } from 'utils/time';
import CaptureEvent from './capture_event';

type ReleaseProps = Pick<Critter, 'taxon' | 'responsible_region' | 'collection_unit' | 'critter_status'>;

export type ReleaseFormField = {
  [Property in keyof ReleaseEvent]+?: FormFieldObject<ReleaseEvent>;
};

interface IReleaseEvent
  extends ReleaseProps,
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
  readonly critter_status: eCritterStatus;
  readonly taxon: Code;
  translocation_ind: boolean;
  region: Code;
  collection_unit: string;

  readonly collar_id: uuid;
  readonly device_id: number;

  private critterPropsToSave: (keyof Critter)[];

  constructor(capture?: CaptureEvent) {
    this.event_type = 'release';
    if (capture) {
      this.location_event = Object.assign(capture.location_event, { location_type: 'release' });
      this.critterPropsToSave = capture.captureCritterPropsToSave;
    } else {
      this.location_event = new LocationEvent(this.event_type, dayjs());
      this.critterPropsToSave = ['critter_id'];
    }
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
    return ['taxon', 'wlh_id', 'animal_id', 'critter_status', 'translocation_ind'];
  }
  getWorkflowTitle(): string {
    return WorkflowStrings.release.workflowTitle;
  }

  set releaseCritterPropsToSave(props: (keyof Critter)[]) {
    this.critterPropsToSave = props;
  }

  get releaseCritterPropsToSave(): (keyof Critter)[] {
    return this.critterPropsToSave;
  }

  getAnimal(): OptionalAnimal {
    const props = [...this.critterPropsToSave];
    // if the critter was being translocated, preserve the region/population unit
    if (this.translocation_ind) {
      props.push('responsible_region', 'collection_unit');
    }
    const ret = eventToJSON(props, this);
    // if translocation_ind an the animal status was 'in translocation', revert it to alive.
    // if (this.translocation_ind && this.critter_status === 'In Translocation') {
    //   ret['critter_status'] = 'Alive';
    // }
    return omitNull({ ...ret, ...this.location_event.toJSON() });
  }

  getAttachment(): RemoveDeviceInput {
    const now = dayjs().format(formatTime);
    const ret: RemoveDeviceInput = {
      assignment_id: this.assignment_id,
      attachment_end: now,
      data_life_end: now
    };
    return ret;
  }

  fields: ReleaseFormField = {
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check }
  };
}

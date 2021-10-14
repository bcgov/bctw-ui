import dayjs, { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, eventToJSON, IBCTWWorkflow, OptionalDevice } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { IDataLifeEndProps } from 'types/data_life';
import { FormFieldObject } from 'types/form_types';
import { WorkflowStrings } from 'constants/strings';
import { CollarHistory } from 'types/collar_history';
import { uuid } from 'types/common_types';
import { AttachedCollar, Collar } from 'types/collar';

type MalfunctionDeviceProps = Pick<
AttachedCollar,
| 'collar_id'
| 'device_id'
| 'device_malfunction_type'
| 'malfunction_date'
| 'malfunction_comment'
| 'device_status'
| 'offline_comment'
| 'offline_date'
| 'offline_type'
| 'last_transmission_date'
| 'retrieved'
>;

export type MalfunctionFormField = {
  [Property in keyof MalfunctionEvent]+?: FormFieldObject<MalfunctionEvent>;
};

interface IMalfunctionEvent
  extends MalfunctionDeviceProps,
  Readonly<Pick<CollarHistory, 'assignment_id'>>,
  Pick<IBCTWWorkflow, 'shouldUnattachDevice'>,
  IDataLifeEndProps {}

export type MalfunctionDeviceStatus = 'Potential Malfunction' | 'Active' | 'Offline' | 'Malfunction';

/**
 * todo:
 * data life / attachment end date
 * start retrieval workflow??
 */
export default class MalfunctionEvent implements IMalfunctionEvent, BCTWWorkflow<MalfunctionEvent> {
  // workflow props
  readonly event_type: WorkflowType;
  readonly shouldSaveDevice = true;
  readonly shouldSaveAnimal = false;
  location_event: LocationEvent;
  readonly assignment_id: uuid;
  shouldUnattachDevice: boolean;
  onlySaveDeviceStatus: boolean;
  // data life end props
  attachment_end: Dayjs;
  data_life_end: Dayjs;
  // device props
  readonly collar_id: uuid;
  readonly device_id: number;
  device_status: Code; // fields below disabled while status = potential malfunction
  device_malfunction_type: Code; // fields enabled if devuce_status -> malfunction
  malfunction_comment: string;
  malfunction_date: Dayjs;
  offline_date: Dayjs; // fields enabled if device_status -> offline
  offline_type: Code;
  offline_comment: string;
  retrieved: boolean;
  readonly last_transmission_date: Dayjs;

  constructor(last_transmission = dayjs()) {
    this.onlySaveDeviceStatus = false;
    this.event_type = 'malfunction';
    // pass true as the disableDate param. 
    this.location_event = new LocationEvent('malfunction', last_transmission ?? dayjs(), true);
    this.device_status = 'Potential Malfunction';
  }

  formatPropAsHeader(s: keyof MalfunctionEvent): string {
    switch (s) {
      case 'shouldUnattachDevice':
        return WorkflowStrings.release.isNewDevice;
      case 'retrieved':
        return WorkflowStrings.malfunction.isRetrieved;
      case 'device_malfunction_type':
        return 'Malfunction Type';
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof MalfunctionEvent)[] {
    return ['device_id'];
  }
  getWorkflowTitle(): string {
    return WorkflowStrings.malfunction.workflowTitle;
  }

  getDevice(): OptionalDevice {
    // when set to device status of Active, only preserve the status
    if (this.onlySaveDeviceStatus) {
      const { collar_id, device_status } = this;
      return { collar_id, device_status };
    }
    const props: (keyof Collar)[] = [
      'collar_id',
      'device_status',
      'retrieved'
    ];
    // get the coordinate type properties from the location event
    // note that date is not included 
    const locs = this.location_event.toJSON();
    let ret;
    if (this.device_status === 'Malfunction') {
      props.push('device_malfunction_type', 'malfunction_date');
      ret = eventToJSON(props, this);
    }
    // transform the location event props to offline
    else if (this.device_status === 'Offline') {
      props.push('offline_type', 'offline_date');
      ret = eventToJSON(props, this);
      locs.offline_comment = locs.malfunction_comment;
      locs.offline_date = locs.malfunction_date;
      delete locs.malfunction_comment;
      delete locs.malfunction_date;
    }
    return omitNull({...ret, ...locs})
  }
}

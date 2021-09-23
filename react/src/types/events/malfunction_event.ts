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
import { Collar } from 'types/collar';

type MalfunctionDeviceProps = Pick<Collar,
| 'collar_id'
| 'device_id'
| 'device_malfunction_type'
| 'malfunction_date'
| 'malfunction_comment'
| 'device_status'
| 'offline_comment'
| 'offline_date'
| 'offline_type'
>;

export type MalfunctionFormField = {
  [Property in keyof MalfunctionEvent]+?: FormFieldObject<MalfunctionEvent>;
};

interface IMalfunctionEvent extends MalfunctionDeviceProps,
  Readonly<Pick<CollarHistory, 'assignment_id'>>,
  Pick<IBCTWWorkflow, 'shouldUnattachDevice'>,
  IDataLifeEndProps {}

type MalfunctionDeviceStatus = 'Potential Malfunction';

/**
 * todo:
 * prompt to exit early if user selects active for device status
 * populate malfunction date with last transmission date
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
  // data life end props
  attachment_end: Dayjs;
  data_life_end: Dayjs;
  // device props
  readonly collar_id: uuid;
  readonly device_id: number;
  device_status: MalfunctionDeviceStatus; // fields below disabled while status = potential malfunction
  device_malfunction_type: Code; // malfunction fields enabled if devuce_status -> malfunction
  malfunction_comment: string;
  malfunction_date: Dayjs;
  offline_date: Dayjs; // offline fields enabled if device_status -> offline
  offline_type: Code;
  offline_comment: string;

  constructor() {
    this.event_type = 'malfunction';
    this.location_event = new LocationEvent('malfunction', dayjs());
    this.device_status = 'Potential Malfunction';
  }

  formatPropAsHeader(s: keyof MalfunctionEvent): string {
    switch (s) {
      case 'shouldUnattachDevice': 
        return WorkflowStrings.release.isNewDevice;
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
    return WorkflowStrings.release.workflowTitle;
  }

  getDevice(): OptionalDevice{
    const props: (keyof Collar)[] =
      [ 'collar_id', ];
    const ret = eventToJSON(props, this);
    return omitNull({ ...ret, ...this.location_event.toJSON()});
  }
  
  fields: MalfunctionFormField = {

  }

  // getAttachment(): RemoveDeviceInput {
  // }
}

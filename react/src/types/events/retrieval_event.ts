import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { uuid } from 'types/common_types';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWWorkflow, eventToJSON, WorkflowType, OptionalDevice } from 'types/events/event';
import { MortalityDeviceEventProps } from 'types/events/mortality_event';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { formatT, formatTime, getEndOfPreviousDay } from 'utils/time';
import { DataLife } from 'types/data_life';
import { eInputType, FormFieldObject } from 'types/form_types';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { WorkflowStrings } from 'constants/strings';

// require dates to enforce retrieval min date
interface IRetrievalEvent extends 
  Omit<MortalityDeviceEventProps, 'device_status'>,
  Pick<CollarHistory, 'assignment_id'>,
  Readonly<Pick<Collar, 'malfunction_date' | 'retrieval_comment'>>,
  Readonly<Pick<Animal, 'capture_date' | 'mortality_date' | 'wlh_id' | 'animal_id'>>,
  DataLife { }

export type RetrievalFormField = {
  [Property in keyof RetrievalEvent]+?: FormFieldObject<RetrievalEvent>;
};

export default class RetrievalEvent implements IRetrievalEvent, BCTWWorkflow<RetrievalEvent>{
  readonly event_type: WorkflowType;
  shouldUnattachDevice: boolean;
  readonly shouldSaveAnimal = false;
  readonly shouldSaveDevice = true;
  // device props
  readonly collar_id: uuid;
  readonly device_id: number;
  readonly device_make: Code;
  activation_status: boolean;
  readonly malfunction_date: Dayjs; // fixme: use this for min date
  retrieved: boolean;
  // retrieved is not a code -_-
  // todo: display as checkbox if retrieved is no??
  // todo: need to preserve is_retrievable?
  is_retrievable: boolean;
  // required if retrieved, cannot be earlier than capture/mort/malf date
  retrieval_date: Dayjs; 
  // required if retrieved, default to device not deployed if retrieved
  device_deployment_status: Code; 
  //required ...always?
  device_condition: Code; 
  retrieval_comment: string;

  // data life
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;

  readonly assignment_id: uuid;

  readonly animal_id: string;
  readonly wlh_id: string;
  readonly capture_date: Dayjs;
  readonly mortality_date: Dayjs;

  constructor() {
    this.event_type = 'retrieval';
    this.retrieved = true;
    this.retrieval_date = getEndOfPreviousDay();
    this.shouldUnattachDevice = false;
    this.device_deployment_status = 'Not Deployed';
  }

  formatPropAsHeader(s: string): string {
    switch (s) {
      case 'shouldUnattachDevice':
        return WorkflowStrings.device.should_unattach;
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof RetrievalEvent)[] {
    return ['wlh_id', 'animal_id', 'device_id'];
  }

  fields: RetrievalFormField = {
    activation_status: { prop: 'activation_status', type: eInputType.check },
    retrieved: { prop: 'retrieved', type: eInputType.check },
    is_retrievable: { prop: 'is_retrievable', type: eInputType.check },
    retrieval_date: { prop: 'retrieval_date', type: eInputType.datetime },
    device_condition: { prop: 'device_condition', type: eInputType.code, required: true },
    device_deployment_status: { prop: 'device_deployment_status', type: eInputType.code, required: true },
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
    retrieval_comment: { prop: 'retrieval_comment', type: eInputType.multiline},
    data_life_end: { prop: 'data_life_end', type: eInputType.datetime },
  };

  getWorkflowTitle(): string {
    return WorkflowStrings.retrieval.workflowTitle;
  }

  getDevice(): OptionalDevice {
    const props: (keyof RetrievalEvent)[] = [
      'activation_status',
      'retrieval_comment',
      'retrieved',
      'retrieval_date',
      'device_deployment_status',
      'device_condition',
    ];
    const ret = eventToJSON(props, this);
    if (this.retrieved) {
      ret.retrieval_date = this.retrieval_date.format(formatTime);
    } else {
      delete ret.retrieval_date;
    }
    return omitNull(ret);
  }

  getAttachment(): RemoveDeviceInput {
    const { assignment_id, data_life_end } = this;
    const ret: RemoveDeviceInput = {
      assignment_id,
      data_life_end: formatT(data_life_end),
      attachment_end: formatT(data_life_end)
    };
    return ret;
  }
}

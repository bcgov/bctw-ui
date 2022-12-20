import dayjs, { Dayjs } from 'dayjs';
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

interface IRetrievalEvent
  extends Omit<MortalityDeviceEventProps, 'device_status'>,
    Pick<CollarHistory, 'assignment_id'>,
    Readonly<Pick<Collar, 'malfunction_date' | 'retrieval_comment'>>,
    Readonly<Pick<Animal, 'capture_date' | 'mortality_date' | 'wlh_id' | 'animal_id'>>,
    DataLife {}

export type RetrievalFormField = {
  [Property in keyof RetrievalEvent]+?: FormFieldObject<RetrievalEvent>;
};

/**
 * retrieved is not a code
 * todo: display as checkbox if retrieved_ind is no??
 * todo: need to preserve is_retrievable?
 */
export default class RetrievalEvent implements IRetrievalEvent, BCTWWorkflow<RetrievalEvent> {
  readonly event_type: WorkflowType;
  shouldUnattachDevice: boolean;
  readonly shouldSaveAnimal = false;
  readonly shouldSaveDevice = true;
  // device props
  readonly collar_id: uuid;
  readonly device_id: number;
  readonly device_make: Code;
  activation_status_ind: boolean;
  readonly malfunction_date: Dayjs; // fixme: use this for min date
  retrieved_ind: boolean;
  is_retrievable: boolean;
  // required if retrieved_ind, cannot be earlier than capture/mort/malf date
  retrieval_date: Dayjs;
  // required if retrieved_ind, default to device not deployed if retrieved_ind
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
    this.retrieved_ind = true;
    this.retrieval_date = getEndOfPreviousDay();
    this.shouldUnattachDevice = false;
    this.device_deployment_status = 'Not Deployed';
  }

  formatPropAsHeader(s: string): string {
    switch (s) {
      case 'shouldUnattachDevice':
        return WorkflowStrings.device.should_unattach;
      case 'device_deployment_status':
        return 'Deployment Status';
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof RetrievalEvent)[] {
    return ['wlh_id', 'animal_id', 'device_id'];
  }

  /**
   * retrieval date minimum is assigned to the latest of malfunction/capture/mortality dates
   */
  determineMinRetrievalDate = (): Dayjs => {
    const { capture_date, malfunction_date, mortality_date } = this;
    const dates: Dayjs[] = [capture_date, malfunction_date, mortality_date]
      .map((d) => (d ? dayjs(d) : null))
      .filter((d) => d)
      .sort((a, b) => (a.isBefore(b) ? 1 : 0));
    if (dates.length) {
      const minDate = dates[dates.length - 1];
      // eslint-disable-next-line no-console
      // console.log('min retrieval date determined', minDate);
      return minDate;
    }
    return null;
  };

  fields: RetrievalFormField = {
    is_retrievable: { prop: 'is_retrievable', type: eInputType.check },
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
    data_life_end: { prop: 'data_life_end', type: eInputType.datetime }
  };

  getWorkflowTitle(): string {
    return WorkflowStrings.retrieval.workflowTitle;
  }

  getDevice(): OptionalDevice {
    const props: (keyof RetrievalEvent)[] = [
      'activation_status_ind',
      'retrieval_comment',
      'retrieved_ind',
      'retrieval_date',
      'device_deployment_status',
      'device_condition'
    ];
    const ret = eventToJSON(props, this);
    if (this.retrieved_ind) {
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

import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { uuid } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { BCTWEvent, EventType, OptionalDevice } from 'types/events/event';
import { IMortalityEvent, MortalityDeviceEventProps } from 'types/events/mortality_event';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { getEndOfPreviousDay } from 'utils/time';
import { DataLife } from 'types/data_life';
import { EventFormStrings } from 'constants/strings';
import { eInputType, FormFieldObject } from 'types/form_types';

// require dates to enforce retrieval min date
interface IRetrievalEvent
  extends 
  Omit<MortalityDeviceEventProps, 'device_status'>,
  Pick<IMortalityEvent, 'assignment_id' | 'shouldUnattachDevice'>,
  Readonly<Pick<Collar, 'malfunction_date'>>,
  Readonly<Pick<Animal, 'capture_date' | 'mortality_date' | 'wlh_id' | 'animal_id'>>,
  DataLife {
  retrieval_comment: string
}

export type RetrievalFormField = {
  [Property in keyof RetrievalEvent]+?: FormFieldObject<RetrievalEvent>;
};

export default class RetrievalEvent implements BCTWEvent<RetrievalEvent>, IRetrievalEvent {
  readonly event_type: EventType;
  // device props
  readonly collar_id: uuid;
  readonly device_id: number;
  readonly device_make: Code;
  activation_status: boolean;
  readonly malfunction_date: Dayjs;
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
  // fixme: DNE in collar table 
  retrieval_comment: string;

  // data life
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;

  readonly assignment_id: uuid;
  shouldUnattachDevice: boolean;

  readonly animal_id: string;
  readonly wlh_id: string;
  readonly capture_date: Dayjs;
  readonly mortality_date: Dayjs;


  constructor() {
    this.event_type = 'capture';
    this.retrieved = true;
    this.retrieval_date = getEndOfPreviousDay();
    this.shouldUnattachDevice = false;
    this.device_deployment_status = 'Not Deployed';
  }

  formatPropAsHeader(s: string): string {
    switch (s) {
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
    device_deployment_status: { prop: 'device_deployment_status', type: eInputType.code },
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
    // todo: long text
    retrieval_comment: { prop: 'retrieval_comment', type: eInputType.text },
  };

  getHeaderTitle(): string {
    return EventFormStrings.titles.retrievalTitle;
  }

  getDevice(): OptionalDevice {
    return {};
  }
}

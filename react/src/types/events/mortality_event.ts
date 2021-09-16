import { columnToHeader, omitNull } from 'utils/common_helpers';
import { Animal, IAttachedAnimal } from 'types/animal';
import { Collar } from 'types/collar';
import { eInputType, FormFieldObject } from 'types/form_types';
import { LocationEvent } from 'types/events/location_event';
import dayjs, { Dayjs } from 'dayjs';
import { formatT, formatTime, getEndOfPreviousDay } from 'utils/time';
import { BCTWEvent, eventToJSON, EventType, OptionalAnimal, OptionalDevice } from 'types/events/event';
import { IMortalityAlert } from 'types/alert';
import { uuid } from 'types/common_types';
import { Code } from 'types/code';
import { EventFormStrings } from 'constants/strings';
import { CollarHistory, RemoveDeviceInput } from 'types/collar_history';
import { DataLife, DataLifeInput } from 'types/data_life';

export type MortalityDeviceEventProps = Pick<Collar, 
| 'device_id'
| 'device_make'
| 'retrieved'
| 'retrieval_date'
| 'activation_status'
| 'device_condition'
| 'device_status'
| 'device_deployment_status'>;

/**
 */
export interface IMortalityEvent
  extends MortalityDeviceEventProps, IMortalityAlert,
  Pick< Animal,
  | 'proximate_cause_of_death'
  | 'predator_species'
  | 'pcod_confidence'
  | 'ucod_confidence'
  | 'critter_id'
  | 'animal_id'
  | 'wlh_id'
  | 'predator_known'
  | 'predator_species'
  | 'captivity_status'
  | 'mortality_investigation'
  | 'mortality_record'
  | 'mortality_captivity_status'
  >,
  Readonly<Pick<CollarHistory, 'assignment_id'>>,
  DataLife {
  shouldUnattachDevice: boolean;
  predator_known: boolean;
  mortality_investigation: Code;
  mortality_record: boolean;
}

// used to create forms without having to use all event props
// +? makes the property optional
export type MortalityFormField = {
  [Property in keyof MortalityEvent]+?: FormFieldObject<MortalityEvent>;
};

// codes defaulted in this workflow
type MortalityDeviceStatus = 'Mortality';
export type DeploymentStatusNotDeployed = 'Not Deployed';
type MortalityAnimalStatus = 'Potential Mortality';

export default class MortalityEvent implements BCTWEvent<MortalityEvent>, IMortalityEvent {
  // device props
  readonly collar_id: uuid;
  readonly device_id: number;
  readonly device_make: Code;
  retrieved: boolean;
  retrieval_date: Dayjs;
  activation_status: boolean;
  device_condition: Code;
  device_deployment_status: DeploymentStatusNotDeployed;
  device_status: MortalityDeviceStatus;
  // attachment props
  readonly assignment_id: uuid;
  // critter props
  readonly critter_id: uuid;
  readonly animal_id: string;
  readonly wlh_id: string;
  animal_status: MortalityAnimalStatus;
  predator_species: string;
  proximate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  captivity_status: boolean;
  mortality_investigation: Code;
  mortality_record: boolean;
  mortality_captivity_status: Code;
  predator_known: boolean;
  // data life props
  readonly attachment_start: Dayjs;
  readonly data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;

  readonly event_type: EventType;
  location_event: LocationEvent;
  shouldUnattachDevice: boolean;

  // todo: need to fetch captivity_status
  constructor() {
    this.event_type = 'mortality';
    // note: defaulted to end of previous day (business requirement)
    this.retrieval_date = getEndOfPreviousDay();
    this.retrieved = false;
    this.activation_status = true;
    // workflow defaulted fields
    this.shouldUnattachDevice = false;
    this.device_status = 'Mortality';
    this.device_deployment_status = 'Not Deployed';
    this.animal_status = 'Potential Mortality';
    this.shouldUnattachDevice = false;
    this.predator_known = false;
    this.location_event = new LocationEvent('mortality', dayjs());
  }

  get displayProps(): (keyof MortalityEvent)[] {
    return ['wlh_id', 'animal_id', 'device_id'];
  }

  getHeaderTitle(): string {
    return EventFormStrings.titles.mortalityTitle;
  }

  /**
   * used to create the data life form.
   * since only animals with existing attachments can be edited,
   * attachment end / data end dates will be null.
   * default them to now for this workflow
   * fixme: improve DLI so it can be instantiated without a collar history
   */
  getCollarHistory(): CollarHistory {
    const now = dayjs();
    const ch = new CollarHistory();
    ch.assignment_id = this.assignment_id;
    ch.attachment_start = dayjs(this.attachment_start);
    ch.data_life_start = dayjs(this.data_life_start);
    ch.data_life_end = now;
    ch.attachment_end = now;
    return ch;
  }

  getDatalife(): DataLifeInput {
    const dl = new DataLifeInput(this.getCollarHistory());
    return dl;
  }

  formatPropAsHeader(s: keyof MortalityEvent): string {
    switch (s) {
      case 'mortality_captivity_status':
        return 'captivity status';
      case 'mortality_record':
        return EventFormStrings.animal.mort_wildlife;
      case 'retrieved':
        return EventFormStrings.device.was_retrieved;
      case 'activation_status':
        return EventFormStrings.device.vendor_activation;
      case 'predator_known':
        return EventFormStrings.animal.mort_predator;
      case 'shouldUnattachDevice':
        return EventFormStrings.device.should_unattach;
      case 'proximate_cause_of_death':
        return 'PCOD';
      default:
        return columnToHeader(s);
    }
  }

  fields: MortalityFormField = {
    shouldUnattachDevice: {
      prop: 'shouldUnattachDevice',
      type: eInputType.check,
      tooltip: EventFormStrings.device.should_unattach
    },
    mortality_investigation: {
      prop: 'mortality_investigation',
      type: eInputType.code,
      tooltip: EventFormStrings.animal.mort_investigation
    },
    mortality_record: { prop: 'mortality_record', type: eInputType.check },
    animal_status: { prop: 'animal_status', type: eInputType.code },
    predator_known: { prop: 'predator_known', type: eInputType.check },
    proximate_cause_of_death: { prop: 'proximate_cause_of_death', type: eInputType.code },
    predator_species: { prop: 'predator_species', type: eInputType.code },
    retrieved: { prop: 'retrieved', type: eInputType.check },
    retrieval_date: { prop: 'retrieval_date', type: eInputType.datetime },
    activation_status: { prop: 'activation_status', type: eInputType.check },
    device_deployment_status: { prop: 'device_deployment_status', type: eInputType.code },
    device_status: { prop: 'device_status', type: eInputType.code },
    device_condition: { prop: 'device_condition', type: eInputType.code, required: true },
    pcod_confidence: { prop: 'pcod_confidence', type: eInputType.code, codeName: 'cod_confidence' },
    ucod_confidence: { prop: 'ucod_confidence', type: eInputType.code, codeName: 'cod_confidence' }
  };

  // retrieve the animal metadata fields from the mortality event
  // todo: ucod?
  getAnimal(): OptionalAnimal {
    const props: (keyof IAttachedAnimal)[] = [
      'critter_id',
      'animal_status',
      'predator_known',
      'predator_species',
      'proximate_cause_of_death',
      'ucod_confidence',
      'pcod_confidence',
      'captivity_status',
      'mortality_investigation',
      'mortality_captivity_status',
      'mortality_record'
    ];
    const ret = eventToJSON(props, this);
    const loc = this.location_event.toJSON();
    return omitNull({ ...ret, ...loc }) as OptionalAnimal;
  }

  // retrieve the collar metadata fields from the event
  getDevice(): OptionalDevice {
    const props: (keyof Collar)[] = [
      'collar_id',
      'retrieved',
      'activation_status',
      'device_condition',
      'device_deployment_status',
      'device_id',
      'device_status'
    ];
    const ret = eventToJSON(props, this);
    if (this.retrieved) {
      ret.retrieval_date = this.retrieval_date.format(formatTime);
    }
    return omitNull(ret) as OptionalDevice;
  }

  // when a device is unattached.
  getAttachment(): RemoveDeviceInput {
    const { assignment_id, attachment_end, data_life_end } = this;
    const ret: RemoveDeviceInput = {
      assignment_id,
      //  note: data_life_end must be provided for an attachment end
      data_life_end: formatT(data_life_end) ?? formatT(attachment_end),
      attachment_end: formatT(attachment_end)
    };
    return ret;
  }
}

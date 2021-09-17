import { columnToHeader, omitNull } from 'utils/common_helpers';
import { Animal, AttachedAnimal } from 'types/animal';
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

export type MortalityDeviceEventProps = Pick<Collar, 
| 'device_id'
| 'device_make'
| 'retrieved'
| 'retrieval_date'
| 'activation_status'
| 'device_condition'
| 'device_status'
| 'device_deployment_status'>;

export type MortalityAnimalEventProps = Pick<Animal, 
| 'proximate_cause_of_death'
| 'ultimate_cause_of_death'
| 'predator_species_pcod'
| 'predator_species_ucod'
| 'pcod_confidence'
| 'ucod_confidence'
| 'critter_id'
| 'capture_date'
| 'animal_id'
| 'wlh_id'
| 'predator_known'
| 'captivity_status'
| 'mortality_investigation'
| 'mortality_report'
| 'mortality_captivity_status'
>;

export interface IMortalityEvent
  extends MortalityDeviceEventProps,
  MortalityAnimalEventProps,
  Omit<IMortalityAlert, 'data_life_start'| 'attachment_end'>,
  Readonly<Pick<CollarHistory, 'assignment_id'>> {
  shouldUnattachDevice: boolean;
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

// todo: add pcod/ucod_confidence
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
  data_life_end: Dayjs;
  attachment_start: Dayjs; // fixme: the capture date?
  // critter props
  readonly critter_id: uuid;
  readonly animal_id: string;
  readonly wlh_id: string;
  animal_status: MortalityAnimalStatus;
  predator_species_pcod: Code;
  predator_species_ucod: Code;
  proximate_cause_of_death: Code;
  ultimate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  captivity_status: boolean;
  mortality_investigation: Code;
  mortality_report: boolean;
  mortality_captivity_status: Code;
  predator_known: boolean;
  readonly capture_date: Dayjs;
  location_event: LocationEvent;
  // event specific props - not saved. used to enable/disable fields
  readonly event_type: EventType;
  shouldUnattachDevice: boolean;
  wasInvestigated: boolean;
  isUCODSpeciesKnown: boolean;

  // todo: need to fetch captivity_status
  constructor() {
    this.event_type = 'mortality';
    // note: retrieval date is defaulted to end of previous day (business requirement)
    this.retrieval_date = getEndOfPreviousDay();
    this.retrieved = false;
    this.activation_status = true;
    // workflow defaulted fields
    this.shouldUnattachDevice = false;
    this.device_status = 'Mortality';
    this.device_deployment_status = 'Not Deployed';
    this.animal_status = 'Potential Mortality';
    this.shouldUnattachDevice = false;
    this.wasInvestigated = false;
    this.predator_known = false;
    this.location_event = new LocationEvent('mortality', dayjs());
  }

  get displayProps(): (keyof MortalityEvent)[] {
    return ['wlh_id', 'animal_id', 'device_id', 'attachment_start'];
  }

  getHeaderTitle(): string {
    return EventFormStrings.titles.mortalityTitle;
  }

  formatPropAsHeader(s: keyof MortalityEvent): string {
    switch (s) {
      case 'attachment_start':
        return 'Capture Date';
      case 'wasInvestigated': 
        return EventFormStrings.animal.mort_investigation;
      case 'mortality_report':
        return EventFormStrings.animal.mort_wildlife;
      case 'retrieved':
        return EventFormStrings.device.was_retrieved;
      case 'activation_status':
        return EventFormStrings.device.vendor_activation;
      case 'predator_known':
        return EventFormStrings.animal.mort_predator_pcod;
      case 'isUCODSpeciesKnown': 
        return EventFormStrings.animal.mort_predator_ucod;
      case 'shouldUnattachDevice':
        return EventFormStrings.device.should_unattach;
      case 'proximate_cause_of_death':
        return 'PCOD';
      case 'ultimate_cause_of_death':
        return 'UCOD';
      case 'predator_species_ucod':
        return 'Predator UCOD';
      case 'predator_species_pcod':
        return 'Predator PCOD';
      default:
        return columnToHeader(s);
    }
  }

  fields: MortalityFormField = {
    data_life_end: { prop: 'data_life_end', type: eInputType.datetime },
    mortality_investigation: { prop: 'mortality_investigation', type: eInputType.code },
    wasInvestigated: {prop: 'wasInvestigated', type: eInputType.check},
    isUCODSpeciesKnown: {prop: 'isUCODSpeciesKnown', type: eInputType.check},
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
    mortality_report: { prop: 'mortality_report', type: eInputType.check },
    animal_status: { prop: 'animal_status', type: eInputType.code },
    predator_known: { prop: 'predator_known', type: eInputType.check },
    proximate_cause_of_death: { prop: 'proximate_cause_of_death', type: eInputType.code },
    ultimate_cause_of_death: { prop: 'ultimate_cause_of_death', type: eInputType.code, codeName: 'proximate_cause_of_death' },
    predator_species_pcod: { prop: 'predator_species_pcod', type: eInputType.code, codeName: 'predator_species' },
    predator_species_ucod: { prop: 'predator_species_ucod', type: eInputType.code, codeName: 'predator_species' },
    retrieved: { prop: 'retrieved', type: eInputType.check },
    retrieval_date: { prop: 'retrieval_date', type: eInputType.datetime },
    activation_status: { prop: 'activation_status', type: eInputType.check },
    device_deployment_status: { prop: 'device_deployment_status', type: eInputType.code },
    device_status: { prop: 'device_status', type: eInputType.code },
    device_condition: { prop: 'device_condition', type: eInputType.code, required: true },
    pcod_confidence: { prop: 'pcod_confidence', type: eInputType.code, codeName: 'cod_confidence' },
    ucod_confidence: { prop: 'ucod_confidence', type: eInputType.code, codeName: 'cod_confidence' },
  };

  // retrieve the animal metadata fields from the mortality event
  // todo: inherit from ^
  getAnimal(): OptionalAnimal {
    const props: (keyof AttachedAnimal)[] = [
      'critter_id',
      'animal_status',
      'predator_known',
      'predator_species_pcod',
      'predator_species_ucod',
      'proximate_cause_of_death',
      'ultimate_cause_of_death',
      'ucod_confidence',
      'pcod_confidence',
      'captivity_status',
      'mortality_investigation',
      'mortality_captivity_status',
      'mortality_report'
    ];
    const ret = eventToJSON(props, this);
    // todo: better way to wipe disabled fields?
    if (!this.wasInvestigated) {
      delete ret.mortality_investigation;
    }
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
    } else {
      delete ret.retrieval_date;
    }
    return omitNull(ret) as OptionalDevice;
  }

  // when a device is unattached.
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

import { columnToHeader, omitNull } from 'utils/common_helpers';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { eInputType, FormFieldObject } from 'types/form_types';
import { LocationEvent } from 'types/events/location_event';
import dayjs, { Dayjs } from 'dayjs';
import { getEndOfPreviousDay } from 'utils/time';
import { BCTWEvent, EventType } from 'types/events/event';
import { IMortalityAlert } from 'types/alert';
import { uuid } from 'types/common_types';
import { Code } from 'types/code';
import { UserAlertStrings } from 'constants/strings';

/**
 * todo:
 * expose data life - end dates editable
 * add captivity_status - its own event?? (bool)
 * triggered upon selecting a predation value from PCOD:
    * add bool predator_known
    * show predator_species code
 */

interface IMortalityEvent
  extends IMortalityAlert,
    Pick<Animal, 'proximate_cause_of_death' | 'predator_species'>,
    Pick<Collar, 'retrieved' | 'retrieval_date' | 'activation_status' | 'device_status' | 'device_deployment_status'> {
  shouldUnattachDevice: boolean;
  predator_known: boolean;
  mortality_investigation: Code;
  mortality_record: boolean;
}

// export type MortalityEventProp = keyof IMortalityEvent;

// used to create forms without having to use all event props 
type MortalityFormField = {
  [Property in keyof MortalityEvent]+?: FormFieldObject<MortalityEvent>;
};

// codes defaulted in this workflow
type MortalityDeviceStatus = 'Mortality';
type MortalityDeploymentStatus = 'Not Deployed';
type MortalityAnimalStatus = 'Potential Mortality';

export default class MortalityEvent implements BCTWEvent<MortalityEvent>, IMortalityEvent {
  event_type: EventType;
  collar_id: uuid;
  device_id: number;
  device_make: Code;
  retrieved: boolean;
  retrieval_date: Dayjs;
  activation_status: boolean;
  device_condition: Code;
  device_deployment_status: MortalityDeploymentStatus;
  device_status: MortalityDeviceStatus;

  critter_id: uuid;
  animal_id: string;
  animal_status: MortalityAnimalStatus;
  wlh_id: string;
  predator_species: string;
  proximate_cause_of_death: string;

  // todo: new fields
  captivity_status: boolean;
  mortality_investigation: Code;
  mortality_record: boolean;
  mortality_captivity_status: Code; // enable if captivity_status true
  pcod_confidence_value: string; // ????
  predator_known: boolean;

  // data life
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;

  location_event: LocationEvent;
  shouldUnattachDevice: boolean;

  constructor() {
    this.event_type = 'mortality';
    this.retrieval_date = getEndOfPreviousDay(); // note: defaulted
    this.retrieved = false;
    this.activation_status = true;

    // workflow defaulted fields
    this.shouldUnattachDevice = false;
    this.device_status = 'Mortality';
    this.device_deployment_status = 'Not Deployed';
    this.animal_status = 'Potential Mortality';
    this.shouldUnattachDevice = false;
    this.location_event = new LocationEvent('mortality', dayjs());
  }

  getHeaderProps(): (keyof MortalityEvent)[] {
    return ['wlh_id', 'animal_id', 'device_id'];
  }

  getHeaderTitle(): string {
    return UserAlertStrings.mortalityFormTitle;
  }

  formatPropAsHeader(s: keyof MortalityEvent): string {
    switch (s) {
      case 'mortality_investigation':
        return 'Was a mortality investigation undertaken?';
      case 'mortality_record':
        return 'Was the Wildlife Health Group mortality form completed?';
      case 'retrieved':
        return 'Has Device Been Retrieved?';
      case 'activation_status':
        return 'Is Device Still Active With Vendor?';
      case 'predator_species':
        return 'PCOD Predator Species';
      case 'pcod_confidence_value':
        return 'PCOD Confidence Value';
      case 'shouldUnattachDevice':
        return 'Unassign device from animal?';
      case 'proximate_cause_of_death':
        return 'Proximate COD';
      default:
        return columnToHeader(s);
    }
  }

  fields: MortalityFormField = {
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
    mortality_investigation: {prop: 'mortality_investigation', type: eInputType.code },
    mortality_record: {prop: 'mortality_record', type: eInputType.check },
    animal_status: { prop: 'animal_status', type: eInputType.code },
    proximate_cause_of_death: { prop: 'proximate_cause_of_death', type: eInputType.code },
    predator_species: { prop: 'predator_species', type: eInputType.code },
    retrieved: { prop: 'retrieved', type: eInputType.check },
    retrieval_date: { prop: 'retrieval_date', type: eInputType.datetime },
    activation_status: { prop: 'activation_status', type: eInputType.check },
    device_deployment_status: { prop: 'device_deployment_status', type: eInputType.code },
    device_status: { prop: 'device_status', type: eInputType.code },
    device_condition: {prop: 'device_condition', type: eInputType.code },
    // pcod_confidence_value: { prop: 'pcod_confidence_value', type: eInputType.text },
  };

  // retrieve the animal metadata fields from the mortality event
  get getCritter(): Animal {
    const a = new Animal();
    const l = this.location_event;
    a.critter_id = this.critter_id;
    a.animal_status = this.animal_status;
    // a.mortality_date = l.date;
    a.mortality_comment = l.comment;
    a.mortality_latitude = l.latitude;
    a.mortality_longitude = l.longitude;
    a.mortality_utm_easting = l.utm_easting;
    a.mortality_utm_northing = l.utm_northing;
    a.mortality_utm_zone = l.utm_zone;
    return omitNull(a);
  }

  // retrieve the collar metadata fields from the event
  get getCollar(): Collar {
    const c = new Collar();
    c.collar_id = this.collar_id;
    c.device_id = this.device_id;
    c.retrieval_date = this.retrieval_date;
    c.retrieved = this.retrieved;
    c.activation_status = this.activation_status;
    c.device_status = this.device_status;
    c.device_deployment_status = this.device_deployment_status;
    delete c.malfunction_date;
    delete c.offline_date;
    delete c.frequency;
    return omitNull(c);
  }

  // todo:: attachment status if removing device
  getAttachment(): void {
    // assignment_id
    // attachment_end
    // data_ilfe_end
  }

  toJSON(): MortalityEvent {
    // if marked as not retrieved, wipe the retrieval date.
    if (!this.retrieved) {
      delete this.retrieval_date;
    }
    // preserve lat/long or UTM, but not both
    // todo: move this handling to locatio_event class
    // todo: add toJson for location event type
    if (this.location_event.latitude && this.location_event.longitude) {
      delete this.location_event.utm_easting;
      delete this.location_event.utm_northing;
      delete this.location_event.utm_easting;
    } else {
      delete this.location_event.latitude;
      delete this.location_event.longitude;
    }
    return this;
  }
}

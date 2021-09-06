import { columnToHeader, omitNull } from 'utils/common_helpers';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWEvent } from 'types/common_types';
import { eInputType, FormFieldObject } from 'types/form_types';
import { LocationEvent } from 'types/events/location_event';
import dayjs, { Dayjs } from 'dayjs';

/**
 * todo:
 * expose data life, attachment dates - only end dates editable
 * question - 'was a mortality investigation undertaken? -> mortality_investigation (code)
 * question 'Was the Wildlife Health Group mortality form completed?' -> mortality_record (bool)
 * add captivity_status - its own event if it's to be used elsewhere? (bool)
 * add device_condition (code)
 * event triggered upon selecting a predation value from PCOD:
    * add bool predator_known
    * show predator_species code  
 */

interface IMortalityEvent
  extends Pick<Animal, 'critter_id' | 'animal_status' | 'proximate_cause_of_death' | 'predator_species'>,
  Pick<Collar, | 'collar_id' | 'device_id' | 'retrieved' | 'retrieval_date' | 'activation_status'
  | 'device_deployment_status'
  | 'device_status'> {
  shouldUnattachDevice: boolean;
}

type MortalityEventProps = keyof IMortalityEvent;

// code fields that are defaulted in this workflow
type MortalityDeviceStatus = 'Mortality';
type MortalityDeploymentStatus = 'Not Deployed'
type MortalityAnimalStatus = 'Potential Mortality';

export default class MortalityEvent extends BCTWEvent implements IMortalityEvent {
  animal_status: MortalityAnimalStatus;
  proximate_cause_of_death: string;
  predator_species: string;
  retrieved: boolean; // note: could be moved to retrieval workflow?
  retrieval_date: Date;
  activation_status: boolean;
  device_deployment_status: MortalityDeploymentStatus;
  device_status: MortalityDeviceStatus;
  location_event: LocationEvent;
  pcod_confidence_value: string; // todo:

  // workflow related fields
  shouldUnattachDevice: boolean;

  // new fields
  mortality_investigation: string; // code
  mortality_record: boolean;
  captivity_status: boolean; 
  mortality_captivity_status: string; // code. enable if captivity_status ^ true
  device_condition: string // code
  predator_known: boolean; // todo: not stored? -> expose predator_species

  // get identifier(): keyof MortalityEvent {
  //   return 'critter_id';
  // }

  static get requiredFields(): MortalityEventProps[] {
    return ['device_id'] //todo:
  }

  constructor(public critter_id: string, public collar_id: string, public device_id: number) {
    // todo: default dates ???
    super();
    this.retrieval_date = new Date();
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

  formatPropAsHeader(s: keyof MortalityEvent): string {
    switch (s) {
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
      default:
        return columnToHeader(s);
    }
  }

  fields: Record<MortalityEventProps, FormFieldObject<MortalityEvent>> = { 
    collar_id: { prop: 'collar_id', type: eInputType.unknown},
    critter_id: { prop: 'critter_id', type: eInputType.unknown},
    device_id: { prop: 'device_id', type: eInputType.unknown},

    animal_status: { prop: 'animal_status', type: eInputType.code },
    proximate_cause_of_death: { prop: 'proximate_cause_of_death', type: eInputType.code },
    predator_species: { prop: 'predator_species', type: eInputType.code },
    retrieved: { prop: 'retrieved', type: eInputType.check },
    retrieval_date: { prop: 'retrieval_date', type: eInputType.date },
    activation_status: { prop: 'activation_status', type: eInputType.check },
    device_deployment_status: { prop: 'device_deployment_status', type: eInputType.code },
    device_status: { prop: 'device_status', type: eInputType.code },
    // pcod_confidence_value: { prop: 'pcod_confidence_value', type: eInputType.text },
    shouldUnattachDevice: { prop: 'shouldUnattachDevice', type: eInputType.check },
  }

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

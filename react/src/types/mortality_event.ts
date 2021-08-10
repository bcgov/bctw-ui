import { columnToHeader, omitNull } from 'utils/common_helpers';
import { Animal } from './animal'
import { Collar } from './collar'
import { BCTW } from './common_types';
import { eInputType, FormFieldObject } from './form_types';
import { LocationEvent } from './location_event'

interface IMortalityEvent extends 
  Pick<Animal, 'critter_id' | 'animal_status' | 'proximate_cause_of_death' | 'predator_species' >,
  Pick<Collar, 'collar_id' | 'device_id' | 'retrieved' | 'retrieval_date' | 'activation_status' | 'device_deployment_status' | 'device_status'> {
  shouldUnattachDevice: boolean;
}

export default class MortalityEvent implements IMortalityEvent, BCTW {
  critter_id: string;
  animal_status: string;
  proximate_cause_of_death: string;
  predator_species: string; //todo:
  collar_id: string;
  device_id: number;
  retrieved: boolean;
  shouldUnattachDevice: boolean;
  retrieval_date: Date;
  activation_status: boolean;
  device_deployment_status: string;
  device_status: string;
  location_event: LocationEvent;
  pcod_confidence_value: string; // todo:

  constructor(critterId: string, collarId: string, deviceId: number) {
    this.critter_id = critterId;
    this.collar_id = collarId;
    this.device_id = deviceId;
    this.retrieval_date = new Date();
    this.retrieved = false;
    this.activation_status = true;
    // workflow defaulted fields
    this.shouldUnattachDevice = false;
    this.device_status = 'Mortality';
    this.device_deployment_status = 'Not Deployed';
    this.animal_status = 'Potential Mortality';
    this.shouldUnattachDevice = false;
  }

  formatPropAsHeader(s: string): string {
    switch(s) {
      case 'retrieved':
        return 'Has Device Been Retrieved?'
      case 'activation_status':
        return 'Is Device Still Active With Vendor?';
      case 'pcod_predator_species':
        return 'PCOD Predator Species';
      case 'pcod_confidence_value':
        return 'PCOD Confidence Value';
      case 'shouldUnattachDevice':
        return 'Unassign device from animal?';
      default:
        return columnToHeader(s);
    }
  }
  get formFields(): FormFieldObject<MortalityEvent>[] {
    return [
      {prop: 'animal_status', type: eInputType.code },
      {prop: 'proximate_cause_of_death', type: eInputType.text },
      {prop: 'predator_species', type: eInputType.code },
      {prop: 'proximate_cause_of_death', type: eInputType.code },
      {prop: 'retrieved', type: eInputType.check },
      {prop: 'retrieval_date', type: eInputType.date },
      {prop: 'activation_status', type: eInputType.check },
      {prop: 'device_deployment_status', type: eInputType.code },
      {prop: 'device_status', type: eInputType.code },
      {prop: 'pcod_confidence_value', type: eInputType.text },
      {prop: 'shouldUnattachDevice', type: eInputType.check }
    ]
  }

  // retrieve the animal metadata fields from the mortality event
  get getCritter(): Animal {
    const a = new Animal();
    const l = this.location_event;
    a.critter_id = this.critter_id;
    a.animal_status = this.animal_status;
    a.mortality_date = l.date;
    a.mortality_comment = l.comment;
    a.mortality_latitude = l.latitude;
    a.mortality_longitude = l.longitude;
    a.mortality_utm_easting = l.utm_easting;
    a.mortality_utm_northing = l.utm_northing;
    a.mortality_utm_zone = l.utm_zone;
    return omitNull(a)
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

  toJSON(): MortalityEvent {
    // if marked as not retrieved, wipe the retrieval date.
    if (!this.retrieved) {
      delete this.retrieval_date;
    }
    // preserve lat/long or UTM, but not both
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

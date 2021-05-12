import { columnToHeader, omitNull } from 'utils/common';
import { Animal } from './animal'
import { Collar } from './collar'
import { BCTW } from './common_types';
import { LocationEvent } from './location_event'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IMortalityEvent extends 
  Pick<Animal, 'critter_id' | 'animal_status' >,
  Pick<Collar, 'collar_id' | 'device_id' | 'retrieved' | 'retrieval_date' | 'vendor_activation_status' | 'device_deployment_status' | 'device_status'> {}

export default class MortalityEvent implements IMortalityEvent, BCTW {
  critter_id: string;
  animal_status: string;
  collar_id: string;
  device_id: number;
  retrieved: boolean;
  retrieval_date: Date;
  vendor_activation_status: boolean;
  device_deployment_status: string;
  device_status: string;
  location_event: LocationEvent;
  deviceUnassigned: boolean;
  // pcod: string;
  // pcod_predator_species: string;
  pcod_confidence_value: string;

  constructor(critterId: string, collarId: string, deviceId: number) {
    this.critter_id = critterId;
    this.collar_id = collarId;
    this.device_id = deviceId;
    this.retrieval_date = new Date();
    this.retrieved = true;
    this.vendor_activation_status = false;
    // workflow defaulted fields
    this.device_status = 'Mortality';
    this.device_deployment_status = 'Not Deployed';
    this.animal_status = 'Potential Mortality';
    this.deviceUnassigned = true;
  }

  formatPropAsHeader(s: string): string {
    switch(s) {
      case 'retrieved':
        return 'Device Has Been retrieved?'
      case 'vendor_activation_status':
        return 'Is Device Still Active With Vendor?'
      case 'pcod':
        return 'Proximate Cause of Death' 
      case 'pcod_predator_species':
        return 'PCOD Predator Species' 
      case 'pcod_confidence_value':
        return 'PCOD Confidence Value' 
        default:
        return columnToHeader(s);
    }
  }

  get editableProps(): string[] {
    return Object.keys(this)?.filter(key => !['critter_id', 'collar_id', 'mortality_event'].includes(key))
  }

  get propsThatAreCodes(): string[] {
    return ['animal_status', 'device_deployment_status', 'device_status'];
  }

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
    delete a.capture_date;
    delete a.release_date;
    delete a.estimated_age;
    return omitNull(a)
  }

  get getCollar(): Collar {
    const c = new Collar();
    c.collar_id = this.collar_id;
    c.device_id = this.device_id;
    c.retrieval_date = this.retrieval_date;
    c.retrieved = this.retrieved;
    c.vendor_activation_status = this.vendor_activation_status;
    c.device_status = this.device_status;
    c.device_deployment_status = this.device_deployment_status;
    delete c.malfunction_date;
    return omitNull(c);
  }
}

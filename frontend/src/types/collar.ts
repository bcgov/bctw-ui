import moment from 'moment';
import { columnToHeader } from '../components/component_helpers';

interface Collar {
    device_id: number;
    make: string;
    model: string;
    deployment_status: string;
    collar_status: string;
    collar_type: string;
    deactivated: boolean;
    radio_frequency: number;
    malfunction_date: Date;
    max_transmission_date: Date;
    reg_key: string;
    retreival_date: Date;
    satellite_network: string;
}

const assignedCollarProps = [ 'animal_id', 'device_id', 'collar_status', 'max_transmission_date', 'make', 'model', ];
const availableCollarProps = [ 'device_id', 'collar_status', 'max_transmission_date', 'make', 'model'];

const getCollarTitle = (str: string): string => {
      switch (str) {
        case 'device_id':
          return 'Device ID';
        case 'make':
          return 'GPS Vendor';
        case 'model':
          return 'Collar Model';
        case 'animal_id':
          return 'Individual ID';
        case 'max_transmission_date':
          return 'Last Update';
        default:
          return columnToHeader(str);
      }
    }
// class Collar implements ICollar {
//     public static getTitle(str: string): string {
//       switch (str) {
//         case 'device_id':
//           return 'Device ID';
//         case 'make':
//           return 'GPS Vendor';
//         case 'model':
//           return 'Collar Model';
//         case 'animal_id':
//           return 'Individual ID';
//         case 'max_transmission_date':
//           return 'Last Update';
//         default:
//           return columnToHeader(str);
//       }
//     }

//     public device_id: number;
//     public make: string;
//     public model: string;
//     public deployment_status: string;
//     public collar_status: string;
//     public collar_type: string;
//     public deactivated: boolean;
//     public radio_frequency: number;
//     public malfunction_date: Date;
//     public max_transmission_date: Date;
//     public reg_key: string;
//     public retreival_date: Date;
//     public satellite_network: string;
//     constructor(deviceId: number, make: string, model: string ) {
//       this.device_id = deviceId;
//       this.make = make;
//       this.model = model;
//     }
// }

const _momentFormat = 'DD-MM-YYYY HH:mm:ss';

function decodeCollar(json: Collar): Collar {
  const collar = Object.create({});
  return Object.assign(collar, json, {
    malfunction_date: json.malfunction_date ? moment(json.malfunction_date) : null,
    max_transmission_date: json.max_transmission_date ? moment(json.max_transmission_date) : null,
    retreival_date: json.retreival_date ? moment(json.retreival_date) : null,
  });
}

const datetimeFields = ['malfunction_date', 'max_transmission_date', 'retreival_date'];

// dont upsert null date / timestamp fields
function encodeCollar(c: Collar) {
  const dateFields = {};
  datetimeFields.forEach((s: string) => {
    if (c[s]) {
      dateFields[s] = moment(c[s]).format(_momentFormat);
    } else {
      delete c[s];
    }
  });
  return Object.assign(c, dateFields);
}

interface ICollarLinkResult {
  assignment_id: number;
  animal_id: string;
  device_id: number;
  effective_date: Date;
  end_date: Date;
}

export {
  decodeCollar,
  encodeCollar,
  ICollarLinkResult,
  // ICollar,
  Collar,
  assignedCollarProps,
  availableCollarProps,
  getCollarTitle,
};

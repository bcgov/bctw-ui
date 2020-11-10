import moment from 'moment';
import { ICollar } from './collar';

interface ICollarAssignment {
  assignment_id: number;
  device_id: number;
  make: string;
  radio_frequency: number;
  start_time: Date;
  end_time: Date;
}

class CollarAssignment implements ICollarAssignment {
  public static getTitle(str: string): string {
    switch (str) {
      case 'device_id':
        return 'Device ID';
      case 'make':
        return 'GPS Vendor';
      case 'start_time':
        return 'Assignment Start';
      case 'end_time':
        return 'Assignment End';
      case 'radio_frequency':
        return 'Radio Frequency';
    }
  }
  public assignment_id: number;
  public device_id: number;
  public make: string;
  public radio_frequency: number;
  public start_time: Date;
  public end_time: Date;
}

function decodeCollarAssignment(json: ICollarAssignment): CollarAssignment {
  const ca = Object.create(CollarAssignment.prototype);
  return Object.assign(ca, json, {
    start_time: moment(json.start_time),
    end_time: moment(json.end_time),
  });
}

export {
  CollarAssignment,
  decodeCollarAssignment,
};

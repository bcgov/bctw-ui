import moment from 'moment';

interface ICollarAssignment {
  assignment_id: number;
  device_id: number;
  make: string;
  radio_frequency: number;
  start_time: Date;
  end_time: Date;
}

const assignmentPropsToDisplay = ['device_id', 'collar_make', 'start_time', 'end_time'];

class CollarAssignment implements ICollarAssignment {
  public static getTitle(str: string): string {
    switch (str) {
      case 'device_id':
        return 'Device ID';
      case 'collar_make':
        return 'GPS Vendor';
      case 'start_time':
        return 'Assignment Start';
      case 'end_time':
        return 'Assignment End';
      case 'radio_frequency':
        return 'Radio Frequency';
    }
    return '';
  }
  public assignment_id: number;
  public device_id: number;
  public make: string;
  public radio_frequency: number;
  public start_time: Date;
  public end_time: Date;

  constructor(assignmentId: number, deviceId: number, make: string, radioFreq: number, start: Date, end: Date) {
    this.assignment_id = assignmentId;
    this.device_id = deviceId;
    this.make = make;
    this.radio_frequency = radioFreq;
    this.start_time = start;
    this.end_time = end;
  }
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
  assignmentPropsToDisplay,
};

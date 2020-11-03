interface IBCTWType {
  // getTitle: (prop: string) => string;
}
interface ICollar /*extends IBCTWType */ {
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

const collarPropsToDisplay = [
  'animal_id',
  'device_id',
  'collar_status',
  'max_transmission_date',
  'make',
  'model',
  'interval',
];

class Collar implements ICollar {
    public static getTitle(str: string): string {
      switch (str) {
        case 'device_id':
          return 'Device ID';
        case 'make':
          return 'GPS Vendor';
        case 'collar_status':
          return 'Collar Status';
        case 'satellite_network':
          return 'Satellite Network';
        case 'max_transmission_date':
          return 'Last Update';
        case 'interval':
          return 'Next Update';
        case 'animal_id':
          return 'Individual ID';
      }
    }
    public device_id: number;
    public make: string;
    public model: string;
    public deployment_status: string;
    public collar_status: string;
    public collar_type: string;
    public deactivated: boolean;
    public radio_frequency: number;
    public malfunction_date: Date;
    public max_transmission_date: Date;
    public reg_key: string;
    public retreival_date: Date;
    public satellite_network: string;
}


interface ICollarLinkResult {
  assignment_id: number;
  animal_id: string;
  device_id: number;
  effective_date: Date;
  end_date: Date;
}

export {
  ICollarLinkResult,
  ICollar,
  Collar,
  collarPropsToDisplay,
};

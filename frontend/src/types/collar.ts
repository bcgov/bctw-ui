const collarPropToDisplay = (propertyName: string): string => {
  switch (propertyName) {
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
};

export {
  collarPropToDisplay,
};

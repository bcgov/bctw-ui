import { eInputType, FormInputType } from 'components/form/form_helpers';
import { columnToHeader } from 'utils/common';
import { BCTW, FormFieldObject } from './common_types';

export type EventBaseProps = {
  critter_id: string;
  collar_id: string;
};

export type LocationEventType = 'capture' | 'mortality' | 'release' | 'retrieval' | 'malfunction';

const locationProps = ['_date', '_latitude', '_longitude', '_utm_easting', '_utm_northing', '_utm_zone'];

const generateLocationEventProps = (event: LocationEventType): FormFieldObject[] => {
  return locationProps.map((s) => ({ prop: `${event}${s}` }));
};

const generateFieldTypes = (props: FormFieldObject[]): FormInputType[] => {
  const keys = props.map((p) => p.prop);
  return keys.map((p) => ({
    key: p,
    type: p.indexOf('date') !== -1 ? eInputType.date : eInputType.number,
    value: p.indexOf('date') !== -1 ? new Date() : 0
  }));
};

export { generateLocationEventProps, generateFieldTypes };

export class LocationEvent implements BCTW {
  formatPropAsHeader(str: string): string {
    return columnToHeader(str.replace('utm', 'UTM').substring(str.indexOf('_') + 1));
  }
}

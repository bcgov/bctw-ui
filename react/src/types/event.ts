import { eInputType, FormInputType } from 'components/form/form_helpers';
import { columnToHeader } from 'utils/common';
import { Animal } from './animal';
import { Collar } from './collar';
import { BCTW, FormFieldObject } from './common_types';

interface IEventBaseProps extends Pick<Animal, 'critter_id'>, Pick<Collar, 'collar_id'> {}
type LocationEventType = 'capture' | 'mortality' | 'release' | 'retrieval' | 'malfunction';

const locationProps = ['_date', '_comment', '_latitude', '_longitude', '_utm_easting', '_utm_northing', '_utm_zone'];

const generateLocationEventProps = (event: LocationEventType): FormFieldObject[] => {
  return locationProps.map((s) => ({ prop: `${event}${s}` }));
};

const generateFieldTypes = (props: FormFieldObject[]): FormInputType[] => {
  return props
    .map((p) => p.prop)
    .map((p) => ({
      key: p,
      type: p.includes('date') ? eInputType.date : p.includes('comment') ? eInputType.text : eInputType.number,
      value: p.includes('date') ? new Date() : p.includes('comment') ? '' : 0,
    }));
};

class LocationEvent implements BCTW {
  formatPropAsHeader(str: string): string {
    return columnToHeader(str.replace('utm', 'UTM').substring(str.indexOf('_') + 1));
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IMortalityEvent extends Pick<Animal, 'mortality_date' | 'mortality_comment' | 'mortality_latitude' | 'mortality_longitude' | 'mortality_utm_easting' | 'mortality_utm_northing' | 'mortality_utm_zone'>{}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ICaptureEvent extends Pick<Animal, 'capture_date' | 'capture_comment' | 'capture_latitude' | 'capture_longitude' | 'capture_utm_easting' | 'capture_utm_northing' | 'capture_utm_zone'>{}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IReleaseEvent extends Pick<Animal, 'release_date' | 'release_comment' | 'release_latitude' | 'release_longitude' | 'release_utm_easting' | 'release_utm_northing' | 'release_utm_zone'>{}

export type { IEventBaseProps, LocationEventType, ICaptureEvent, IMortalityEvent, IReleaseEvent };
export { generateLocationEventProps, generateFieldTypes, LocationEvent };
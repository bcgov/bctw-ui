import { AttachedAnimal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWBaseType } from 'types/common_types';

export type EventType = 'mortality' | 'release' | 'capture' | 'unknown';
/**
 * interface that BCTW event/workflows implement
 */

export type OptionalAnimal = { [Property in keyof AttachedAnimal]+?: AttachedAnimal[Property] };
export type OptionalDevice = { [Property in keyof Collar]+?: Collar[Property] };
export interface BCTWEvent<T> extends Omit<BCTWBaseType<T>, 'identifier'> {
  event_type: EventType;
  getHeaderTitle(): string;
  get displayProps(): (keyof T)[]; // headers displayed in the workflow modal title

  // optional methods to extend if the workflow needs to save specific properties
  getAnimal(): OptionalAnimal;
  getDevice(): OptionalDevice;
  getAttachment?(): void;
}

export const eventToJSON = <T>(keys: string[], event: T): Record<string, unknown> => {
  const ret = {};
  const entries = Object.entries(event);
  for (const [key, value] of entries) {
    if (keys.includes(key)) {
      ret[key] = value;
    }
  }
  return ret;
};

import { BCTWBaseType } from 'types/common_types';

export type EventType = 'mortality' | 'release' | 'capture' | 'unknown';
/**
 * 
 */
export interface BCTWEvent<T> extends Omit<BCTWBaseType<T>, 'identifier'> {
  event_type: EventType;
  getHeaderTitle(): string; // | React.ReactNode;
  get displayProps(): (keyof T)[];
}

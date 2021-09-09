export type EventType = 'mortality' | 'release' | 'capture' | 'unknown';
export interface BCTWEvent<T> {
  event_type: EventType;

  formatPropAsHeader(k: keyof T): string;
  getHeaderTitle(): string;
  getHeaderProps(): (keyof T)[];
}
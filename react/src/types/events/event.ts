export type EventType = 'mortality' | 'release' | 'capture';

export abstract class BCTWEvent {
  // derived must implement
  abstract formatPropAsHeader(k: keyof BCTWEvent): string;

  constructor(private event_type: EventType) {}

  get eventType(): EventType {
    return this.event_type;
  }
}

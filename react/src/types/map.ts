import { IAnimal } from 'types/animal';
import { ICollar } from 'types/collar';

interface ITelemetry extends Omit<IAnimal, 'animal_id' | 'device_id'>, ICollar {}
interface ITelemetryFeature extends GeoJSON.Feature {
  //  type: 'Feature';
  // geometry {
  // type: "Point";
  // coordinates: Position;
  // }
  // id: number
  properties: ITelemetry

}

export type {
  ITelemetryFeature
}
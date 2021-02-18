import { IAnimal } from 'types/animal';
import { ICollar } from 'types/collar';

interface ITelemetryDetails extends Omit<IAnimal, 'animal_id' | 'device_id'>, ICollar {}
interface ITelemetryFeature extends GeoJSON.Feature {
  //  type: 'Feature';
  // geometry {
  // type: "Point";
  // coordinates: Position;
  // }
  // id: number
  properties: ITelemetryDetails
}

interface ITelemetryFeatureCollection extends GeoJSON.FeatureCollection {
  // type: "FeatureCollection";
  // features: Array<Feature<G, P>>;
  features: ITelemetryFeature[];
}

export type {
  ITelemetryFeature,
  ITelemetryFeatureCollection,
  ITelemetryDetails
}
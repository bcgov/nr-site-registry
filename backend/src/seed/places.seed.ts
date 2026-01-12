import { EntityManager } from 'typeorm';
import { Place } from '../app/entities/placeEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const placesJson = require('./places.json');

export const PlacesSeeder = async (manager: EntityManager) => {
  try {
    const places: Place[] = placesJson.map((placeJson: any) => {
      const place = new Place();
      place.name = placeJson.name;
      place.latdeg = placeJson.pos[0];
      place.longdeg = placeJson.pos[1];
      return place;
    });
    await manager.save<Place>(places);
  } catch (error) {
    console.error('Error seeding places:', error);
  }
};

import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { Place } from '../app/entities/placeEntity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const placesJson = require('./places.json');

export default class PlacesSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const places: Place[] = placesJson.map((placeJson) => {
      const place = new Place();
      place.name = placeJson.name;
      place.latdeg = placeJson.pos[0];
      place.longdeg = placeJson.pos[1];

      return place;
    });

    await dataSource.createEntityManager().save<Place>(places);
  }
}

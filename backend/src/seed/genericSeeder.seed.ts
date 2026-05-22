import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { PlacesSeeder } from './places.seed';
// import { Schedule2RefSeeder } from './schedule2Ref.seed';

export default class GenericSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const manager = dataSource.createEntityManager();
    const seeders = [
      {
        name: 'PlacesSeeder',
        execute: () => PlacesSeeder(manager),
      },
    ];

    for (const seeder of seeders) {
      try {
        await seeder.execute();
      } catch (error) {
        console.error(`Error executing ${seeder.name}:`, error);
      }
    }
  }
}

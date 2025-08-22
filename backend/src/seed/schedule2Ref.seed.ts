import { Schedule2Reference } from '../app/entities/schedule2Reference';
import { EntityManager } from 'typeorm';

const schedule2RefJson = require('./schedule2Ref.json');
export const Schedule2RefSeeder = async (manager: EntityManager) => {
  try {
    const schedule2Ref: Schedule2Reference[] = schedule2RefJson.map(
      (schedule2RefJson: any) => {
        const schedule2Ref = new Schedule2Reference();
        schedule2Ref.code = schedule2RefJson.value;
        schedule2Ref.description = schedule2RefJson.label;
        return schedule2Ref;
      },
    );
    await manager.save<Schedule2Reference>(schedule2Ref);
  } catch (error) {
    console.error('Error seeding schedule2Ref:', error);
  }
};

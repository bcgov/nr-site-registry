import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUserIfNotFound(
    email: string,
    userId: string,
    idp: string,
    firstName: string,
    lastName: string,
  ) {
    sitesLogger.info('UserService.createUserIfNotFound() start');
    //sitesLogger.debug('UserService.createUserIfNotFound() start')
    try {
      let user = await this.usersRepository.findOne({ where: { email } });
      const whoCreated = 'system';
      const whenCreated = new Date();
      if (!user) {
        user = await this.usersRepository.create({
          email,
          userId,
          idp,
          firstName,
          lastName,
          whoCreated,
          whenCreated,
        });
        sitesLogger.info('UserService.createUserIfNotFound() end');
        //sitesLogger.debug('UserService.createUserIfNotFound() end')
        return this.usersRepository.save(user);
      } else {
        sitesLogger.info('User already exits', user.userId);
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in UserService.createUserIfNotFound() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }
}

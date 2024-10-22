import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly sitesLogger: LoggerService,
  ) {}

  async createUserIfNotFound(
    email: string,
    userId: string,
    idp: string,
    firstName: string,
    lastName: string,
  ) {
    this.sitesLogger.log('UserService.createUserIfNotFound() start');
    this.sitesLogger.debug('UserService.createUserIfNotFound() start');
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
        this.sitesLogger.log('UserService.createUserIfNotFound() end');
        this.sitesLogger.debug('UserService.createUserIfNotFound() end');
        return this.usersRepository.save(user);
      } else {
        this.sitesLogger.log('User already exits userid:' + user.userId);
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in UserService.createUserIfNotFound() end',
        JSON.stringify(error),
      );
      throw new HttpException(`Failed to create user`, HttpStatus.NOT_FOUND);
    }
  }
}

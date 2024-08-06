import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/app/entities/user.entity";
import { Repository } from "typeorm";


@Injectable()
export class UserService
{
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    )
    {       
    }


    async createUserIfNotFound(email: string, userId: string, idp: string, firstName:string, lastName: string) {
        let user = await this.usersRepository.findOne({ where: { email } });
        const whoCreated = 'system';
        const whenCreated = new Date();
        if (!user) {
          user = await this.usersRepository.create({ email, userId, idp ,firstName, lastName , whoCreated, whenCreated });
          return this.usersRepository.save(user);
        } 
        else
        {
            console.log("User already exits", user.userId)
        }
    
       
      } 
}
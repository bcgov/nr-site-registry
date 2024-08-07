// src/middleware/jwt.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserJWTTokenDecoderMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
      try {
        const decodedToken: any = this.jwtService.decode(token);
        const { email, sub, identity_provider, given_name, family_name } =
        decodedToken;

       
        await this.userService.createUserIfNotFound(
          email,
          sub,
          identity_provider,
          given_name,
          family_name,
        );
      } catch (error) {
        console.error('User JWTTokenDecoderMiddleware error:', error);
      }
    }

    next();
  }
}

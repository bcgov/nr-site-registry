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
    if (req.originalUrl.startsWith('/csv/generate') && req.method === 'GET') {
      return next(); // skip middleware for this route
    }

    const token = req.headers['authorization']?.split(' ')[1];
    if (token && token !== 'undefined' && token.trim() !== '') {
      try {
        const decodedToken: any = this.jwtService.decode(token);
        const { email, sub, given_name, family_name } = decodedToken;
        const identityProvider =
          decodedToken.identity_provider ?? decodedToken.loginSource;
        // The application expects `user.profile.identity_provider` to be in
        // lower case for legacy development reasons. Rather than changing the
        // check everywhere, we normalize it here.
        const normalizedIdentityProvider = identityProvider
          ? String(identityProvider).toLowerCase()
          : undefined;

        await this.userService.createUserIfNotFound(
          email,
          sub,
          normalizedIdentityProvider,
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

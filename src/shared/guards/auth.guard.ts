import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export abstract class AuthGuard implements CanActivate {
  constructor(protected jwtService: JwtService) {}

  abstract validateUser(payload: any): Promise<boolean>;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Token not found in Authorization header',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'TEST_JWT_SHIPAGER',
      });

      const isValid = await this.validateUser(payload);
      if (!isValid) {
        throw new UnauthorizedException('User validation failed');
      }

      request['user'] = payload; // ✅ Attach user payload to request
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ✅ Extracts JWT from Authorization header
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.split(' ')[1]; // Extract token part after "Bearer "
  }
}

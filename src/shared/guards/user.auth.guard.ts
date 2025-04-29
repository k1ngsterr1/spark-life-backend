import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class UserAuthGuard extends AuthGuard {
  constructor(
    public readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    super(jwtService);
  }

  async validateUser(payload: any): Promise<boolean> {
    try {
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return true;
    } catch (error) {
      console.error('JWT validation failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

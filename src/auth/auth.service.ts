import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        omit: {
          hash: true,
        },
      });

      // const options = {
      //   email: dto.email,
      //   subject: 'Welcome to our service',
      //   html: `<p>Hello ${user.email},</p>
      //   <p>Welcome to our community! Your account is now active.</p>
      //   <p>Enjoy your time with us!</p>`,
      // };

      // await this.emailService.sendEmail(options);

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if ((error.code = 'P2002')) {
          throw new ForbiddenException('Credentials taken');
        } else {
          throw error;
        }
      }
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const passwordMatch = await argon.verify(user.hash, dto.password);

    if (!passwordMatch)
      throw new UnauthorizedException('Credentials incorrect');

    const secret = await this.signToken(user.id, user.email);

    return secret;
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string; refreshToken: string }> {
    const payload = {
      id: userId,
      email,
    };
    const secret = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET'),
    });
    const refreshToken = await this.createRefreshToken(userId);
    return { access_token: secret, refreshToken };
  }

  async createRefreshToken(userId: number): Promise<string> {
    const refreshToken = await this.jwt.signAsync(
      {},
      {
        expiresIn: '7d',
        secret: this.config.get('JWT_SECRET'),
      },
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const token = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });
      const user = await this.prisma.user.findFirst({
        where: {
          refreshToken,
        },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const payload = { id: user?.id, email: user?.email };
      return this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new InternalServerErrorException();
      } else {
        throw error;
      }
    }
  }
}

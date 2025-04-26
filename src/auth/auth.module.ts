import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      signOptions: { expiresIn: '15m' },
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
})
export class AuthModule {}

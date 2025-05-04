import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private userService: UserService,
    private authGuard: AuthGuard,
  ) {}

  @Get('me')
  async getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }
}

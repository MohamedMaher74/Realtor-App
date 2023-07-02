import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../dtos/signup.dto';
import { LoginDto } from '../dtos/login.dto';
import { UserType } from '@prisma/client';
import { UserTypeValidationPipe } from '../pipes/user-status-validation-pipe';
import { User, UserInfo } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  @UsePipes(ValidationPipe)
  signup(
    @Body() body: SignupDto,
    @Param('userType', new UserTypeValidationPipe()) userType: UserType,
  ) {
    return this.authService.signup(body, userType);
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Get('/me')
  me(@User() user: UserInfo) {
    return user;
  }
}

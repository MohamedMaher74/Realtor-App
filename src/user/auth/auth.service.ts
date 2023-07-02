import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignupDto } from '../dtos/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';
import { LoginDto } from '../dtos/login.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(body: SignupDto, userType: UserType) {
    try {
      const found = await this.prismaService.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (found) {
        throw new ConflictException('Email already used!');
      }

      if (body.password !== body.passwordConfirm) {
        throw new HttpException(
          'Passwords does not match!',
          HttpStatus.BAD_REQUEST,
        );
      }

      delete body.passwordConfirm;

      body.password = await bcrypt.hash(body.password, 10);

      const newUser = await this.prismaService.user.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          password: body.password,
          user_type: userType,
        },
      });

      delete newUser.password;

      const token = this.generateJWT(newUser.name, newUser.id);

      return { status: 'success', token, newUser };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async login(body: LoginDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!user || !(await bcrypt.compare(body.password, user.password))) {
        throw new ForbiddenException('Incorrect email or password');
      }

      delete user.password;

      const token = this.generateJWT(user.name, user.id);

      return { status: 'success', token, user };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  private generateJWT(name: string, id: number) {
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: process.env.JSON_EXPIRES_IN,
      },
    );
  }
}

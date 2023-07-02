import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Please provide a valid email!' })
  email: string;

  @IsString({ message: 'Please provide your password confirm!' })
  @IsNotEmpty()
  password: string;
}

import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Please provide your name!' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Please provide a valid email!' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long!' })
  password: string;

  @IsString({ message: 'Please provide your password confirm!' })
  @IsNotEmpty()
  passwordConfirm: string;

  @IsPhoneNumber('EG', { message: 'Phone number must contains 11 digits!' })
  phone: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class InquireDto {
  @IsString({ message: 'Please, write your Message' })
  @IsNotEmpty()
  message: string;
}

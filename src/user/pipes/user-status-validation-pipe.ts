import { BadRequestException, PipeTransform } from '@nestjs/common';
import { UserType } from '@prisma/client';

export class UserTypeValidationPipe implements PipeTransform {
  readonly allowedTypes = [UserType.BUYER, UserType.REALTOR, UserType.ADMIN];

  transform(value: any): any {
    if (!this.isTypeValid(value)) {
      throw new BadRequestException(`${value} is an invalid type!`);
    }

    return value;
  }

  private isTypeValid(type: any) {
    const idx = this.allowedTypes.indexOf(type.toUpperCase());
    return idx !== -1;
  }
}

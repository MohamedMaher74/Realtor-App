import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/HomeResponse.dto';
import { PropertyType } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { UserInfo } from 'src/user/decorators/user.decorator';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

export const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bathrooms: true,
  number_of_bedrooms: true,
};

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    console.log(homes);
    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async createHome(body: CreateHomeParams, userId: number) {
    try {
      const home = await this.prismaService.home.create({
        data: {
          address: body.address,
          number_of_bathrooms: body.numberOfBathrooms,
          number_of_bedrooms: body.numberOfBedrooms,
          city: body.city,
          land_size: body.landSize,
          propertyType: body.propertyType,
          price: body.price,
          realtor_id: userId,
        },
      });

      const homeImages = body.images.map((image) => {
        return { ...image, home_id: home.id };
      });

      await this.prismaService.image.createMany({ data: homeImages });

      return new HomeResponseDto(home);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async getHome(id: number) {
    try {
      const home = await this.prismaService.home.findUnique({
        where: {
          id,
        },
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
          },
          realtor: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!home) {
        throw new NotFoundException(`No home with this id ${id}`);
      }

      return new HomeResponseDto(home);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async updateHome(id: number, data: UpdateHomeParams) {
    try {
      const home = await this.prismaService.home.findUnique({
        where: {
          id,
        },
      });

      if (!home) {
        throw new NotFoundException(`No home with this id ${id}`);
      }

      const updatedHome = await this.prismaService.home.update({
        where: {
          id,
        },
        data,
      });

      return new HomeResponseDto(updatedHome);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async deleteHome(id: number) {
    try {
      await this.prismaService.image.deleteMany({
        where: {
          home_id: id,
        },
      });

      await this.prismaService.home.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async getRealtorByHomeId(id: number) {
    try {
      const home = await this.prismaService.home.findUnique({
        where: {
          id,
        },
        select: {
          realtor: {
            select: {
              name: true,
              id: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!home) {
        throw new NotFoundException(`No home with this id ${id}`);
      }

      return home.realtor;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async inquire(buyer: UserInfo, homeId: number, message: string) {
    try {
      const realtor = await this.getRealtorByHomeId(homeId);

      return this.prismaService.message.create({
        data: {
          realtor_id: realtor.id,
          buyer_id: buyer.id,
          home_id: homeId,
          message,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  getMessagesByHome(homeId: number) {
    try {
      return this.prismaService.message.findMany({
        where: {
          home_id: homeId,
        },
        select: {
          message: true,
          buyer: {
            select: {
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }
}

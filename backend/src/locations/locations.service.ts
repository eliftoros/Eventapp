import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) { }

  create(createLocationDto: CreateLocationDto) {
    return this.prisma.location.create({
      data: createLocationDto,
    });
  }

  findAll() {
    return this.prisma.location.findMany({ include: { city: true } });
  }

  findOne(id: number) {
    return this.prisma.location.findUnique({
      where: { id },
      include: { city: true }
    });
  }

  update(id: number, updateLocationDto: UpdateLocationDto) {
    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  remove(id: number) {
    return this.prisma.location.delete({ where: { id } });
  }
}

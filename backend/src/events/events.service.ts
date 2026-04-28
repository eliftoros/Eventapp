import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) { }

  create(userId: number, createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
        userId,
      },
    });
  }

  findAll() {
    return this.prisma.event.findMany({
      include: {
        city: true,
        location: true,
        user: { select: { name: true } }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        city: true,
        location: true,
        participants: { include: { user: { select: { name: true } } } }
      }
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto, user: any) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // ORGANIZER can only update their own events
    // ADMIN can update any event
    if (user.role === 'ORGANIZER' && event.userId !== user.id) {
      throw new ForbiddenException('You can only update your own events');
    }

    if (user.role === 'USER') {
      throw new ForbiddenException('Users cannot update events');
    }

    // Handling date conversion if present
    const data: any = { ...updateEventDto };
    if (data.date) {
      data.date = new Date(data.date);
    }
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, user: any) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // ORGANIZER can only delete their own events
    // ADMIN can delete any event
    if (user.role === 'ORGANIZER' && event.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own events');
    }

    if (user.role === 'USER') {
      throw new ForbiddenException('Users cannot delete events');
    }

    // Delete all participants first to avoid foreign key constraint error
    await this.prisma.eventParticipant.deleteMany({
      where: { eventId: id }
    });

    // Then delete the event
    return this.prisma.event.delete({ where: { id } });
  }

  async joinEvent(userId: number, eventId: number) {
    const existingParticipant = await this.prisma.eventParticipant.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (existingParticipant) {
      throw new ConflictException('You have already joined this event');
    }

    return this.prisma.eventParticipant.create({
      data: {
        userId,
        eventId,
      },
    });
  }

  async leaveEvent(userId: number, eventId: number) {
    const participant = await this.prisma.eventParticipant.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant of this event');
    }

    return this.prisma.eventParticipant.delete({
      where: {
        id: participant.id,
      },
    });
  }
}

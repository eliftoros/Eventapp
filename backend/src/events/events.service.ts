import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, createEventDto: CreateEventDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ORGANIZER' && !user.isPremium) {
      if (createEventDto.imageUrl) {
        throw new ForbiddenException('Custom poster is a Premium feature. Please upgrade to Premium.');
      }
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const createdThisMonth = await this.prisma.event.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      if (createdThisMonth >= 3) {
        throw new ForbiddenException('Free organizers can create at most 3 events per month. Please upgrade to Premium.');
      }
    }

    return this.prisma.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
        userId,
      },
    });
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      include: {
        city: true,
        location: true,
        user: { select: { name: true, isPremium: true } },
        participants: true
      }
    });

    return events.sort((a, b) => {
      const aPremium = a.user?.isPremium ? 1 : 0;
      const bPremium = b.user?.isPremium ? 1 : 0;
      return bPremium - aPremium;
    });
  }

  async findOne(id: number, requestingUser?: any) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        city: true,
        location: true,
        participants: { include: { user: { select: { name: true, email: true } } } }
      }
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const isOwner = requestingUser && event.userId === requestingUser.id;
    const isAdmin = requestingUser && requestingUser.role === 'ADMIN';
    const isOwnerPremium = isOwner && requestingUser.isPremium;

    const result: any = { ...event };

    // If the requester is not an Admin and not the Premium owner of this event, hide participant user details
    if (!isAdmin && !isOwnerPremium) {
      result.participants = event.participants.map(p => ({
        ...p,
        user: null
      }));
    }

    return result;
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

    // Check if free organizer tries to set/update custom image URL
    if (user.role === 'ORGANIZER' && !user.isPremium && updateEventDto.imageUrl && updateEventDto.imageUrl !== event.imageUrl) {
      throw new ForbiddenException('Custom poster is a Premium feature. Please upgrade to Premium.');
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingParticipant = await this.prisma.eventParticipant.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (existingParticipant) {
      throw new ConflictException('You have already joined this event');
    }

    if (!user.isPremium) {
      const joinedCount = await this.prisma.eventParticipant.count({
        where: { userId },
      });
      if (joinedCount >= 3) {
        throw new ForbiddenException('Free users can join at most 3 events. Please upgrade to Premium.');
      }
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

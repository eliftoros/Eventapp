import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            }
        });
    }

    async findOne(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async updateRole(id: number, role: any) {
        return this.prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });
    }

    async findById(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isPremium: true,
            }
        });
    }

    async upgradeToPremium(id: number) {
        return this.prisma.user.update({
            where: { id },
            data: { isPremium: true },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isPremium: true,
            }
        });
    }
}

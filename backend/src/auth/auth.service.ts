import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(data: any) {
        const { email, password, name, role } = data;

        // Check if user exists
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Only allow USER or ORGANIZER roles
        const userRole = role === 'ORGANIZER' ? Role.ORGANIZER : Role.USER;

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: userRole,
            },
        });

        return this.createToken(user);
    }

    async login(data: any) {
        const { email, password } = data;
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.createToken(user);
    }

    private createToken(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        };
    }
}

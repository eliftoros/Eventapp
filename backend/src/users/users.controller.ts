import { Controller, Get, Post, UseGuards, Request, Patch, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.usersService.findById(req.user.id);
    }

    @Get()
    @Roles(Role.ORGANIZER)
    findAll() {
        return this.usersService.findAll();
    }

    @Patch(':id/role')
    @Roles(Role.ORGANIZER)
    updateRole(@Param('id') id: string, @Body('role') role: Role) {
        return this.usersService.updateRole(+id, role);
    }

    @Post('premium/upgrade')
    upgradePremium(@Request() req: any) {
        return this.usersService.upgradeToPremium(req.user.id);
    }
}

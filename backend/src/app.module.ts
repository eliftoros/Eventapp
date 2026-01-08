import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CitiesModule } from './cities/cities.module';
import { LocationsModule } from './locations/locations.module';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CitiesModule, LocationsModule, EventsModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../schema/user.schema';
import { Event, EventSchema } from '../schema/event.schema';
import { EventCompensation, EventCompensationSchema } from '../schema/eventCompensation.schema';
import { JwtStrategy } from '../jwt/jwt.strategy';

@Module({
  imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Event.name, schema: EventSchema },
            { name: EventCompensation.name, schema: EventCompensationSchema },
        ]),
      
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
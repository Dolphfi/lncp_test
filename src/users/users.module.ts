import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { TokenService } from './token.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  controllers: [UsersController],
  providers: [UsersService, TokenService],
  exports: [UsersService],
})
export class UsersModule {}

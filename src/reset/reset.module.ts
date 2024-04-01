import { Module } from '@nestjs/common';
import { ResetService } from './reset.service';
import { ResetController } from './reset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reset } from './entities/reset.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reset]),
            MailerModule.forRoot({transport: {host: '127.0.0.1',port: 1025,},defaults: {from: '"No Reply" <noreply@example.com>'},}),
            UsersModule],
  controllers: [ResetController],
  providers: [ResetService],
})
export class ResetModule {}

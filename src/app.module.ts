import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'database/data-source';
import { UsersModule } from './users/users.module';
import { CurrentUserMiddleware } from './utility/middlewares/current-user.middleware';
import { ResetModule } from './reset/reset.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    TypeOrmModule.forRoot(AppDataSource),
    UsersModule,
    ResetModule,
  ],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

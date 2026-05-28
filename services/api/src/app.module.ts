import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';
import { AuthService } from './modules/auth/auth.service';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';

// Guards
import { TenantGuard } from './modules/auth/guards/tenant.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

// Interceptors
import { TenantIsolationInterceptor } from './interceptors/tenant-isolation.interceptor';

// Middleware
import { TenantContextMiddleware } from './middleware/tenant-context.middleware';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ComplianceModule } from './modules/compliance/compliance.module';

// Configs
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig, jwtConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: ['dist/modules/**/*.entity{.ts,.js}'],
        migrations: ['dist/database/migrations/*{.ts,.js}'],
        migrationsRun: false,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        ssl: process.env.NODE_ENV === 'production',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),

    // Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    JobsModule,
    CandidatesModule,
    ApplicationsModule,
    ShiftsModule,
    PaymentsModule,
    NotificationsModule,
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantIsolationInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}

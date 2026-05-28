import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { message: string; version: string; environment: string } {
    return {
      message: 'swipejobsOS API Gateway running',
      version: '0.0.1',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getHealthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

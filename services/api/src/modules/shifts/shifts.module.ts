import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift])],
  exports: [TypeOrmModule],
})
export class ShiftsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { Shift } from './entities/shift.entity';
import { ShiftAssignment } from './entities/shift-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, ShiftAssignment])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Shift } from './entities/shift.entity';
import { ShiftAssignment } from './entities/shift-assignment.entity';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    @InjectRepository(ShiftAssignment)
    private assignmentsRepository: Repository<ShiftAssignment>,
  ) {}

  async createShift(organizationId: string, createShiftDto: any): Promise<Shift> {
    const shift = this.shiftsRepository.create({
      id: uuidv4(),
      organization_id: organizationId,
      ...createShiftDto,
    });
    return this.shiftsRepository.save(shift);
  }

  async findShiftsForJob(jobId: string): Promise<Shift[]> {
    return this.shiftsRepository.find({
      where: { job_id: jobId, status: 'open' },
      order: { start_time: 'ASC' },
    });
  }

  async findUpcomingShifts(organizationId: string): Promise<Shift[]> {
    const now = new Date();
    return this.shiftsRepository
      .createQueryBuilder('shift')
      .where('shift.organization_id = :orgId', { orgId: organizationId })
      .andWhere('shift.start_time > :now', { now })
      .andWhere('shift.status != :status', { status: 'cancelled' })
      .orderBy('shift.start_time', 'ASC')
      .take(50)
      .getMany();
  }

  async assignShift(shiftId: string, candidateId: string, organizationId: string): Promise<ShiftAssignment> {
    const shift = await this.shiftsRepository.findOne({ where: { id: shiftId } });
    if (!shift || shift.positions_available <= 0) {
      throw new BadRequestException('Shift not available');
    }

    const assignment = this.assignmentsRepository.create({
      id: uuidv4(),
      shift_id: shiftId,
      candidate_id: candidateId,
      organization_id: organizationId,
      status: 'offered',
    });

    await this.assignmentsRepository.save(assignment);
    
    // Decrease available positions
    shift.positions_available -= 1;
    await this.shiftsRepository.save(shift);

    return assignment;
  }

  async acceptShift(assignmentId: string): Promise<ShiftAssignment> {
    const assignment = await this.assignmentsRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    assignment.status = 'accepted';
    return this.assignmentsRepository.save(assignment);
  }

  async rejectShift(assignmentId: string): Promise<ShiftAssignment> {
    const assignment = await this.assignmentsRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    assignment.status = 'rejected';
    await this.assignmentsRepository.save(assignment);

    // Increase available positions
    const shift = await this.shiftsRepository.findOne({ where: { id: assignment.shift_id } });
    if (shift) {
      shift.positions_available += 1;
      await this.shiftsRepository.save(shift);
    }

    return assignment;
  }

  async checkIn(assignmentId: string): Promise<ShiftAssignment> {
    const assignment = await this.assignmentsRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    assignment.check_in_time = new Date();
    return this.assignmentsRepository.save(assignment);
  }

  async checkOut(assignmentId: string): Promise<ShiftAssignment> {
    const assignment = await this.assignmentsRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    assignment.check_out_time = new Date();
    if (assignment.check_in_time) {
      const hours = (assignment.check_out_time.getTime() - assignment.check_in_time.getTime()) / (1000 * 60 * 60);
      assignment.hours_worked = parseFloat(hours.toFixed(2));
    }
    assignment.status = 'completed';

    return this.assignmentsRepository.save(assignment);
  }

  async getCandidateShifts(candidateId: string): Promise<ShiftAssignment[]> {
    return this.assignmentsRepository.find({
      where: { candidate_id: candidateId },
      order: { created_at: 'DESC' },
    });
  }

  async getShiftStats(organizationId: string): Promise<{
    total_shifts: number;
    open_shifts: number;
    assigned_shifts: number;
    completed_shifts: number;
  }> {
    const total = await this.shiftsRepository.count({
      where: { organization_id: organizationId },
    });

    const open = await this.shiftsRepository.count({
      where: { organization_id: organizationId, status: 'open' },
    });

    const assigned = await this.shiftsRepository.count({
      where: { organization_id: organizationId, status: 'assigned' },
    });

    const completed = await this.shiftsRepository.count({
      where: { organization_id: organizationId, status: 'completed' },
    });

    return {
      total_shifts: total,
      open_shifts: open,
      assigned_shifts: assigned,
      completed_shifts: completed,
    };
  }
}

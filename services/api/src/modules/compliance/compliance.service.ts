import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './entities/document.entity';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async uploadDocument(organizationId: string, candidateId: string, type: string, documentUrl: string): Promise<Document> {
    const document = this.documentsRepository.create({
      id: uuidv4(),
      candidate_id: candidateId,
      organization_id: organizationId,
      type,
      document_url: documentUrl,
      status: 'pending',
    });
    return this.documentsRepository.save(document);
  }

  async approveDocument(documentId: string, verifiedBy: string, notes?: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id: documentId } });
    if (document) {
      document.status = 'approved';
      document.verified_at = new Date();
      document.verified_by = verifiedBy;
      document.verification_notes = notes;
      return this.documentsRepository.save(document);
    }
    throw new Error('Document not found');
  }

  async rejectDocument(documentId: string, verifiedBy: string, notes: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id: documentId } });
    if (document) {
      document.status = 'rejected';
      document.verified_at = new Date();
      document.verified_by = verifiedBy;
      document.verification_notes = notes;
      return this.documentsRepository.save(document);
    }
    throw new Error('Document not found');
  }

  async getCandidateDocuments(candidateId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { candidate_id: candidateId },
      order: { created_at: 'DESC' },
    });
  }

  async getComplianceStatus(candidateId: string): Promise<{
    overall_status: string;
    documents: any[];
    onboarding_complete: boolean;
  }> {
    const documents = await this.documentsRepository.find({
      where: { candidate_id: candidateId },
    });

    const allApproved = documents.every(d => d.status === 'approved');
    const requiredTypes = ['driver_license', 'work_authorization'];
    const hasRequired = requiredTypes.every(type =>
      documents.some(d => d.type === type && d.status === 'approved')
    );

    return {
      overall_status: allApproved && hasRequired ? 'compliant' : 'pending',
      documents: documents.map(d => ({
        id: d.id,
        type: d.type,
        status: d.status,
      })),
      onboarding_complete: allApproved && hasRequired,
    };
  }

  async getOrganizationComplianceReport(organizationId: string): Promise<{
    total_candidates: number;
    compliant: number;
    pending: number;
    rejected: number;
  }> {
    const statuses = await this.documentsRepository
      .createQueryBuilder('doc')
      .select('doc.status', 'status')
      .addSelect('COUNT(DISTINCT doc.candidate_id)', 'count')
      .where('doc.organization_id = :orgId', { orgId: organizationId })
      .groupBy('doc.status')
      .getRawMany();

    return {
      total_candidates: statuses.reduce((sum: number, s: any) => sum + parseInt(s.count), 0),
      compliant: parseInt(statuses.find((s: any) => s.status === 'approved')?.count || 0),
      pending: parseInt(statuses.find((s: any) => s.status === 'pending')?.count || 0),
      rejected: parseInt(statuses.find((s: any) => s.status === 'rejected')?.count || 0),
    };
  }
}

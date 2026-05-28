# swipejobsOS Database Schema

## Overview

PostgreSQL relational database with the following principles:
- Normalized schema design
- Tenant-aware tables (organization_id column)
- Audit trails (created_at, updated_at, deleted_at)
- Soft deletes where applicable
- Foreign key constraints
- Appropriate indexing

## Core Tables

### Authentication & Tenancy

```sql
-- Organizations/Tenants
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  tier VARCHAR DEFAULT 'free',
  status VARCHAR DEFAULT 'active',
  subscription_status VARCHAR,
  stripe_customer_id VARCHAR,
  settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  phone VARCHAR,
  user_type VARCHAR ('candidate', 'employer', 'recruiter', 'admin'),
  status VARCHAR DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Roles & Permissions
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR,
  action VARCHAR,
  created_at TIMESTAMP
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  organization_id UUID REFERENCES organizations(id),
  PRIMARY KEY (user_id, role_id, organization_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  refresh_token_hash VARCHAR UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Candidate Profiles

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id) UNIQUE,
  resume_url VARCHAR,
  summary TEXT,
  location_city VARCHAR,
  location_state VARCHAR,
  location_country VARCHAR,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  available_from DATE,
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  highest_education VARCHAR,
  employment_status VARCHAR,
  work_preferences JSONB,
  salary_expectations JSONB,
  skills JSONB,
  certifications JSONB,
  languages JSONB,
  preferences JSONB,
  profile_completion_percentage INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(organization_id, user_id)
);

CREATE TABLE candidate_embeddings (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  embedding VECTOR(1536),
  model_version VARCHAR,
  created_at TIMESTAMP,
  
  UNIQUE(candidate_id, model_version)
);

CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  skill_name VARCHAR NOT NULL,
  proficiency_level VARCHAR ('beginner', 'intermediate', 'advanced', 'expert'),
  years_experience INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  
  UNIQUE(candidate_id, skill_name)
);

CREATE TABLE candidate_experience (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  job_title VARCHAR,
  company_name VARCHAR,
  industry VARCHAR,
  employment_type VARCHAR,
  location VARCHAR,
  start_date DATE,
  end_date DATE,
  currently_working BOOLEAN,
  description TEXT,
  created_at TIMESTAMP
);

CREATE TABLE candidate_education (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  school_name VARCHAR,
  degree VARCHAR,
  field_of_study VARCHAR,
  start_date DATE,
  end_date DATE,
  grade VARCHAR,
  created_at TIMESTAMP
);
```

### Job Postings

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR,
  job_type VARCHAR ('full-time', 'part-time', 'contract', 'temporary', 'gig'),
  employment_type VARCHAR ('permanent', 'temporary', 'contract'),
  status VARCHAR DEFAULT 'open',
  visibility VARCHAR DEFAULT 'public',
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  salary_currency VARCHAR DEFAULT 'USD',
  salary_frequency VARCHAR ('hourly', 'weekly', 'monthly', 'yearly'),
  location_city VARCHAR,
  location_state VARCHAR,
  location_country VARCHAR,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  remote_work VARCHAR ('fully-remote', 'hybrid', 'on-site'),
  required_skills JSONB,
  nice_to_have_skills JSONB,
  required_certifications JSONB,
  years_experience_min INTEGER,
  years_experience_max INTEGER,
  education_requirement VARCHAR,
  language_requirements JSONB,
  shift_type VARCHAR,
  shift_time_start TIME,
  shift_time_end TIME,
  shift_days_of_week VARCHAR[],
  benefits JSONB,
  responsibilities JSONB,
  requirements JSONB,
  hiring_manager_id UUID REFERENCES users(id),
  posting_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closing_date TIMESTAMP,
  filled_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE job_embeddings (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  embedding VECTOR(1536),
  model_version VARCHAR,
  created_at TIMESTAMP,
  
  UNIQUE(job_id, model_version)
);

CREATE TABLE job_skills (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  skill_name VARCHAR NOT NULL,
  proficiency_level VARCHAR,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  
  UNIQUE(job_id, skill_name)
);
```

### Applications & Matching

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id),
  status VARCHAR DEFAULT 'submitted',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  interview_scheduled_at TIMESTAMP,
  rejected_at TIMESTAMP,
  hired_at TIMESTAMP,
  rejection_reason TEXT,
  recruiter_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE matches (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id),
  match_score DECIMAL(5, 4),
  match_percentage INTEGER,
  matching_model_version VARCHAR,
  match_reasons JSONB,
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES jobs(id),
  organization_id UUID REFERENCES organizations(id),
  rank INTEGER,
  score DECIMAL(5, 4),
  model_version VARCHAR,
  personalization_factors JSONB,
  created_at TIMESTAMP,
  
  UNIQUE(candidate_id, job_id)
);

CREATE TABLE match_events (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  event_type VARCHAR ('created', 'viewed', 'clicked', 'applied', 'dismissed'),
  event_timestamp TIMESTAMP,
  created_at TIMESTAMP
);
```

### Shifts & Scheduling

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  job_id UUID REFERENCES jobs(id),
  shift_date DATE NOT NULL,
  shift_time_start TIME NOT NULL,
  shift_time_end TIME NOT NULL,
  break_duration_minutes INTEGER,
  locations JSONB,
  required_candidates INTEGER,
  status VARCHAR DEFAULT 'open',
  filled_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id),
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id),
  status VARCHAR DEFAULT 'assigned',
  assigned_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  no_show BOOLEAN DEFAULT FALSE,
  feedback JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE candidate_availability (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  day_of_week INTEGER,
  available_from TIME,
  available_to TIME,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Compliance & Onboarding

```sql
CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id),
  document_type VARCHAR ('i9', 'w4', 'w9', 'background_check', 'drug_test'),
  document_url VARCHAR,
  status VARCHAR DEFAULT 'pending',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE onboarding_workflows (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES jobs(id),
  organization_id UUID REFERENCES organizations(id),
  status VARCHAR DEFAULT 'initiated',
  current_step VARCHAR,
  completed_steps VARCHAR[],
  initiated_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE onboarding_steps (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES onboarding_workflows(id),
  step_name VARCHAR,
  step_order INTEGER,
  required BOOLEAN DEFAULT TRUE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  certification_name VARCHAR,
  issuing_organization VARCHAR,
  issue_date DATE,
  expiry_date DATE,
  credential_url VARCHAR,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

### Messaging & Notifications

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  participant_1_id UUID REFERENCES users(id),
  participant_2_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  subject VARCHAR,
  context_type VARCHAR ('job_application', 'shift', 'general'),
  context_id UUID,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  content TEXT,
  attachments JSONB,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  notification_type VARCHAR,
  title VARCHAR,
  content TEXT,
  action_url VARCHAR,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  notification_type VARCHAR,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Timekeeping & Payroll

```sql
CREATE TABLE timesheets (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id),
  shift_assignment_id UUID REFERENCES shift_assignments(id),
  clock_in_time TIMESTAMP,
  clock_out_time TIMESTAMP,
  break_minutes INTEGER,
  total_hours DECIMAL(5, 2),
  status VARCHAR DEFAULT 'open',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE payroll_records (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id),
  payroll_period_start DATE,
  payroll_period_end DATE,
  gross_pay DECIMAL(10, 2),
  deductions JSONB,
  net_pay DECIMAL(10, 2),
  status VARCHAR DEFAULT 'draft',
  processed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE wage_records (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  shift_assignment_id UUID REFERENCES shift_assignments(id),
  wage_amount DECIMAL(10, 2),
  wage_type VARCHAR ('hourly', 'fixed'),
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Analytics & Events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  event_type VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  user_id UUID REFERENCES users(id),
  data JSONB,
  created_at TIMESTAMP
);

CREATE TABLE metrics (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  metric_name VARCHAR,
  metric_value DECIMAL(20, 4),
  dimensions JSONB,
  created_at TIMESTAMP
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR,
  resource_type VARCHAR,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

## Indexing Strategy

```sql
-- Performance indexes
CREATE INDEX idx_jobs_organization_status ON jobs(organization_id, status);
CREATE INDEX idx_candidates_organization ON candidates(organization_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_matches_job_score ON matches(job_id, match_score DESC);
CREATE INDEX idx_matches_candidate ON matches(candidate_id);
CREATE INDEX idx_shifts_date ON shifts(shift_date);
CREATE INDEX idx_shift_assignments_shift ON shift_assignments(shift_id);
CREATE INDEX idx_timesheets_candidate ON timesheets(candidate_id);
CREATE INDEX idx_conversations_user ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_events_timestamp ON events(created_at);
CREATE INDEX idx_events_org_type ON events(organization_id, event_type);

-- Full-text search indexes
CREATE INDEX idx_jobs_title_search ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX idx_jobs_description_search ON jobs USING gin(to_tsvector('english', description));

-- UUID indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_shift_assignments_status ON shift_assignments(status);
```

## Migrations

Migrations are versioned in `services/api/src/database/migrations/` using TypeORM.

## Constraints

- Tenant isolation: All queries filter by `organization_id`
- Soft deletes: Always check `deleted_at IS NULL`
- Foreign key constraints: Referential integrity enforced
- Unique constraints: Business logic uniqueness

## Performance Considerations

- Connection pooling (PgBouncer)
- Read replicas for analytics queries
- Partitioning (by date for events)
- Materialized views for complex queries
- Caching layer (Redis) for frequent queries

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  tier VARCHAR DEFAULT 'free',
  status VARCHAR DEFAULT 'active',
  subscription_status VARCHAR,
  stripe_customer_id VARCHAR,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  phone VARCHAR,
  user_type VARCHAR CHECK (user_type IN ('candidate', 'employer', 'recruiter', 'admin')),
  status VARCHAR DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  permission_type VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, name)
);

-- Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User Roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id, organization_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  resource_id UUID,
  old_values TEXT,
  new_values TEXT,
  status VARCHAR DEFAULT 'success',
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  resume_url VARCHAR,
  summary TEXT,
  location_city VARCHAR,
  location_state VARCHAR,
  location_country VARCHAR,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  available_from DATE,
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  highest_education VARCHAR,
  employment_status VARCHAR,
  work_preferences JSONB DEFAULT '{}',
  salary_expectations JSONB DEFAULT '{}',
  skills JSONB DEFAULT '{}',
  certifications JSONB DEFAULT '{}',
  languages JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  profile_completion_percentage INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR,
  job_type VARCHAR CHECK (job_type IN ('full-time', 'part-time', 'contract', 'temporary', 'gig')),
  employment_type VARCHAR CHECK (employment_type IN ('permanent', 'temporary', 'contract')),
  status VARCHAR DEFAULT 'open',
  visibility VARCHAR DEFAULT 'public',
  salary_min NUMERIC(10, 2),
  salary_max NUMERIC(10, 2),
  salary_currency VARCHAR DEFAULT 'USD',
  salary_frequency VARCHAR,
  location_city VARCHAR,
  location_state VARCHAR,
  location_country VARCHAR,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  remote_work VARCHAR,
  required_skills JSONB DEFAULT '{}',
  nice_to_have_skills JSONB DEFAULT '{}',
  required_certifications JSONB DEFAULT '{}',
  years_experience_min INTEGER,
  years_experience_max INTEGER,
  education_requirement VARCHAR,
  language_requirements JSONB DEFAULT '{}',
  shift_type VARCHAR,
  shift_time_start TIME,
  shift_time_end TIME,
  shift_days_of_week TEXT[],
  benefits JSONB DEFAULT '{}',
  responsibilities JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  hiring_manager_id UUID,
  posting_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closing_date TIMESTAMP,
  filled_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR DEFAULT 'submitted',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  interview_scheduled_at TIMESTAMP,
  rejected_at TIMESTAMP,
  hired_at TIMESTAMP,
  rejection_reason TEXT,
  recruiter_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, candidate_id)
);

-- Shifts
CREATE TABLE shifts (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  job_id UUID REFERENCES jobs(id),
  shift_date DATE NOT NULL,
  shift_time_start TIME NOT NULL,
  shift_time_end TIME NOT NULL,
  break_duration_minutes INTEGER,
  locations JSONB DEFAULT '{}',
  required_candidates INTEGER NOT NULL,
  status VARCHAR DEFAULT 'open',
  filled_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_organization ON candidates(organization_id);
CREATE INDEX idx_jobs_organization_status ON jobs(organization_id, status);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_shifts_organization_date ON shifts(organization_id, shift_date);
CREATE INDEX idx_roles_organization ON roles(organization_id);
CREATE INDEX idx_user_roles_user_org ON user_roles(user_id, organization_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id, created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, action);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_sessions_user ON sessions(user_id);

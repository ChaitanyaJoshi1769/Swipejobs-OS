variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "swipejobs"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# EKS
variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.27"
}

variable "node_group_config" {
  description = "EKS node group configuration"
  type = object({
    desired_size    = number
    min_size        = number
    max_size        = number
    instance_types  = list(string)
  })
  default = {
    desired_size   = 3
    min_size       = 1
    max_size       = 10
    instance_types = ["t3.medium"]
  }
}

# RDS PostgreSQL
variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.3"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "swipejobs_os"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "swipejobs"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# Redis
variable "redis_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_nodes" {
  description = "Number of Redis nodes"
  type        = number
  default     = 1
}

variable "redis_parameter_group" {
  description = "Redis parameter group name"
  type        = string
  default     = "default.redis7"
}

# Kafka
variable "kafka_version" {
  description = "Apache Kafka version"
  type        = string
  default     = "3.5.0"
}

variable "kafka_broker_nodes" {
  description = "Number of Kafka brokers"
  type        = number
  default     = 3
}

variable "kafka_broker_config" {
  description = "Kafka broker node configuration"
  type = object({
    az_distribution = string
    client_subnets   = list(string)
    instance_type    = string
    storage_info = object({
      ebs_storage_info = object({
        volume_size = number
      })
    })
  })
  default = {
    az_distribution = "DEFAULT"
    client_subnets  = []
    instance_type   = "kafka.m5.large"
    storage_info = {
      ebs_storage_info = {
        volume_size = 100
      }
    }
  }
}

variable "aws_region" { type = string default = "us-east-1" }
variable "project_name" { type = string default = "sistema-certificado" }
variable "repo_url" { type = string }
variable "ec2_instance_type" { type = string default = "t3.small" }
variable "api_port" { type = number default = 3000 }
variable "assertiva_port" { type = number default = 3001 }
variable "safeweb_port" { type = number default = 3003 }
variable "dotenv" { type = string description = "Entire .env content" }


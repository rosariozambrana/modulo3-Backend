variable "aws_region" {
  description = "Región de AWS donde se desplegará la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Nombre base de la aplicación (usado para nombrar recursos en AWS)"
  type        = string
  default     = "modulo3"
}

variable "environment" {
  description = "Entorno de despliegue: development, staging o production"
  type        = string
  default     = "production"
}

# ── Base de datos ──────────────────────────────────────────────
variable "db_name" {
  description = "Nombre de la base de datos PostgreSQL"
  type        = string
  default     = "pedidos"
}

variable "db_username" {
  description = "Usuario administrador de la base de datos"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Contraseña de la base de datos (se pasa como variable secreta en GitHub Actions)"
  type        = string
  sensitive   = true  # Terraform no la mostrará en los logs
}

variable "db_instance_class" {
  description = "Tipo de instancia RDS (db.t3.micro es la más económica)"
  type        = string
  default     = "db.t3.micro"
}

# ── Elastic Beanstalk ──────────────────────────────────────────
variable "eb_instance_type" {
  description = "Tipo de instancia EC2 para Elastic Beanstalk (t3.micro está en capa gratuita)"
  type        = string
  default     = "t3.micro"
}

variable "backend_image" {
  description = "Imagen Docker del backend (ej: ghcr.io/usuario/modulo3-backend:latest)"
  type        = string
}

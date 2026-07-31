# ── Outputs: información que Terraform muestra al terminar ──────
# Estos valores aparecen en pantalla después del terraform apply

output "backend_url" {
  description = "URL pública del backend (Elastic Beanstalk)"
  value       = "http://${aws_elastic_beanstalk_environment.backend.cname}"
}

output "rds_endpoint" {
  description = "Endpoint de conexión a la base de datos RDS"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "Puerto de la base de datos"
  value       = aws_db_instance.postgres.port
}

output "database_url" {
  description = "Connection string completa para conectarse a la BD"
  value       = "postgresql://${var.db_username}:***@${aws_db_instance.postgres.address}:5432/${var.db_name}?schema=public"
  # La contraseña se oculta con *** por seguridad
}

output "vpc_id" {
  description = "ID de la VPC creada"
  value       = aws_vpc.main.id
}

output "eb_environment_name" {
  description = "Nombre del ambiente Elastic Beanstalk (usado por el CD pipeline)"
  value       = aws_elastic_beanstalk_environment.backend.name
}

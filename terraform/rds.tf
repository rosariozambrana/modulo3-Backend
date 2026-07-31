# ── Subnet Group para RDS ──────────────────────────────────────
# Le dice a RDS en qué subnets (privadas) puede vivir
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "${var.app_name}-db-subnet-group"
  }
}

# ── Instancia RDS PostgreSQL ───────────────────────────────────
# Este es el servidor de base de datos en la nube
resource "aws_db_instance" "postgres" {
  identifier = "${var.app_name}-postgres"

  # Motor de base de datos
  engine         = "postgres"
  engine_version = "15"
  instance_class = var.db_instance_class  # db.t3.micro = la más económica

  # Almacenamiento
  allocated_storage     = 20    # 20 GB de disco
  max_allocated_storage = 100   # Puede crecer hasta 100 GB automáticamente
  storage_type          = "gp2" # SSD de propósito general

  # Credenciales de acceso
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Red y seguridad
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false  # Solo accesible desde dentro de la VPC

  # Configuración de respaldos
  backup_retention_period = 7     # Guarda backups por 7 días
  backup_window           = "03:00-04:00"  # Backup a las 3am UTC
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Para demo/clase: permite borrar sin snapshot final
  skip_final_snapshot       = true
  delete_automated_backups  = true

  tags = {
    Name        = "${var.app_name}-postgres"
    Environment = var.environment
  }
}

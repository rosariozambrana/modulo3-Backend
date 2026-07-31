# ── Elastic Beanstalk Application ─────────────────────────────
# El "contenedor lógico" que agrupa todos los ambientes del backend
resource "aws_elastic_beanstalk_application" "backend" {
  name        = "${var.app_name}-backend"
  description = "Aplicación backend Node.js con Prisma y PostgreSQL"

  tags = {
    Name        = "${var.app_name}-backend"
    Environment = var.environment
  }
}

# ── Elastic Beanstalk Environment ─────────────────────────────
# El ambiente real donde correrá la app (crea instancias EC2, load balancer, etc.)
resource "aws_elastic_beanstalk_environment" "backend" {
  name                = "${var.app_name}-backend-${var.environment}"
  application         = aws_elastic_beanstalk_application.backend.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.13.5 running Docker"  # Plataforma Docker actual

  # ── Configuración de red ──
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.main.id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = "${aws_subnet.public_a.id},${aws_subnet.public_b.id}"
  }

  # ── Configuración de instancias ──
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.eb_instance_type  # t3.micro
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.eb.id
  }

  # ── Rol de servicio ──
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.eb_service_role.arn
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"  # Una sola instancia (para demo/costo bajo)
  }

  # ── Variables de entorno de la app ──
  # Aquí le pasamos las variables que tu backend necesita para funcionar
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = "production"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = "8080"
  }

  # La DATABASE_URL se construye automáticamente con los datos del RDS creado
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.address}:5432/${var.db_name}?schema=public"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "CORS_ORIGIN"
    value     = "*"
  }

  # ── Imagen Docker ──
  # Le decimos a EB qué imagen Docker debe descargar y correr
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DOCKER_IMAGE"
    value     = var.backend_image
  }

  # ── Health check ──
  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = "basic"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application"
    name      = "Application Healthcheck URL"
    value     = "/health"
  }

  tags = {
    Name        = "${var.app_name}-backend-${var.environment}"
    Environment = var.environment
  }

  depends_on = [
    aws_db_instance.postgres,
    aws_iam_instance_profile.eb_instance_profile
  ]
}

# ── Rol de servicio para Elastic Beanstalk ────────────────────
# Este rol permite que el SERVICIO de EB administre recursos AWS en tu nombre
resource "aws_iam_role" "eb_service_role" {
  name = "${var.app_name}-eb-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-eb-service-role"
  }
}

# Políticas que le damos al rol de servicio de EB
resource "aws_iam_role_policy_attachment" "eb_service_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "eb_service_managed_updates" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

# ── Rol de instancia para las máquinas EC2 de EB ──────────────
# Este rol es para las instancias EC2 que EB crea para correr la app
resource "aws_iam_role" "eb_instance_role" {
  name = "${var.app_name}-eb-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-eb-instance-role"
  }
}

# Permisos básicos para que la instancia EC2 funcione con EB
resource "aws_iam_role_policy_attachment" "eb_instance_web_tier" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "eb_instance_docker" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

# Perfil de instancia: vincula el rol con las instancias EC2
resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "${var.app_name}-eb-instance-profile"
  role = aws_iam_role.eb_instance_role.name
}

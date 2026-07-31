# ── VPC Principal ──────────────────────────────────────────────
# La red privada donde vivirán todos los recursos
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"  # Rango de IPs disponibles
  enable_dns_hostnames = true            # Necesario para que RDS tenga nombre DNS
  enable_dns_support   = true

  tags = {
    Name        = "${var.app_name}-vpc"
    Environment = var.environment
  }
}

# ── Internet Gateway ───────────────────────────────────────────
# Puerta de salida a internet para los recursos públicos
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-igw"
  }
}

# ── Subnets Públicas (para Elastic Beanstalk) ──────────────────
# Accesibles desde internet — aquí vivirá la app
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true  # Las instancias EC2 obtienen IP pública

  tags = {
    Name = "${var.app_name}-subnet-public-a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.app_name}-subnet-public-b"
  }
}

# ── Subnets Privadas (para RDS) ────────────────────────────────
# NO accesibles desde internet — solo la app puede conectarse
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.app_name}-subnet-private-a"
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "${var.app_name}-subnet-private-b"
  }
}

# ── Tabla de rutas pública ─────────────────────────────────────
# Le dice a las subnets públicas cómo salir a internet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-rt-public"
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# ── Security Group: Elastic Beanstalk ──────────────────────────
# Firewall para el servidor de la app
# Permite: tráfico HTTP (80) desde internet, y todo el tráfico saliente
resource "aws_security_group" "eb" {
  name        = "${var.app_name}-sg-eb"
  description = "Security group para Elastic Beanstalk"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP desde internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Puerto de la app"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Todo el tráfico saliente permitido"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg-eb"
  }
}

# ── Security Group: RDS ────────────────────────────────────────
# Firewall para la base de datos
# Solo permite conexiones desde el Security Group del EB (no desde internet)
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-sg-rds"
  description = "Security group para RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL solo desde la app EB"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eb.id]  # Solo EB puede conectarse
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg-rds"
  }
}

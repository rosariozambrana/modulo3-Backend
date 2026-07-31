terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # ── Terraform State en S3 ─────────────────────────────────────
  # Guarda el archivo de estado en S3 para que persista entre ejecuciones del pipeline
  # Sin esto, cada pipeline run no sabría qué recursos ya fueron creados
  backend "s3" {
    bucket = "modulo3-terraform-state-019163347491"  # El bucket que creamos en AWS
    key    = "backend/terraform.tfstate"              # Ruta dentro del bucket
    region = "us-east-1"
  }
}

# Proveedor AWS: aquí le decimos a Terraform que trabaje con AWS en us-east-1
provider "aws" {
  region = var.aws_region
}

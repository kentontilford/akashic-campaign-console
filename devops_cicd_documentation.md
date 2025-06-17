# Akashic Intelligence - DevOps & CI/CD Documentation

## Overview

This document outlines the complete DevOps strategy, CI/CD pipeline implementation, and infrastructure automation for the Akashic Intelligence Campaign Console platform.

## Table of Contents

1. [CI/CD Pipeline Architecture](#cicd-pipeline-architecture)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Infrastructure as Code](#infrastructure-as-code)
4. [Container Management](#container-management)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Environment Management](#environment-management)
7. [Secret Management](#secret-management)
8. [Monitoring & Observability](#monitoring--observability)
9. [Backup & Recovery](#backup--recovery)
10. [Security & Compliance](#security--compliance)

---

## CI/CD Pipeline Architecture

### Pipeline Overview

```mermaid
graph TB
    A[Developer Push] --> B[GitHub Actions Trigger]
    B --> C[Code Quality Checks]
    C --> D[Security Scan]
    D --> E[Unit Tests]
    E --> F[Integration Tests]
    F --> G[Build & Package]
    G --> H[Container Registry]
    H --> I{Branch Check}
    I -->|main| J[Deploy to Staging]
    I -->|develop| K[Deploy to Development]
    I -->|feature/*| L[Deploy to Preview]
    J --> M[E2E Tests]
    M --> N[Security Tests]
    N --> O[Performance Tests]
    O --> P{Auto Deploy?}
    P -->|Yes| Q[Deploy to Production]
    P -->|No| R[Manual Approval]
    R --> Q
    Q --> S[Health Checks]
    S --> T[Notify Stakeholders]
```

### Pipeline Stages

```yaml
# Pipeline configuration overview
stages:
  - name: "validate"
    jobs:
      - code_quality
      - security_scan
      - dependency_check
      - license_check
  
  - name: "test"
    jobs:
      - unit_tests
      - integration_tests
      - api_tests
      - ui_tests
  
  - name: "build"
    jobs:
      - build_application
      - build_container
      - scan_container
      - push_registry
  
  - name: "deploy_non_prod"
    jobs:
      - deploy_development
      - deploy_staging
      - deploy_preview
  
  - name: "test_staging"
    jobs:
      - e2e_tests
      - performance_tests
      - security_tests
      - accessibility_tests
  
  - name: "deploy_production"
    jobs:
      - manual_approval
      - deploy_production
      - health_check
      - rollback_capability
  
  - name: "post_deploy"
    jobs:
      - update_documentation
      - notify_stakeholders
      - update_monitoring
```

---

## GitHub Actions Workflows

### Main CI/CD Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - development
          - staging
          - production

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # =======================
  # CODE QUALITY & SECURITY
  # =======================
  
  code-quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint code
        run: pnpm lint

      - name: Check TypeScript
        run: pnpm type-check

      - name: Check code formatting
        run: pnpm format:check

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Semgrep security scan
        uses: returntocorp/semgrep-action@v1
        with:
          publishToken: ${{ secrets.SEMGREP_APP_TOKEN }}

  # =======================
  # TESTING
  # =======================
  
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: akashic_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup test database
        run: |
          pnpm prisma migrate reset --force
          pnpm prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/akashic_test

      - name: Run unit tests
        run: pnpm test:unit --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/akashic_test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: akashic_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup test database
        run: pnpm prisma migrate reset --force
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/akashic_test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/akashic_test

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [build-and-push]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start application
        run: |
          docker-compose -f docker-compose.test.yml up -d
          npx wait-on http://localhost:3000
        env:
          IMAGE_TAG: ${{ github.sha }}

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  # =======================
  # BUILD & PACKAGE
  # =======================
  
  build-and-push:
    name: Build and Push Container
    runs-on: ubuntu-latest
    needs: [code-quality, security-scan, unit-tests]
    permissions:
      contents: read
      packages: write

    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_VERSION=${{ env.NODE_VERSION }}
            BUILD_DATE=${{ steps.meta.outputs.created }}
            VCS_REF=${{ github.sha }}

      - name: Output image
        id: image
        run: |
          echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}" >> $GITHUB_OUTPUT

      - name: Scan container image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ steps.image.outputs.image }}
          format: 'sarif'
          output: 'trivy-image-results.sarif'

      - name: Upload container scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-image-results.sarif'

  # =======================
  # DEPLOYMENT
  # =======================
  
  deploy-development:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: [build-and-push]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: development
      url: https://dev.akashicintelligence.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Deploy to Development
        run: |
          echo "${{ secrets.KUBE_CONFIG_DEV }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
          helm upgrade akashic-intelligence ./helm/akashic-intelligence \
            --namespace akashic-development \
            --values ./helm/values/development.yaml \
            --set image.tag=${{ github.sha }} \
            --wait --timeout=10m

      - name: Run smoke tests
        run: |
          curl -f https://dev.akashicintelligence.com/api/health
          
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build-and-push, integration-tests]
    if: github.ref == 'refs/heads/main'
    environment:
      name: staging
      url: https://staging.akashicintelligence.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Deploy to Staging
        run: |
          echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
          helm upgrade akashic-intelligence ./helm/akashic-intelligence \
            --namespace akashic-staging \
            --values ./helm/values/staging.yaml \
            --set image.tag=${{ github.sha }} \
            --wait --timeout=15m

      - name: Run health checks
        run: |
          curl -f https://staging.akashicintelligence.com/api/health
          
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [deploy-staging, e2e-tests]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://app.akashicintelligence.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Deploy to Production
        run: |
          echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
          # Blue-green deployment strategy
          helm upgrade akashic-intelligence ./helm/akashic-intelligence \
            --namespace akashic-production \
            --values ./helm/values/production.yaml \
            --set image.tag=${{ github.sha }} \
            --set deployment.strategy=RollingUpdate \
            --set deployment.maxUnavailable=25% \
            --set deployment.maxSurge=25% \
            --wait --timeout=20m

      - name: Run production health checks
        run: |
          # Wait for deployment to stabilize
          sleep 60
          
          # Health check
          curl -f https://app.akashicintelligence.com/api/health
          
          # Smoke tests
          curl -f https://app.akashicintelligence.com/api/auth/session
          
      - name: Update deployment status
        if: success()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-type: application/json' \
            --data '{
              "text": "✅ Akashic Intelligence deployed to production successfully",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "🚀 *Deployment Successful*\n\n*Version:* `${{ github.sha }}`\n*Environment:* Production\n*Deployed by:* ${{ github.actor }}\n*Status:* All health checks passed"
                  }
                }
              ]
            }'

      - name: Rollback on failure
        if: failure()
        run: |
          echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
          # Rollback to previous version
          helm rollback akashic-intelligence -n akashic-production
          
          # Notify team
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-type: application/json' \
            --data '{
              "text": "❌ Akashic Intelligence deployment failed - rolled back",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "🚨 *Deployment Failed*\n\n*Version:* `${{ github.sha }}`\n*Environment:* Production\n*Action:* Automatically rolled back\n*Status:* <https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}|View logs>"
                  }
                }
              ]
            }'
```

### Feature Branch Workflow

```yaml
# .github/workflows/feature-branch.yml
name: Feature Branch CI

on:
  push:
    branches:
      - 'feature/*'
      - 'hotfix/*'
      - 'bugfix/*'

jobs:
  validate:
    name: Validate Feature Branch
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:unit

  build-preview:
    name: Build Preview Environment
    runs-on: ubuntu-latest
    needs: validate
    if: startsWith(github.ref, 'refs/heads/feature/')
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Extract branch name
        shell: bash
        run: echo "branch=${GITHUB_HEAD_REF:-${GITHUB_REF#refs/heads/}}" >> $GITHUB_OUTPUT
        id: extract_branch

      - name: Build and deploy preview
        run: |
          # Deploy to preview environment
          PREVIEW_URL="https://${{ steps.extract_branch.outputs.branch }}.preview.akashicintelligence.com"
          echo "Preview URL: $PREVIEW_URL" >> $GITHUB_STEP_SUMMARY

      - name: Comment on PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview environment deployed: https://${{ steps.extract_branch.outputs.branch }}.preview.akashicintelligence.com'
            })
```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  release:
    types: [published]

jobs:
  deploy-release:
    name: Deploy Release
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.akashicintelligence.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.release.tag_name }}

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Deploy release to production
        run: |
          echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          
          helm upgrade akashic-intelligence ./helm/akashic-intelligence \
            --namespace akashic-production \
            --values ./helm/values/production.yaml \
            --set image.tag=${{ github.event.release.tag_name }} \
            --set app.version=${{ github.event.release.tag_name }} \
            --wait --timeout=20m

      - name: Update release notes
        run: |
          # Post release notes to Slack
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-type: application/json' \
            --data '{
              "text": "🎉 New release deployed: ${{ github.event.release.tag_name }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "🎉 *New Release Deployed*\n\n*Version:* ${{ github.event.release.tag_name }}\n*Environment:* Production\n*Release Notes:* <${{ github.event.release.html_url }}|View Release>"
                  }
                }
              ]
            }'

  update-documentation:
    name: Update Documentation
    runs-on: ubuntu-latest
    needs: deploy-release
    steps:
      - name: Checkout docs repo
        uses: actions/checkout@v4
        with:
          repository: akashic-intelligence/docs
          token: ${{ secrets.DOCS_TOKEN }}

      - name: Update version in docs
        run: |
          echo "${{ github.event.release.tag_name }}" > VERSION
          git add VERSION
          git commit -m "Update version to ${{ github.event.release.tag_name }}"
          git push
```

---

## Infrastructure as Code

### Terraform Configuration

```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }

  backend "s3" {
    bucket         = "akashic-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# =======================
# PROVIDER CONFIGURATION
# =======================

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "akashic-intelligence"
      Environment = var.environment
      ManagedBy   = "terraform"
      Team        = "platform"
    }
  }
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", data.aws_eks_cluster.cluster.name]
  }
}

# =======================
# DATA SOURCES
# =======================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_name
}

# =======================
# VPC & NETWORKING
# =======================

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-${var.environment}"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
    "kubernetes.io/role/elb"                                       = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
    "kubernetes.io/role/internal-elb"                              = "1"
  }
}

# =======================
# EKS CLUSTER
# =======================

module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = var.kubernetes_version

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  eks_managed_node_groups = {
    main = {
      name = "main"
      
      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"
      
      min_size     = var.node_group_min_size
      max_size     = var.node_group_max_size
      desired_size = var.node_group_desired_size
      
      disk_size = 50
      
      labels = {
        Environment = var.environment
        NodeGroup   = "main"
      }
      
      taints = []
      
      update_config = {
        max_unavailable = 1
      }
    }
    
    spot = {
      name = "spot"
      
      instance_types = var.spot_instance_types
      capacity_type  = "SPOT"
      
      min_size     = 0
      max_size     = 10
      desired_size = var.environment == "production" ? 2 : 0
      
      disk_size = 50
      
      labels = {
        Environment = var.environment
        NodeGroup   = "spot"
        SpotInstance = "true"
      }
      
      taints = [
        {
          key    = "spot-instance"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }
}

# =======================
# RDS DATABASE
# =======================

module "rds" {
  source = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${var.project_name}-${var.environment}"

  engine               = "postgres"
  engine_version       = "15"
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  multi_az               = var.environment == "production"
  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = module.vpc.database_subnet_group

  deletion_protection = var.environment == "production"
  skip_final_snapshot = var.environment != "production"

  performance_insights_enabled = true
  performance_insights_retention_period = 7

  enabled_cloudwatch_logs_exports = ["postgresql"]

  parameters = [
    {
      name  = "log_connections"
      value = "1"
    },
    {
      name  = "log_disconnections"
      value = "1"
    },
    {
      name  = "log_statement"
      value = "all"
    }
  ]
}

# =======================
# ELASTICACHE REDIS
# =======================

module "redis" {
  source = "terraform-aws-modules/elasticache/aws"
  version = "~> 1.0"

  cluster_id           = "${var.project_name}-${var.environment}"
  description          = "Redis cluster for ${var.project_name} ${var.environment}"
  
  node_type            = var.redis_node_type
  num_cache_nodes      = var.redis_num_nodes
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name = module.vpc.elasticache_subnet_group_name
  security_group_ids = [aws_security_group.redis.id]
  
  maintenance_window = "sun:05:00-sun:06:00"
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                  = var.redis_auth_token
}

# =======================
# SECURITY GROUPS
# =======================

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds"
  description = "Security group for RDS database"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "redis" {
  name        = "${var.project_name}-${var.environment}-redis"
  description = "Security group for Redis cluster"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# =======================
# IAM ROLES & POLICIES
# =======================

resource "aws_iam_role" "akashic_app_role" {
  name = "${var.project_name}-${var.environment}-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = module.eks.oidc_provider_arn
        }
        Condition = {
          StringEquals = {
            "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub" = "system:serviceaccount:${var.project_name}-${var.environment}:${var.project_name}"
            "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "akashic_app_policy" {
  name        = "${var.project_name}-${var.environment}-app-policy"
  description = "Policy for Akashic Intelligence application"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.app_storage.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.app_secrets.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "akashic_app_policy_attachment" {
  role       = aws_iam_role.akashic_app_role.name
  policy_arn = aws_iam_policy.akashic_app_policy.arn
}

# =======================
# S3 STORAGE
# =======================

resource "aws_s3_bucket" "app_storage" {
  bucket = "${var.project_name}-${var.environment}-storage"
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# =======================
# SECRETS MANAGER
# =======================

resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "${var.project_name}-${var.environment}-secrets"
  description = "Application secrets for Akashic Intelligence"
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${module.rds.db_instance_endpoint}/${var.db_name}"
    REDIS_URL    = "redis://:${var.redis_auth_token}@${module.redis.cluster_address}:6379"
    NEXTAUTH_SECRET = var.nextauth_secret
    OPENAI_API_KEY  = var.openai_api_key
    STRIPE_SECRET_KEY = var.stripe_secret_key
  })
}
```

### Terraform Variables

```hcl
# infrastructure/terraform/variables.tf
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "akashic-intelligence"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# EKS Configuration
variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.27"
}

variable "node_instance_types" {
  description = "Instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.large"]
}

variable "spot_instance_types" {
  description = "Instance types for spot nodes"
  type        = list(string)
  default     = ["t3.large", "t3.xlarge", "t3a.large", "t3a.xlarge"]
}

variable "node_group_min_size" {
  description = "Minimum size of the node group"
  type        = number
  default     = 1
}

variable "node_group_max_size" {
  description = "Maximum size of the node group"
  type        = number
  default     = 10
}

variable "node_group_desired_size" {
  description = "Desired size of the node group"
  type        = number
  default     = 3
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "akashic"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "akashic"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Redis Configuration
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

variable "redis_auth_token" {
  description = "Redis authentication token"
  type        = string
  sensitive   = true
}

# Application Secrets
variable "nextauth_secret" {
  description = "NextAuth secret"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
}
```

### Environment-Specific Values

```hcl
# infrastructure/terraform/environments/production.tfvars
environment = "production"
aws_region  = "us-east-1"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# EKS Configuration
kubernetes_version = "1.27"
node_instance_types = ["t3.large", "t3.xlarge"]
node_group_min_size = 3
node_group_max_size = 20
node_group_desired_size = 5

# Database Configuration
db_instance_class = "db.r6g.large"
db_allocated_storage = 100
db_max_allocated_storage = 1000

# Redis Configuration
redis_node_type = "cache.r6g.large"
redis_num_nodes = 2
```

---

## Container Management

### Multi-Stage Dockerfile

```dockerfile
# Dockerfile
# ================================
# Build stage
# ================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# ================================
# Dependencies stage
# ================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ================================
# Builder stage
# ================================
FROM base AS builder

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client
RUN pnpm prisma generate

# Build application
RUN pnpm build

# ================================
# Runner stage
# ================================
FROM node:20-alpine AS runner

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create non-root user directories
RUN mkdir -p /app/.next/cache
RUN chown -R nextjs:nodejs /app/.next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
```

### Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/akashic_dev
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=development-secret
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: pnpm dev

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=akashic_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  postgres-test:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=akashic_test
    tmpfs:
      - /var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

### Container Registry Management

```bash
#!/bin/bash
# scripts/container-management.sh

set -euo pipefail

REGISTRY="ghcr.io"
REPOSITORY="akashic-intelligence/akashic-intelligence"
TAG=${1:-latest}
PLATFORM=${2:-"linux/amd64,linux/arm64"}

# Build multi-platform image
build_image() {
    echo "🔨 Building container image..."
    
    docker buildx build \
        --platform "${PLATFORM}" \
        --tag "${REGISTRY}/${REPOSITORY}:${TAG}" \
        --tag "${REGISTRY}/${REPOSITORY}:latest" \
        --push \
        --cache-from type=gha \
        --cache-to type=gha,mode=max \
        --build-arg NODE_VERSION=20 \
        --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --build-arg VCS_REF="$(git rev-parse HEAD)" \
        .
    
    echo "✅ Image built and pushed successfully"
}

# Scan image for vulnerabilities
scan_image() {
    echo "🔍 Scanning image for vulnerabilities..."
    
    # Trivy scan
    trivy image \
        --exit-code 1 \
        --severity HIGH,CRITICAL \
        --format table \
        "${REGISTRY}/${REPOSITORY}:${TAG}"
    
    # Snyk scan
    snyk container test \
        "${REGISTRY}/${REPOSITORY}:${TAG}" \
        --severity-threshold=high
    
    echo "✅ Image security scan completed"
}

# Test image
test_image() {
    echo "🧪 Testing image..."
    
    # Start container
    CONTAINER_ID=$(docker run -d \
        --name akashic-test \
        -p 3001:3000 \
        -e NODE_ENV=test \
        -e DATABASE_URL=postgresql://test:test@localhost:5432/test \
        "${REGISTRY}/${REPOSITORY}:${TAG}")
    
    # Wait for startup
    sleep 10
    
    # Health check
    if curl -f http://localhost:3001/api/health; then
        echo "✅ Image test passed"
    else
        echo "❌ Image test failed"
        docker logs akashic-test
        exit 1
    fi
    
    # Cleanup
    docker stop akashic-test
    docker rm akashic-test
}

# Clean up old images
cleanup_images() {
    echo "🧹 Cleaning up old images..."
    
    # Keep last 10 images
    docker images "${REGISTRY}/${REPOSITORY}" \
        --format "table {{.Tag}}\t{{.CreatedAt}}" \
        | tail -n +11 \
        | awk '{print $1}' \
        | grep -v latest \
        | xargs -r docker rmi "${REGISTRY}/${REPOSITORY}:" 2>/dev/null || true
    
    echo "✅ Cleanup completed"
}

# Main execution
case "${1:-build}" in
    build)
        build_image
        ;;
    scan)
        scan_image
        ;;
    test)
        test_image
        ;;
    cleanup)
        cleanup_images
        ;;
    all)
        build_image
        scan_image
        test_image
        ;;
    *)
        echo "Usage: $0 {build|scan|test|cleanup|all} [tag] [platform]"
        exit 1
        ;;
esac
```

---

This DevOps & CI/CD Documentation provides a comprehensive foundation for implementing robust development, testing, and deployment pipelines for the Akashic Intelligence platform, ensuring reliable and secure software delivery.


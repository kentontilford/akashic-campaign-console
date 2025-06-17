# Akashic Intelligence - Troubleshooting & Operations Guide

## Overview

This comprehensive guide provides troubleshooting procedures, operational runbooks, and diagnostic tools for maintaining the Akashic Intelligence Campaign Console platform in production environments.

## Table of Contents

1. [Quick Diagnosis Framework](#quick-diagnosis-framework)
2. [Application Troubleshooting](#application-troubleshooting)
3. [Database Issues](#database-issues)
4. [Performance Problems](#performance-problems)
5. [AI Service Issues](#ai-service-issues)
6. [Infrastructure Problems](#infrastructure-problems)
7. [Security Incidents](#security-incidents)
8. [Deployment Issues](#deployment-issues)
9. [Monitoring & Alerting](#monitoring--alerting)
10. [Emergency Procedures](#emergency-procedures)

---

## Quick Diagnosis Framework

### Incident Response Checklist

```markdown
## 🚨 Incident Response Quick Start

### Step 1: Initial Assessment (< 5 minutes)
- [ ] Check #alerts channel for active alerts
- [ ] Review Grafana dashboard for anomalies
- [ ] Verify system status page
- [ ] Assess impact scope (users affected, features down)
- [ ] Determine severity level

### Step 2: Communication (< 10 minutes)
- [ ] Notify incident channel
- [ ] Create incident ticket
- [ ] Update status page if needed
- [ ] Assign incident commander

### Step 3: Investigation (ongoing)
- [ ] Gather logs and metrics
- [ ] Check recent deployments
- [ ] Review infrastructure changes
- [ ] Identify root cause

### Step 4: Resolution
- [ ] Implement fix or workaround
- [ ] Verify system recovery
- [ ] Monitor for stability
- [ ] Update stakeholders

### Step 5: Post-Incident
- [ ] Document findings
- [ ] Schedule postmortem
- [ ] Implement preventive measures
```

### Diagnostic Commands

```bash
#!/bin/bash
# quick-diagnosis.sh - Run this script for immediate system overview

echo "=== AKASHIC INTELLIGENCE SYSTEM HEALTH CHECK ==="

# Kubernetes cluster status
echo "1. Cluster Status:"
kubectl get nodes
kubectl get pods -n akashic-production --field-selector=status.phase!=Running

# Application health
echo "2. Application Health:"
kubectl get deployment -n akashic-production
kubectl top pods -n akashic-production

# Database connectivity
echo "3. Database Status:"
kubectl exec -n akashic-production deployment/akashic-intelligence -- \
  npx prisma db execute --preview-feature --stdin <<< "SELECT 1"

# Recent errors
echo "4. Recent Errors (last 5 minutes):"
kubectl logs -n akashic-production deployment/akashic-intelligence \
  --since=5m | grep -i error | tail -20

# External service health
echo "5. External Services:"
curl -s https://api.openai.com/v1/models | jq '.data | length'
curl -s -o /dev/null -w "%{http_code}" https://api.stripe.com/v1/charges

echo "=== HEALTH CHECK COMPLETE ==="
```

### System Status Dashboard

```typescript
// lib/monitoring/system-status.ts
export interface SystemStatus {
  overall: 'operational' | 'degraded' | 'outage'
  components: ComponentStatus[]
  activeIncidents: Incident[]
  uptime: UptimeMetrics
}

export class SystemStatusChecker {
  async getSystemStatus(): Promise<SystemStatus> {
    const components = await this.checkAllComponents()
    const activeIncidents = await this.getActiveIncidents()
    
    return {
      overall: this.calculateOverallStatus(components),
      components,
      activeIncidents,
      uptime: await this.getUptimeMetrics()
    }
  }

  private async checkAllComponents(): Promise<ComponentStatus[]> {
    return await Promise.all([
      this.checkWebApplication(),
      this.checkDatabase(),
      this.checkRedis(),
      this.checkAIServices(),
      this.checkEmailService(),
      this.checkPaymentProcessing()
    ])
  }

  private async checkWebApplication(): Promise<ComponentStatus> {
    try {
      const response = await fetch('/api/health', { timeout: 5000 })
      return {
        name: 'Web Application',
        status: response.ok ? 'operational' : 'degraded',
        responseTime: response.headers.get('x-response-time'),
        lastChecked: new Date()
      }
    } catch (error) {
      return {
        name: 'Web Application',
        status: 'outage',
        error: error.message,
        lastChecked: new Date()
      }
    }
  }

  private async checkDatabase(): Promise<ComponentStatus> {
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - start

      return {
        name: 'Database',
        status: responseTime < 100 ? 'operational' : 'degraded',
        responseTime: `${responseTime}ms`,
        lastChecked: new Date()
      }
    } catch (error) {
      return {
        name: 'Database',
        status: 'outage',
        error: error.message,
        lastChecked: new Date()
      }
    }
  }
}
```

---

## Application Troubleshooting

### Common Application Issues

#### 1. Application Not Starting

**Symptoms:**
- Pod in CrashLoopBackOff state
- Health check failures
- Application logs show startup errors

**Diagnostic Steps:**

```bash
# Check pod status
kubectl get pods -n akashic-production -l app=akashic-intelligence

# View pod events
kubectl describe pod <pod-name> -n akashic-production

# Check application logs
kubectl logs <pod-name> -n akashic-production --previous

# Check init container logs (database migrations)
kubectl logs <pod-name> -c migrate-database -n akashic-production
```

**Common Causes & Solutions:**

```typescript
// Common startup issues and solutions
const startupTroubleshooting = {
  databaseConnectionFailed: {
    symptoms: ['ECONNREFUSED', 'connection timeout', 'authentication failed'],
    solutions: [
      'Verify DATABASE_URL environment variable',
      'Check database server status',
      'Verify network connectivity',
      'Check database credentials',
      'Ensure database accepts connections from cluster'
    ],
    commands: [
      'kubectl exec -it <pod> -- pg_isready -h $DB_HOST -p $DB_PORT',
      'kubectl get secret akashic-secrets -o yaml | base64 -d'
    ]
  },

  migrationFailure: {
    symptoms: ['Migration failed', 'Table already exists', 'Column not found'],
    solutions: [
      'Check migration files for syntax errors',
      'Verify database schema state',
      'Run migrations manually if needed',
      'Reset migration state if corrupted'
    ],
    commands: [
      'kubectl exec -it <pod> -- npx prisma migrate status',
      'kubectl exec -it <pod> -- npx prisma migrate resolve --applied <migration>',
      'kubectl exec -it <pod> -- npx prisma migrate reset'
    ]
  },

  missingEnvironmentVariables: {
    symptoms: ['Environment variable not found', 'Configuration error'],
    solutions: [
      'Check ConfigMap and Secret definitions',
      'Verify environment variable names',
      'Ensure secrets are properly mounted'
    ],
    commands: [
      'kubectl get configmap akashic-config -o yaml',
      'kubectl describe pod <pod> | grep -A 20 Environment'
    ]
  }
}
```

#### 2. High Memory Usage

**Symptoms:**
- Pods being OOMKilled
- Memory usage consistently above 80%
- Slow response times

**Investigation:**

```bash
# Check memory usage
kubectl top pods -n akashic-production

# Check memory limits
kubectl describe pod <pod-name> -n akashic-production | grep -A 10 Limits

# Generate heap dump (if Node.js debugging enabled)
kubectl exec -it <pod-name> -- kill -USR2 1

# Check for memory leaks
kubectl exec -it <pod-name> -- node --inspect=0.0.0.0:9229 index.js
```

**Solutions:**

```typescript
// Memory optimization strategies
const memoryOptimization = {
  increaseMemoryLimits: {
    description: 'Temporary fix - increase pod memory limits',
    implementation: `
      resources:
        limits:
          memory: 4Gi  # Increased from 2Gi
        requests:
          memory: 2Gi  # Increased from 1Gi
    `
  },

  identifyMemoryLeaks: {
    description: 'Find and fix memory leaks in application code',
    tools: ['clinic.js', 'node --inspect', 'heap snapshots'],
    investigation: [
      'Take heap snapshots over time',
      'Compare memory usage patterns',
      'Identify objects not being garbage collected',
      'Review event listeners and timers'
    ]
  },

  optimizeDatabase: {
    description: 'Optimize database connection pooling',
    solutions: [
      'Reduce database connection pool size',
      'Implement connection lifecycle management',
      'Use read replicas for heavy queries',
      'Add query result caching'
    ]
  }
}
```

#### 3. Slow Response Times

**Symptoms:**
- API responses taking > 2 seconds
- User complaints about slowness
- High P95 response times in metrics

**Performance Analysis:**

```bash
# Check response time metrics
kubectl exec -it <pod-name> -- curl -s localhost:3000/api/metrics | grep http_request_duration

# Check database query performance
kubectl exec -it postgres-pod -- psql -c "
  SELECT query, calls, total_time, mean_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;"

# Check Redis performance
kubectl exec -it redis-pod -- redis-cli --latency-history

# Profile application (if enabled)
kubectl port-forward <pod-name> 9229:9229
# Connect Chrome DevTools to localhost:9229
```

**Performance Optimization:**

```typescript
// Performance optimization checklist
const performanceOptimization = {
  databaseOptimization: {
    queries: [
      'Add indexes for frequently queried columns',
      'Optimize N+1 query patterns',
      'Use database query explain plans',
      'Implement query result caching'
    ],
    code: `
      // Example: Add database indexes
      CREATE INDEX CONCURRENTLY idx_messages_campaign_created 
      ON messages(campaign_id, created_at DESC);
      
      // Example: Optimize Prisma queries
      const messages = await prisma.message.findMany({
        where: { campaignId },
        include: { 
          createdBy: { select: { name: true, email: true } }
        },
        take: 50,
        orderBy: { createdAt: 'desc' }
      })
    `
  },

  caching: {
    strategies: [
      'Implement Redis caching for frequently accessed data',
      'Add HTTP response caching headers',
      'Use CDN for static assets',
      'Cache AI generation results'
    ],
    implementation: `
      // Example: Redis caching
      const cacheKey = \`campaign:\${campaignId}:messages\`
      let messages = await redis.get(cacheKey)
      
      if (!messages) {
        messages = await database.getMessages(campaignId)
        await redis.setex(cacheKey, 300, JSON.stringify(messages))
      }
    `
  },

  applicationOptimization: {
    techniques: [
      'Implement proper error handling to prevent cascading failures',
      'Add request timeout limits',
      'Use async/await properly to avoid blocking',
      'Optimize React rendering with memoization'
    ]
  }
}
```

---

## Database Issues

### Database Connection Problems

```bash
# Database troubleshooting commands

# Check database pod status
kubectl get pods -n akashic-production -l app=postgresql

# Check database connectivity from application
kubectl exec -it deployment/akashic-intelligence -n akashic-production -- \
  pg_isready -h postgres-service -p 5432

# Check database logs
kubectl logs -n akashic-production -l app=postgresql --tail=100

# Check current database connections
kubectl exec -it postgres-pod -n akashic-production -- psql -c "
  SELECT pid, usename, application_name, client_addr, state, query 
  FROM pg_stat_activity 
  WHERE state != 'idle';"

# Check database performance metrics
kubectl exec -it postgres-pod -n akashic-production -- psql -c "
  SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch
  FROM pg_stat_user_tables 
  ORDER BY seq_scan DESC;"
```

### Database Performance Issues

```sql
-- Database performance queries

-- Find slow queries
SELECT query, calls, total_time, mean_time, stddev_time
FROM pg_stat_statements 
WHERE mean_time > 1000  -- queries taking more than 1 second
ORDER BY mean_time DESC 
LIMIT 20;

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;

-- Check database locks
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Check table bloat
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
  pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

### Database Backup & Recovery

```bash
# Create manual backup
kubectl exec -it postgres-pod -n akashic-production -- pg_dump \
  -h localhost -U akashic -d akashic_production \
  --format=custom --verbose --file=/tmp/manual_backup.dump

# Copy backup from pod
kubectl cp akashic-production/postgres-pod:/tmp/manual_backup.dump ./manual_backup.dump

# Restore from backup (CAUTION: This will overwrite data)
kubectl exec -i postgres-pod -n akashic-production -- pg_restore \
  -h localhost -U akashic -d akashic_production \
  --clean --verbose /tmp/backup.dump

# Point-in-time recovery (AWS RDS)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier akashic-production \
  --target-db-instance-identifier akashic-recovery \
  --restore-time 2024-01-15T10:30:00.000Z
```

---

## Performance Problems

### Load Testing & Analysis

```typescript
// lib/performance/load-testing.ts
export class LoadTestRunner {
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResults> {
    const scenarios = [
      this.loginScenario(),
      this.messageGenerationScenario(),
      this.dashboardScenario(),
      this.dataImportScenario()
    ]

    const results = await Promise.all(
      scenarios.map(scenario => this.runScenario(scenario, config))
    )

    return this.aggregateResults(results)
  }

  private async messageGenerationScenario(): Promise<LoadTestScenario> {
    return {
      name: 'Message Generation',
      duration: '5m',
      virtualUsers: 50,
      rampUp: '2m',
      thresholds: {
        http_req_duration: ['p(95)<5000'], // 95% under 5 seconds
        http_req_failed: ['rate<0.1'],      // Less than 10% failures
        ai_generation_rate: ['rate>10']     // At least 10 generations/sec
      },
      script: `
        export default function() {
          const response = http.post('/api/messages/generate', {
            type: 'social_media_post',
            audience: 'general_public',
            intent: 'Promote healthcare policy'
          }, {
            headers: { 'Authorization': 'Bearer ' + __ENV.TEST_TOKEN }
          })
          
          check(response, {
            'generation successful': (r) => r.status === 200,
            'response time acceptable': (r) => r.timings.duration < 10000
          })
          
          sleep(randomIntBetween(1, 5))
        }
      `
    }
  }

  async analyzePerformanceMetrics(): Promise<PerformanceReport> {
    const [
      responseTimeMetrics,
      throughputMetrics,
      errorMetrics,
      resourceMetrics
    ] = await Promise.all([
      this.getResponseTimeMetrics(),
      this.getThroughputMetrics(),
      this.getErrorMetrics(),
      this.getResourceMetrics()
    ])

    return {
      summary: this.generatePerformanceSummary({
        responseTimeMetrics,
        throughputMetrics,
        errorMetrics,
        resourceMetrics
      }),
      recommendations: this.generateRecommendations({
        responseTimeMetrics,
        throughputMetrics,
        errorMetrics,
        resourceMetrics
      }),
      detailedMetrics: {
        responseTimeMetrics,
        throughputMetrics,
        errorMetrics,
        resourceMetrics
      }
    }
  }
}
```

### Resource Optimization

```yaml
# Resource optimization strategies

# Horizontal Pod Autoscaler optimization
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: akashic-hpa-optimized
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: akashic-intelligence
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60  # Reduced from 70% for better headroom
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: ai_requests_per_second
      target:
        type: AverageValue
        averageValue: "5"  # Scale when AI requests > 5/sec per pod
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 20
        periodSeconds: 60
---
# Vertical Pod Autoscaler for right-sizing
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: akashic-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: akashic-intelligence
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: akashic-intelligence
      maxAllowed:
        cpu: 2000m
        memory: 4Gi
      minAllowed:
        cpu: 100m
        memory: 512Mi
```

---

## AI Service Issues

### OpenAI API Problems

```typescript
// lib/ai/troubleshooting.ts
export class AIServiceTroubleshooter {
  async diagnoseAIIssues(): Promise<AIHealthReport> {
    const [
      apiConnectivity,
      rateLimitStatus,
      modelAvailability,
      responseQuality
    ] = await Promise.all([
      this.checkAPIConnectivity(),
      this.checkRateLimits(),
      this.checkModelAvailability(),
      this.checkResponseQuality()
    ])

    return {
      overall: this.calculateOverallAIHealth([
        apiConnectivity,
        rateLimitStatus,
        modelAvailability,
        responseQuality
      ]),
      apiConnectivity,
      rateLimitStatus,
      modelAvailability,
      responseQuality,
      recommendations: this.generateAIRecommendations({
        apiConnectivity,
        rateLimitStatus,
        modelAvailability,
        responseQuality
      })
    }
  }

  private async checkAPIConnectivity(): Promise<ConnectivityStatus> {
    try {
      const start = Date.now()
      const response = await openai.models.list()
      const latency = Date.now() - start

      return {
        status: 'healthy',
        latency,
        modelsAvailable: response.data.length,
        lastChecked: new Date()
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        lastChecked: new Date()
      }
    }
  }

  private async checkRateLimits(): Promise<RateLimitStatus> {
    // Check current rate limit usage
    const rateLimitInfo = await this.getCurrentRateLimitInfo()
    
    return {
      requestsPerMinute: {
        used: rateLimitInfo.requests.used,
        limit: rateLimitInfo.requests.limit,
        resetTime: rateLimitInfo.requests.resetTime
      },
      tokensPerMinute: {
        used: rateLimitInfo.tokens.used,
        limit: rateLimitInfo.tokens.limit,
        resetTime: rateLimitInfo.tokens.resetTime
      },
      recommendedAction: this.getRecommendedAction(rateLimitInfo)
    }
  }

  async handleAIServiceFailure(error: AIServiceError): Promise<FailureResponse> {
    switch (error.type) {
      case 'rate_limit_exceeded':
        return this.handleRateLimitExceeded(error)
      
      case 'api_connection_failed':
        return this.handleConnectionFailure(error)
      
      case 'model_unavailable':
        return this.handleModelUnavailable(error)
      
      case 'invalid_response':
        return this.handleInvalidResponse(error)
      
      default:
        return this.handleGenericFailure(error)
    }
  }

  private async handleRateLimitExceeded(error: AIServiceError): Promise<FailureResponse> {
    // Implement exponential backoff
    const backoffTime = Math.min(Math.pow(2, error.retryCount) * 1000, 60000)
    
    // Queue request for retry
    await this.queueForRetry(error.originalRequest, backoffTime)
    
    // Consider switching to backup model or service
    if (error.retryCount > 3) {
      return this.switchToBackupService(error.originalRequest)
    }

    return {
      action: 'retry_with_backoff',
      backoffTime,
      estimatedRetryTime: new Date(Date.now() + backoffTime)
    }
  }

  private async switchToBackupService(request: AIRequest): Promise<FailureResponse> {
    // Try alternative model or service
    const alternatives = ['gpt-3.5-turbo', 'claude-3-sonnet', 'local-model']
    
    for (const alternative of alternatives) {
      try {
        const result = await this.callAlternativeService(alternative, request)
        return {
          action: 'switched_to_backup',
          service: alternative,
          result
        }
      } catch (backupError) {
        continue
      }
    }

    return {
      action: 'all_services_failed',
      error: 'No backup services available'
    }
  }
}
```

### AI Response Quality Monitoring

```typescript
// lib/ai/quality-monitoring.ts
export class AIQualityMonitor {
  async monitorResponseQuality(): Promise<QualityReport> {
    const recentResponses = await this.getRecentAIResponses(100)
    
    const qualityMetrics = {
      averageLength: this.calculateAverageLength(recentResponses),
      coherenceScore: await this.calculateCoherenceScore(recentResponses),
      relevanceScore: await this.calculateRelevanceScore(recentResponses),
      errorRate: this.calculateErrorRate(recentResponses),
      userSatisfaction: await this.getUserSatisfactionScore(recentResponses)
    }

    return {
      overallScore: this.calculateOverallQualityScore(qualityMetrics),
      metrics: qualityMetrics,
      trends: await this.calculateQualityTrends(),
      alerts: this.generateQualityAlerts(qualityMetrics),
      recommendations: this.generateQualityRecommendations(qualityMetrics)
    }
  }

  private async calculateCoherenceScore(responses: AIResponse[]): Promise<number> {
    // Use a coherence model to score responses
    const scores = await Promise.all(
      responses.map(response => this.scoreCoherence(response.content))
    )
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  private generateQualityAlerts(metrics: QualityMetrics): QualityAlert[] {
    const alerts: QualityAlert[] = []

    if (metrics.coherenceScore < 0.7) {
      alerts.push({
        type: 'low_coherence',
        severity: 'warning',
        message: 'AI response coherence below acceptable threshold',
        threshold: 0.7,
        current: metrics.coherenceScore
      })
    }

    if (metrics.errorRate > 0.1) {
      alerts.push({
        type: 'high_error_rate',
        severity: 'critical',
        message: 'AI service error rate above acceptable threshold',
        threshold: 0.1,
        current: metrics.errorRate
      })
    }

    return alerts
  }
}
```

---

## Infrastructure Problems

### Kubernetes Cluster Issues

```bash
# Kubernetes troubleshooting commands

# Check cluster health
kubectl get nodes
kubectl describe nodes | grep -E "(Conditions|Taints|Capacity|Allocatable)"

# Check system pods
kubectl get pods -n kube-system
kubectl get pods -n kube-system --field-selector=status.phase!=Running

# Check cluster events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check resource usage
kubectl top nodes
kubectl top pods -A

# Check network connectivity
kubectl exec -it debug-pod -- nslookup kubernetes.default.svc.cluster.local
kubectl exec -it debug-pod -- wget -qO- google.com

# Check storage
kubectl get pv
kubectl get pvc -A
kubectl describe pv | grep -E "(Name|Status|Claim|StorageClass|Reason)"
```

### Node Problems

```typescript
// lib/infrastructure/node-troubleshooting.ts
export class NodeTroubleshooter {
  async diagnoseNodeIssues(): Promise<NodeDiagnosisReport> {
    const nodes = await this.getClusterNodes()
    const nodeReports = await Promise.all(
      nodes.map(node => this.diagnoseNode(node))
    )

    return {
      clusterHealth: this.calculateClusterHealth(nodeReports),
      nodeReports,
      recommendedActions: this.generateNodeRecommendations(nodeReports)
    }
  }

  private async diagnoseNode(node: KubernetesNode): Promise<NodeReport> {
    const [
      resourceUsage,
      nodeConditions,
      podCount,
      diskUsage
    ] = await Promise.all([
      this.getNodeResourceUsage(node),
      this.getNodeConditions(node),
      this.getNodePodCount(node),
      this.getNodeDiskUsage(node)
    ])

    const issues = this.identifyNodeIssues({
      resourceUsage,
      nodeConditions,
      podCount,
      diskUsage
    })

    return {
      nodeName: node.name,
      status: this.calculateNodeStatus(issues),
      resourceUsage,
      nodeConditions,
      podCount,
      diskUsage,
      issues,
      recommendations: this.generateNodeFixRecommendations(issues)
    }
  }

  private identifyNodeIssues(nodeData: NodeData): NodeIssue[] {
    const issues: NodeIssue[] = []

    // Check CPU usage
    if (nodeData.resourceUsage.cpu > 0.8) {
      issues.push({
        type: 'high_cpu_usage',
        severity: nodeData.resourceUsage.cpu > 0.9 ? 'critical' : 'warning',
        description: `CPU usage at ${(nodeData.resourceUsage.cpu * 100).toFixed(1)}%`,
        impact: 'Pod scheduling and performance issues'
      })
    }

    // Check memory usage
    if (nodeData.resourceUsage.memory > 0.8) {
      issues.push({
        type: 'high_memory_usage',
        severity: nodeData.resourceUsage.memory > 0.9 ? 'critical' : 'warning',
        description: `Memory usage at ${(nodeData.resourceUsage.memory * 100).toFixed(1)}%`,
        impact: 'Risk of pod eviction and OOM kills'
      })
    }

    // Check disk usage
    if (nodeData.diskUsage > 0.8) {
      issues.push({
        type: 'high_disk_usage',
        severity: nodeData.diskUsage > 0.9 ? 'critical' : 'warning',
        description: `Disk usage at ${(nodeData.diskUsage * 100).toFixed(1)}%`,
        impact: 'Unable to pull images or write logs'
      })
    }

    // Check node conditions
    const badConditions = nodeData.nodeConditions.filter(
      condition => condition.status === 'True' && condition.type !== 'Ready'
    )
    
    badConditions.forEach(condition => {
      issues.push({
        type: 'node_condition',
        severity: 'warning',
        description: `Node condition: ${condition.type}`,
        impact: condition.message
      })
    })

    return issues
  }
}
```

### Network Issues

```bash
# Network troubleshooting

# Check pod-to-pod connectivity
kubectl run test-pod --image=nicolaka/netshoot --rm -it -- /bin/bash
# Inside test pod:
nslookup akashic-service.akashic-production.svc.cluster.local
curl akashic-service.akashic-production.svc.cluster.local

# Check ingress controller
kubectl get ingress -A
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Check DNS resolution
kubectl exec -it test-pod -- nslookup kubernetes.default.svc.cluster.local
kubectl exec -it test-pod -- cat /etc/resolv.conf

# Check network policies
kubectl get networkpolicies -A
kubectl describe networkpolicy -n akashic-production

# Check service endpoints
kubectl get endpoints -n akashic-production
kubectl describe service akashic-service -n akashic-production
```

---

## Security Incidents

### Security Incident Response

```typescript
// lib/security/incident-response.ts
export class SecurityIncidentHandler {
  async handleSecurityIncident(incident: SecurityIncident): Promise<IncidentResponse> {
    // Immediate containment
    await this.containThreat(incident)
    
    // Evidence collection
    const evidence = await this.collectEvidence(incident)
    
    // Threat analysis
    const analysis = await this.analyzeThreat(incident, evidence)
    
    // Response execution
    const response = await this.executeResponse(incident, analysis)
    
    // Communication
    await this.communicateIncident(incident, response)
    
    return response
  }

  private async containThreat(incident: SecurityIncident): Promise<void> {
    switch (incident.type) {
      case 'unauthorized_access':
        await this.blockSuspiciousIPs(incident.sourceIPs)
        await this.disableCompromisedAccounts(incident.affectedUsers)
        break
        
      case 'malware_detected':
        await this.isolateAffectedSystems(incident.affectedSystems)
        await this.blockMaliciousTraffic(incident.indicators)
        break
        
      case 'data_breach':
        await this.lockDownDataAccess(incident.affectedData)
        await this.enableAdditionalLogging()
        break
        
      case 'ddos_attack':
        await this.enableDDoSProtection()
        await this.scaleInfrastructure()
        break
    }
  }

  private async collectEvidence(incident: SecurityIncident): Promise<SecurityEvidence> {
    return {
      systemLogs: await this.collectSystemLogs(incident.timeRange),
      networkTraffic: await this.collectNetworkTraffic(incident.timeRange),
      userActivity: await this.collectUserActivity(incident.affectedUsers),
      fileSystemChanges: await this.collectFileSystemChanges(incident.timeRange),
      memoryDumps: await this.collectMemoryDumps(incident.affectedSystems)
    }
  }

  async runSecurityScan(): Promise<SecurityScanReport> {
    const [
      vulnerabilityReport,
      complianceReport,
      configurationReport,
      accessReport
    ] = await Promise.all([
      this.scanVulnerabilities(),
      this.checkCompliance(),
      this.auditConfiguration(),
      this.auditAccess()
    ])

    return {
      overall: this.calculateSecurityScore({
        vulnerabilityReport,
        complianceReport,
        configurationReport,
        accessReport
      }),
      vulnerabilityReport,
      complianceReport,
      configurationReport,
      accessReport,
      recommendations: this.generateSecurityRecommendations({
        vulnerabilityReport,
        complianceReport,
        configurationReport,
        accessReport
      })
    }
  }
}
```

### Access Control Issues

```bash
# Access control troubleshooting

# Check RBAC permissions
kubectl auth can-i create pods --as=system:serviceaccount:akashic-production:akashic-sa
kubectl auth can-i get secrets --as=user@example.com -n akashic-production

# Check service account permissions
kubectl get rolebindings,clusterrolebindings --all-namespaces -o json | \
  jq -r '.items[] | select(.subjects[]?.name=="akashic-sa") | .metadata.name'

# Check pod security context
kubectl get pod <pod-name> -o jsonpath='{.spec.securityContext}'
kubectl get pod <pod-name> -o jsonpath='{.spec.containers[0].securityContext}'

# Check network policies
kubectl get networkpolicy -A
kubectl describe networkpolicy allow-ingress -n akashic-production

# Audit failed authentication attempts
kubectl logs -n kube-system kube-apiserver-* | grep "authentication failed"
```

---

## Deployment Issues

### Failed Deployments

```bash
# Deployment troubleshooting

# Check deployment status
kubectl get deployments -n akashic-production
kubectl describe deployment akashic-intelligence -n akashic-production

# Check rollout status
kubectl rollout status deployment/akashic-intelligence -n akashic-production
kubectl rollout history deployment/akashic-intelligence -n akashic-production

# Check pod startup issues
kubectl get pods -n akashic-production -l app=akashic-intelligence
kubectl describe pod <pod-name> -n akashic-production
kubectl logs <pod-name> -n akashic-production --previous

# Check image pull issues
kubectl describe pod <pod-name> -n akashic-production | grep -A 10 "Events:"

# Rollback deployment
kubectl rollout undo deployment/akashic-intelligence -n akashic-production
kubectl rollout undo deployment/akashic-intelligence -n akashic-production --to-revision=2
```

### Helm Issues

```bash
# Helm troubleshooting

# Check release status
helm list -n akashic-production
helm status akashic-intelligence -n akashic-production

# Debug template rendering
helm template akashic-intelligence ./helm/akashic-intelligence \
  --values ./helm/values/production.yaml \
  --debug

# Check for syntax errors
helm lint ./helm/akashic-intelligence

# Dry run deployment
helm upgrade akashic-intelligence ./helm/akashic-intelligence \
  --values ./helm/values/production.yaml \
  --dry-run --debug

# Rollback helm release
helm rollback akashic-intelligence 1 -n akashic-production

# Get release values
helm get values akashic-intelligence -n akashic-production
```

---

## Emergency Procedures

### Complete System Outage

```markdown
## 🚨 COMPLETE SYSTEM OUTAGE - EMERGENCY PROCEDURE

### IMMEDIATE ACTIONS (0-5 minutes)
1. **Acknowledge the outage**
   - Update status page: "Investigating service disruption"
   - Post in #incidents Slack channel
   - Page on-call engineer if not already aware

2. **Quick assessment**
   ```bash
   # Check if cluster is accessible
   kubectl get nodes
   
   # Check critical services
   kubectl get pods -n akashic-production
   kubectl get services -n akashic-production
   ```

3. **Activate incident response team**
   - Incident Commander
   - Technical Lead
   - Communications Lead

### INVESTIGATION PHASE (5-15 minutes)
1. **Check infrastructure**
   - AWS Console / GCP Console
   - Check for service outages
   - Verify network connectivity
   - Check DNS resolution

2. **Check recent changes**
   ```bash
   # Check recent deployments
   kubectl rollout history deployment/akashic-intelligence -n akashic-production
   
   # Check recent events
   kubectl get events --sort-by=.metadata.creationTimestamp -n akashic-production
   ```

3. **Check external dependencies**
   - Database connectivity
   - Redis availability
   - OpenAI API status
   - Third-party service status

### RECOVERY ACTIONS
Choose appropriate action based on findings:

#### A. Recent Deployment Issue
```bash
# Rollback to previous version
kubectl rollout undo deployment/akashic-intelligence -n akashic-production
helm rollback akashic-intelligence -n akashic-production
```

#### B. Database Issue
```bash
# Check database connectivity
kubectl exec -it deployment/akashic-intelligence -n akashic-production -- \
  pg_isready -h $DB_HOST -p $DB_PORT

# If database is down, check RDS/Cloud SQL console
# Consider failing over to read replica if available
```

#### C. Infrastructure Issue
```bash
# Scale up deployment
kubectl scale deployment akashic-intelligence --replicas=10 -n akashic-production

# Check node status
kubectl get nodes
kubectl describe nodes | grep -E "Conditions|Taints"
```

#### D. Complete Disaster
```bash
# Activate disaster recovery plan
# Failover to secondary region/cluster
# Restore from latest backup
```

### COMMUNICATION TEMPLATE
"We are currently experiencing a service disruption affecting all users. Our team is actively investigating and working to restore service. We will provide updates every 15 minutes. Estimated resolution time: [XX:XX]"

### POST-RECOVERY CHECKLIST
- [ ] Verify all services are operational
- [ ] Run smoke tests
- [ ] Update status page to "All systems operational"
- [ ] Schedule post-incident review
- [ ] Document lessons learned
```

### Disaster Recovery Activation

```typescript
// scripts/disaster-recovery-activation.ts
export class DisasterRecoveryActivator {
  async activateDisasterRecovery(scenario: DisasterScenario): Promise<RecoveryResult> {
    console.log(`🚨 ACTIVATING DISASTER RECOVERY FOR: ${scenario.type}`)
    
    // Step 1: Assess damage and scope
    const assessment = await this.assessDisaster(scenario)
    
    // Step 2: Activate appropriate recovery procedure
    const recoveryPlan = this.selectRecoveryPlan(assessment)
    
    // Step 3: Execute recovery
    const result = await this.executeRecovery(recoveryPlan)
    
    // Step 4: Verify recovery
    await this.verifyRecovery(result)
    
    // Step 5: Communicate status
    await this.communicateRecoveryStatus(result)
    
    return result
  }

  private async executeRecovery(plan: RecoveryPlan): Promise<RecoveryResult> {
    const startTime = Date.now()
    
    try {
      // Execute recovery steps in sequence
      for (const step of plan.steps) {
        await this.executeRecoveryStep(step)
      }
      
      const recoveryTime = Date.now() - startTime
      
      return {
        success: true,
        recoveryTimeMs: recoveryTime,
        stepsCompleted: plan.steps.length,
        dataLoss: await this.assessDataLoss(),
        message: 'Disaster recovery completed successfully'
      }
      
    } catch (error) {
      return {
        success: false,
        recoveryTimeMs: Date.now() - startTime,
        error: error.message,
        message: 'Disaster recovery failed - manual intervention required'
      }
    }
  }

  private async verifyRecovery(result: RecoveryResult): Promise<void> {
    if (!result.success) {
      throw new Error('Recovery verification failed')
    }

    // Run comprehensive health checks
    const healthChecks = [
      this.verifyApplicationHealth(),
      this.verifyDatabaseHealth(),
      this.verifyExternalServiceHealth(),
      this.verifyDataIntegrity()
    ]

    const results = await Promise.all(healthChecks)
    const allHealthy = results.every(check => check.healthy)

    if (!allHealthy) {
      throw new Error('Post-recovery health checks failed')
    }
  }
}
```

---

This comprehensive Troubleshooting & Operations Guide provides systematic approaches to diagnosing and resolving issues across all aspects of the Akashic Intelligence platform, ensuring rapid problem resolution and minimal downtime.


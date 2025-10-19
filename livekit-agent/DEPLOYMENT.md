# LiveKit Agent Deployment Guide

This guide provides detailed instructions for deploying your LiveKit voice agent to production environments.

## Deployment Options

You have several options for deploying your LiveKit agent:

1. **LiveKit Cloud** (Recommended) - Fully managed, easiest setup
2. **Self-Hosted** - Full control, requires infrastructure management
3. **Hybrid** - LiveKit Cloud for media, self-hosted agents

## LiveKit Cloud Deployment

LiveKit Cloud provides the easiest path to production with automatic scaling, global infrastructure, and built-in monitoring.

### Prerequisites

Before deploying to LiveKit Cloud, ensure you have:

- A LiveKit Cloud account ([sign up here](https://cloud.livekit.io/))
- LiveKit CLI installed
- Your agent tested locally
- All API keys configured

### Step-by-Step Deployment

#### 1. Install LiveKit CLI

Choose the installation method for your platform:

**macOS:**
```bash
brew install livekit
```

**Linux:**
```bash
curl -sSL https://get.livekit.io/ | bash
```

**Windows:**
```bash
winget install LiveKit.LiveKitCLI
```

**From Source:**
```bash
go install github.com/livekit/livekit-cli/cmd/lk@latest
```

Verify installation:
```bash
lk version
```

#### 2. Authenticate with LiveKit Cloud

Link your CLI to your LiveKit Cloud account:

```bash
lk cloud auth
```

This will:
- Open a browser window
- Ask you to sign in to LiveKit Cloud
- Link your CLI to your project
- Store credentials locally

#### 3. Configure Environment Variables

Set up your environment variables for cloud deployment:

```bash
lk app env -w
```

This command:
- Fetches your LiveKit credentials
- Writes them to `.env.local`
- Configures the connection to your LiveKit project

Your `.env.local` should now contain:
```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxx
```

**Important:** Also add your AI provider keys to `.env.local`:
```bash
OPENAI_API_KEY=your_openai_key
DEEPGRAM_API_KEY=your_deepgram_key
```

#### 4. Test Connection

Before deploying, test that your agent can connect:

```bash
uv run python livekit_basic_agent.py dev
```

Visit the [Agents Playground](https://agents-playground.livekit.io/) to verify connectivity.

#### 5. Create Deployment Configuration

Create a `livekit.toml` file in your project root:

```toml
[agent]
name = "airbnb-assistant"
version = "1.0.0"
description = "Voice AI agent for Airbnb booking assistance"

[worker]
# Number of workers to keep warm
prewarm = 2

# Maximum concurrent jobs per worker
max_concurrent_jobs = 1

# Worker timeout (seconds)
timeout = 300

[build]
# Python version
python_version = "3.11"

# Build command
build_command = "uv sync"

# Start command
start_command = "uv run python livekit_basic_agent.py start"

[environment]
# Environment variables (non-sensitive only)
LOG_LEVEL = "INFO"
LLM_CHOICE = "gpt-4.1-mini"
```

**Security Note:** Never put API keys in `livekit.toml`. Use `lk app env` to set sensitive variables.

#### 6. Deploy Your Agent

Deploy your agent to LiveKit Cloud:

```bash
lk agent create
```

This command will:
1. Create a `Dockerfile` if one doesn't exist
2. Build your agent container
3. Push the container to LiveKit Cloud
4. Register the agent with your project
5. Start the agent workers

Expected output:
```
Building agent container...
Pushing to LiveKit Cloud...
Registering agent...
✓ Agent deployed successfully!
Agent ID: agent_xxxxxxxxxxxxx
```

#### 7. Verify Deployment

Check your agent status:

```bash
lk agent list
```

View agent logs:

```bash
lk agent logs airbnb-assistant
```

Monitor agent metrics:

```bash
lk agent stats airbnb-assistant
```

#### 8. Test in Production

Visit the [Agents Playground](https://agents-playground.livekit.io/) and:
1. Sign in with your LiveKit Cloud account
2. Select your deployed agent
3. Start a conversation
4. Verify all features work correctly

### Updating Your Agent

To deploy updates:

```bash
# Make your code changes
# Test locally first
uv run python livekit_basic_agent.py console

# Deploy the update
lk agent update airbnb-assistant
```

### Scaling Configuration

Adjust scaling based on your needs:

```bash
# Set minimum workers
lk agent scale airbnb-assistant --min 3

# Set maximum workers
lk agent scale airbnb-assistant --max 10

# Enable auto-scaling
lk agent scale airbnb-assistant --auto
```

## Self-Hosted Deployment

For full control over your infrastructure, you can self-host both LiveKit server and agents.

### Prerequisites

- Docker and Docker Compose
- A server with public IP
- Domain name (for SSL/TLS)
- Basic DevOps knowledge

### LiveKit Server Setup

#### 1. Install LiveKit Server

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  livekit:
    image: livekit/livekit-server:latest
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
    command: --config /etc/livekit.yaml
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
```

#### 2. Configure LiveKit Server

Create `livekit.yaml`:

```yaml
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true

redis:
  address: redis:6379

keys:
  APIxxxxxxxx: your-secret-key-here

room:
  auto_create: true
  empty_timeout: 300
  max_participants: 100

logging:
  level: info
```

#### 3. Start LiveKit Server

```bash
docker-compose up -d
```

### Agent Deployment

#### 1. Create Agent Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy project files
COPY pyproject.toml uv.lock ./
COPY livekit_basic_agent.py ./

# Install dependencies
RUN uv sync

# Download model files
RUN uv run python livekit_basic_agent.py download-files

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run agent
CMD ["uv", "run", "python", "livekit_basic_agent.py", "start"]
```

#### 2. Build Agent Image

```bash
docker build -t livekit-agent:latest .
```

#### 3. Run Agent Container

```bash
docker run -d \
  --name livekit-agent \
  --env-file .env \
  --restart unless-stopped \
  livekit-agent:latest
```

#### 4. Set Up Multiple Workers

Create `docker-compose.agents.yml`:

```yaml
version: '3.8'

services:
  agent-1:
    image: livekit-agent:latest
    env_file: .env
    restart: unless-stopped

  agent-2:
    image: livekit-agent:latest
    env_file: .env
    restart: unless-stopped

  agent-3:
    image: livekit-agent:latest
    env_file: .env
    restart: unless-stopped
```

Start workers:
```bash
docker-compose -f docker-compose.agents.yml up -d
```

## Kubernetes Deployment

For production-scale deployments, use Kubernetes:

### 1. Create Deployment

`agent-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: livekit-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: livekit-agent
  template:
    metadata:
      labels:
        app: livekit-agent
    spec:
      containers:
      - name: agent
        image: your-registry/livekit-agent:latest
        env:
        - name: LIVEKIT_URL
          valueFrom:
            secretKeyRef:
              name: livekit-secrets
              key: url
        - name: LIVEKIT_API_KEY
          valueFrom:
            secretKeyRef:
              name: livekit-secrets
              key: api-key
        - name: LIVEKIT_API_SECRET
          valueFrom:
            secretKeyRef:
              name: livekit-secrets
              key: api-secret
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: openai-key
        - name: DEEPGRAM_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: deepgram-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### 2. Create Secrets

```bash
kubectl create secret generic livekit-secrets \
  --from-literal=url=wss://your-server.com \
  --from-literal=api-key=APIxxxxxxxx \
  --from-literal=api-secret=xxxxxxxx

kubectl create secret generic ai-secrets \
  --from-literal=openai-key=sk-xxxxxxxx \
  --from-literal=deepgram-key=xxxxxxxx
```

### 3. Deploy

```bash
kubectl apply -f agent-deployment.yaml
```

### 4. Set Up Auto-Scaling

`agent-hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: livekit-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: livekit-agent
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

Apply:
```bash
kubectl apply -f agent-hpa.yaml
```

## Monitoring and Observability

### LiveKit Cloud Monitoring

LiveKit Cloud provides built-in monitoring:

1. **Dashboard** - View real-time metrics at cloud.livekit.io
2. **Logs** - Access with `lk agent logs`
3. **Metrics** - CPU, memory, active sessions
4. **Alerts** - Configure email/Slack notifications

### Self-Hosted Monitoring

#### Prometheus + Grafana

1. **Expose Metrics**

Add to your agent:

```python
from prometheus_client import start_http_server, Counter, Histogram

# Start metrics server
start_http_server(8000)

# Define metrics
conversations = Counter('agent_conversations_total', 'Total conversations')
response_time = Histogram('agent_response_seconds', 'Response time')
```

2. **Configure Prometheus**

`prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'livekit-agents'
    static_configs:
      - targets: ['agent-1:8000', 'agent-2:8000', 'agent-3:8000']
```

3. **Set Up Grafana Dashboard**

Import the LiveKit dashboard or create custom visualizations.

## Production Best Practices

### Security

1. **API Keys**
   - Never commit keys to version control
   - Use environment variables or secrets management
   - Rotate keys regularly
   - Use different keys for dev/prod

2. **Network Security**
   - Use HTTPS/WSS only
   - Configure firewall rules
   - Enable rate limiting
   - Implement authentication

3. **Container Security**
   - Use official base images
   - Scan for vulnerabilities
   - Run as non-root user
   - Keep dependencies updated

### Performance

1. **Resource Allocation**
   - Monitor CPU/memory usage
   - Set appropriate limits
   - Use connection pooling
   - Cache frequently accessed data

2. **Latency Optimization**
   - Deploy close to users
   - Use fast AI providers
   - Enable streaming
   - Optimize tool execution

3. **Scaling Strategy**
   - Start with 2-3 workers
   - Enable auto-scaling
   - Set max concurrent jobs
   - Monitor queue depth

### Reliability

1. **Health Checks**
   - Implement liveness probes
   - Add readiness checks
   - Monitor agent status
   - Set up alerts

2. **Error Handling**
   - Implement retry logic
   - Log errors properly
   - Handle API failures gracefully
   - Provide fallback responses

3. **Backup and Recovery**
   - Back up configuration
   - Document deployment process
   - Test disaster recovery
   - Maintain rollback capability

## Troubleshooting Deployment

### Common Issues

#### Agent Won't Start

```bash
# Check logs
lk agent logs airbnb-assistant

# Common causes:
# - Missing environment variables
# - Invalid API keys
# - Network connectivity issues
# - Model download failures
```

#### High Latency

```bash
# Check metrics
lk agent stats airbnb-assistant

# Solutions:
# - Scale up workers
# - Use faster providers
# - Deploy closer to users
# - Optimize tool execution
```

#### Connection Failures

```bash
# Test connectivity
lk test connection

# Verify:
# - LIVEKIT_URL is correct
# - Firewall allows WebRTC ports
# - SSL certificates are valid
# - DNS is configured properly
```

## Cost Optimization

### LiveKit Cloud

1. **Right-Size Workers**
   - Start small, scale as needed
   - Monitor actual usage
   - Use auto-scaling

2. **Optimize AI Costs**
   - Use cost-effective models
   - Cache responses when possible
   - Implement usage limits

3. **Monitor Spending**
   - Set up billing alerts
   - Review usage regularly
   - Optimize inefficient patterns

### Self-Hosted

1. **Infrastructure Costs**
   - Use spot instances for dev
   - Reserved instances for prod
   - Auto-scale during off-peak

2. **AI Provider Costs**
   - Compare provider pricing
   - Use batch processing
   - Implement caching

## Support and Resources

### Getting Help

- **LiveKit Docs**: [docs.livekit.io](https://docs.livekit.io/)
- **Community**: [livekit.io/community](https://livekit.io/community)
- **GitHub**: [github.com/livekit/agents](https://github.com/livekit/agents)
- **Support**: support@livekit.io (Cloud customers)

### Additional Resources

- [LiveKit Cloud Status](https://status.livekit.io/)
- [API Reference](https://docs.livekit.io/reference/)
- [Example Projects](https://github.com/livekit-examples)
- [Video Tutorials](https://www.youtube.com/@livekit)

---

**Need help?** Join the [LiveKit Community](https://livekit.io/community) or check the [documentation](https://docs.livekit.io/).


# Crowd Risk Engine - Deployment Guide

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [External Services Setup](#external-services-setup)
5. [Deployment Methods](#deployment-methods)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] Server or cloud platform provisioned
- [ ] Domain name configured
- [ ] SSL certificate obtained
- [ ] Database server ready
- [ ] Minimum 2GB RAM, 2 CPU cores
- [ ] Node.js 18+ installed
- [ ] Network ports opened (80, 443, 3000)

### Service Accounts

- [ ] SMS gateway account (Twilio or equivalent)
- [ ] Email service account (SendGrid or equivalent)
- [ ] Push notification service (Firebase or equivalent)
- [ ] Monitoring service account (optional)
- [ ] Error tracking service (optional)

### Access and Permissions

- [ ] Admin user accounts created
- [ ] Role-based permissions configured
- [ ] API keys generated
- [ ] Service account credentials secured

---

## Environment Variables

The Crowd Risk Engine requires several environment variables to be configured. These variables control API endpoints, notification services, and system behavior.

### Configuration Files

- **`.env.local`**: Local development configuration (not committed to version control)
- **`.env.example`**: Template with all required variables and descriptions
- **Production**: Set variables in your deployment platform (Vercel, AWS, etc.)

### Required Environment Variables

#### API Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_CROWD_RISK_API_URL` | Base URL for Crowd Risk API endpoints | `https://your-domain.com/api/crowd-risk` | ✅ Yes |

**Notes:**
- Must be a valid HTTP/HTTPS URL
- Accessible from the browser (prefixed with `NEXT_PUBLIC_`)
- Development: `http://localhost:3000/api/crowd-risk`
- Production: Use your actual domain

#### SMS Notification Service

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SMS_GATEWAY_API_KEY` | Twilio Account SID or equivalent | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | ✅ Yes |
| `SMS_GATEWAY_API_SECRET` | Twilio Auth Token or equivalent | `your_auth_token_here` | ✅ Yes |
| `SMS_FROM_NUMBER` | Sender phone number | `+15555551234` | ⚠️ Recommended |

**Setup Instructions:**
1. Create a Twilio account at https://www.twilio.com/
2. Navigate to Console > Account Info
3. Copy your Account SID to `SMS_GATEWAY_API_KEY`
4. Copy your Auth Token to `SMS_GATEWAY_API_SECRET`
5. Purchase a phone number and set it as `SMS_FROM_NUMBER`

**Alternative Providers:**
- AWS SNS
- Nexmo/Vonage
- MessageBird

#### Email Notification Service

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EMAIL_SERVICE_API_KEY` | SendGrid API Key or equivalent | `SG.xxxxxxxxxxxxxxxxxxxxxxxx` | ✅ Yes |
| `EMAIL_FROM_ADDRESS` | Verified sender email address | `alerts@your-domain.com` | ⚠️ Recommended |
| `EMAIL_FROM_NAME` | Sender display name | `Crowd Risk Alert System` | ⚠️ Recommended |

**Setup Instructions:**
1. Create a SendGrid account at https://sendgrid.com/
2. Navigate to Settings > API Keys
3. Create a new API key with "Mail Send" permissions
4. Copy the API key to `EMAIL_SERVICE_API_KEY`
5. Verify your sender email address in SendGrid
6. Set `EMAIL_FROM_ADDRESS` to your verified email

**Alternative Providers:**
- AWS SES
- Mailgun
- Postmark
- Resend

#### Push Notification Service

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PUSH_NOTIFICATION_SERVICE_KEY` | FCM Server Key or equivalent | `AAAAxxxxxxx:APA91bHxxxxxx` | ✅ Yes |
| `PUSH_NOTIFICATION_SERVICE_TYPE` | Service type identifier | `fcm`, `onesignal`, `custom` | ⚠️ Recommended |

**Setup Instructions (Firebase Cloud Messaging):**
1. Create a Firebase project at https://console.firebase.google.com/
2. Navigate to Project Settings > Cloud Messaging
3. Copy the Server Key to `PUSH_NOTIFICATION_SERVICE_KEY`
4. Set `PUSH_NOTIFICATION_SERVICE_TYPE` to `fcm`

**Alternative Providers:**
- OneSignal
- Pusher
- AWS SNS Mobile Push
- Custom implementation

#### Density Data Stream

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DENSITY_DATA_STREAM_URL` | Real-time density data endpoint | `wss://density-provider.com/stream` | ✅ Yes |

**Notes:**
- Must be a WebSocket (ws://) or Server-Sent Events (https://) endpoint
- Should provide real-time crowd density readings
- Development: `ws://localhost:3000/api/crowd-risk/density-stream` (internal simulator)
- Production: Connect to your actual density monitoring system

### Optional Environment Variables

#### Development Configuration

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `NEXT_PUBLIC_DEV_MODE` | Enable development features | `false` | Set to `true` for local development |
| `CROWD_RISK_LOG_LEVEL` | Logging verbosity | `info` | Options: `debug`, `info`, `warn`, `error` |

#### System Configuration

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `ALERT_RETENTION_DAYS` | Alert history retention period | `90` | Number of days to keep alert logs |
| `MAX_NOTIFICATION_BATCH_SIZE` | Max concurrent notifications | `100` | Adjust based on service limits |
| `NOTIFICATION_MAX_RETRIES` | Notification retry attempts | `3` | Number of retry attempts on failure |
| `NOTIFICATION_RETRY_BACKOFF_MS` | Retry delay in milliseconds | `1000` | Initial backoff time (exponential) |

### Environment Variable Validation

The system automatically validates environment variables on startup:

**Development Mode:**
- Shows warnings for missing variables
- Uses mock values for testing
- Continues execution with defaults

**Production Mode:**
- Fails startup if required variables are missing
- Validates URL formats
- Validates numeric values
- Logs validation errors

### Setting Environment Variables

#### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your actual values

3. Restart the development server:
   ```bash
   npm run dev
   ```

#### Vercel Deployment

1. Navigate to your project settings
2. Go to "Environment Variables"
3. Add each variable with appropriate values
4. Set environment scope (Production, Preview, Development)
5. Redeploy your application

#### AWS/Docker Deployment

1. Use environment variable injection in your deployment configuration
2. Store secrets in AWS Secrets Manager or Parameter Store
3. Reference secrets in your container/instance configuration

#### Kubernetes Deployment

1. Create a ConfigMap for non-sensitive values:
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: crowd-risk-config
   data:
     NEXT_PUBLIC_CROWD_RISK_API_URL: "https://your-domain.com/api/crowd-risk"
     ALERT_RETENTION_DAYS: "90"
   ```

2. Create a Secret for sensitive values:
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: crowd-risk-secrets
   type: Opaque
   stringData:
     SMS_GATEWAY_API_KEY: "your_twilio_sid"
     SMS_GATEWAY_API_SECRET: "your_twilio_token"
     EMAIL_SERVICE_API_KEY: "your_sendgrid_key"
   ```

3. Reference in your deployment:
   ```yaml
   envFrom:
     - configMapRef:
         name: crowd-risk-config
     - secretRef:
         name: crowd-risk-secrets
   ```

### Security Best Practices

1. **Never commit `.env.local` to version control**
   - Already included in `.gitignore`
   - Use `.env.example` as a template only

2. **Rotate API keys regularly**
   - Set up key rotation schedule (every 90 days)
   - Update keys in all environments

3. **Use different keys for each environment**
   - Development: Test/sandbox keys
   - Staging: Separate production-like keys
   - Production: Production keys only

4. **Restrict API key permissions**
   - Grant minimum required permissions
   - Use service-specific keys when possible

5. **Monitor API key usage**
   - Set up alerts for unusual activity
   - Track API call volumes
   - Monitor for unauthorized access

### Troubleshooting

#### Missing Environment Variables

**Symptom:** Application fails to start or shows warnings

**Solution:**
1. Check that `.env.local` exists
2. Verify all required variables are set
3. Ensure no placeholder values remain (e.g., `your_key_here`)
4. Check for typos in variable names

#### Invalid URL Format

**Symptom:** Warning about invalid URL format

**Solution:**
1. Ensure URLs start with `http://`, `https://`, `ws://`, or `wss://`
2. Remove trailing slashes
3. Verify domain is accessible

#### Notification Service Failures

**Symptom:** Notifications not being delivered

**Solution:**
1. Verify API keys are correct and active
2. Check service account has sufficient credits/quota
3. Verify sender addresses/numbers are verified
4. Check service status pages for outages
5. Review logs for specific error messages

#### Environment Variables Not Loading

**Symptom:** Variables are undefined in the application

**Solution:**
1. Restart the development server after changing `.env.local`
2. For `NEXT_PUBLIC_*` variables, rebuild the application
3. Check that variable names match exactly (case-sensitive)
4. Verify the file is named `.env.local` (not `.env.local.txt`)

### Example Configurations

#### Development Configuration

```bash
# .env.local (Development)
NEXT_PUBLIC_CROWD_RISK_API_URL=http://localhost:3000/api/crowd-risk
SMS_GATEWAY_API_KEY=dev_mock_twilio_sid
SMS_GATEWAY_API_SECRET=dev_mock_twilio_token
EMAIL_SERVICE_API_KEY=dev_mock_sendgrid_key
PUSH_NOTIFICATION_SERVICE_KEY=dev_mock_fcm_key
DENSITY_DATA_STREAM_URL=ws://localhost:3000/api/crowd-risk/density-stream
NEXT_PUBLIC_DEV_MODE=true
CROWD_RISK_LOG_LEVEL=debug
```

#### Production Configuration

```bash
# Production Environment Variables
NEXT_PUBLIC_CROWD_RISK_API_URL=https://your-domain.com/api/crowd-risk
SMS_GATEWAY_API_KEY=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMS_GATEWAY_API_SECRET=your_actual_twilio_token
SMS_FROM_NUMBER=+15555551234
EMAIL_SERVICE_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_ADDRESS=alerts@your-domain.com
EMAIL_FROM_NAME=Crowd Risk Alert System
PUSH_NOTIFICATION_SERVICE_KEY=AAAAxxxxxxx:APA91bHxxxxxx
PUSH_NOTIFICATION_SERVICE_TYPE=fcm
DENSITY_DATA_STREAM_URL=wss://density-provider.com/stream
NEXT_PUBLIC_DEV_MODE=false
CROWD_RISK_LOG_LEVEL=info
ALERT_RETENTION_DAYS=90
MAX_NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_MAX_RETRIES=3
NOTIFICATION_RETRY_BACKOFF_MS=1000
```


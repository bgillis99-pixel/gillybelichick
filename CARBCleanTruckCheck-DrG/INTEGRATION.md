# 🔌 Backend Integration Guide

## Architecture Overview

```
CARBCleanTruckCheck-DrG Mobile App
            ↓
    Global Load Balancer
            ↓
┌───────────────────────────────────┐
│  carb-clean-truck-api             │
│  (Cloud Run Service)              │
│                                   │
│  ├→ carb-clean-truck-data (GCS)   │
│  ├→ dr-gilly-ai-service (Cloud Run)│
│  │   └→ Vertex AI APIs            │
│  └→ carb-secrets (Secret Manager) │
└───────────────────────────────────┘
```

---

## 🔑 Setup Instructions

### 1. Get Service Account Key

**You need to provide:**
- Service Account JSON key with permissions:
  - `Storage Object Viewer` (for GCS)
  - `Cloud Run Invoker` (for API services)
  - `Secret Manager Secret Accessor` (for secrets)

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update with your actual URLs:

```env
EXPO_PUBLIC_API_URL=https://carb-clean-truck-api-HASH-uc.a.run.app
EXPO_PUBLIC_DR_GILLY_API_URL=https://dr-gilly-ai-service-HASH-uc.a.run.app
EXPO_PUBLIC_GCP_PROJECT_ID=your-project-id
```

### 3. API Endpoints

The mobile app expects these endpoints from your Cloud Run services:

#### carb-clean-truck-api

```
POST   /api/vin/check
GET    /api/vin/history/:userId
POST   /api/tests
GET    /api/users/:userId
PATCH  /api/users/:userId
```

#### dr-gilly-ai-service

```
POST   /chat                 # Main Dr. Gilly chat endpoint
POST   /analyze-photos       # Vertex AI vision analysis
GET    /health              # Health check
```

---

## 📱 Mobile App Integration

### Dr. Gilly AI Chat

**File:** `src/services/drGillyService.ts`

**How it works:**
1. User types message in Dr. G screen
2. App sends to `dr-gilly-ai-service/chat`
3. Service calls Vertex AI Gemini
4. Response streams back to user

**Example Request:**

```json
POST https://dr-gilly-ai-service-xxx.run.app/chat

{
  "message": "What is CARB compliance?",
  "conversation_id": "abc123",
  "history": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ],
  "context": {
    "role": "CARB compliance expert",
    "expertise": ["California regulations", "Diesel testing"]
  }
}
```

**Expected Response:**

```json
{
  "response": "CARB stands for California Air Resources Board...",
  "conversation_id": "abc123",
  "context": "diesel_regulations",
  "references": [
    "Title 13, CCR Section 2025"
  ]
}
```

### VIN Checking

**File:** `src/services/api.ts`

**Flow:**
1. User scans VIN with camera
2. OCR extracts VIN (mobile-side)
3. App sends to `carb-clean-truck-api/api/vin/check`
4. API queries GCS data or external VIN database
5. Returns compliance status

**Example:**

```typescript
import { carbApi } from './services/api';

const result = await carbApi.checkVIN('1FUJGLDR12LM12345');

if (result.success) {
  console.log('Compliant:', result.data.compliant);
  console.log('Details:', result.data.details);
}
```

### Saving Test Results

**Flow:**
1. Tester completes test
2. App uploads photos to GCS
3. App calls `dr-gilly-ai-service/analyze-photos`
4. App saves test record via `carb-clean-truck-api/api/tests`

**Example:**

```typescript
await carbApi.saveTest({
  vin: '1FUJGLDR12LM12345',
  customer_name: 'ABC Trucking',
  customer_phone: '+14155551234',
  result: 'PASS',
  photos: ['gs://bucket/photo1.jpg'],
  notes: 'Clean burn, no visible smoke',
});
```

---

## 🔐 Authentication

### Current Implementation

The app uses token-based auth:

```typescript
import { carbApi } from './services/api';

// Set auth token (from Firebase Auth, custom auth, etc.)
carbApi.setAuthToken('eyJhbGciOiJIUzI1NiIs...');

// All subsequent requests include token
await carbApi.getUserProfile('user123');
```

### Required by Cloud Run Services

Your backend should validate tokens:

```python
# Example Cloud Run service validation
@app.route('/api/tests', methods=['POST'])
def create_test():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')

    # Validate token
    if not validate_token(token):
        return jsonify({'error': 'Unauthorized'}), 401

    # Process request
    data = request.json
    # ... save to Firestore/Cloud SQL
```

---

## 🧪 Testing the Integration

### 1. Test Dr. Gilly Service

```bash
curl -X POST https://dr-gilly-ai-service-xxx.run.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is CARB?",
    "context": {"role": "CARB expert"}
  }'
```

Expected: JSON response with AI-generated answer

### 2. Test VIN Check API

```bash
curl -X POST https://carb-clean-truck-api-xxx.run.app/api/vin/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"vin": "1FUJGLDR12LM12345"}'
```

Expected: Compliance status and vehicle details

### 3. Test from Mobile App

```bash
cd CARBCleanTruckCheck-DrG
npm install
npx expo start

# In app:
# 1. Go to Dr. G tab
# 2. Send message "What is CARB?"
# 3. Check console for API calls
```

---

## 📊 Expected API Responses

### VIN Check Response

```json
{
  "success": true,
  "data": {
    "vin": "1FUJGLDR12LM12345",
    "compliant": true,
    "details": [
      "2012 Freightliner Cascadia",
      "Diesel engine",
      "Subject to CARB Heavy-Duty regulation",
      "Next test due: 2025-06-15"
    ],
    "vehicle": {
      "year": 2012,
      "make": "Freightliner",
      "model": "Cascadia",
      "engine_type": "diesel",
      "gvwr": 80000
    }
  }
}
```

### Test Save Response

```json
{
  "success": true,
  "data": {
    "test_id": "test_abc123",
    "vin": "1FUJGLDR12LM12345",
    "result": "PASS",
    "timestamp": "2025-11-29T00:15:30Z",
    "report_url": "https://storage.googleapis.com/carb-reports/abc123.pdf"
  }
}
```

---

## 🚨 Error Handling

The mobile app handles these error scenarios:

**Network Errors:**
- Offline mode (shows cached data)
- Retry with exponential backoff
- User-friendly error messages

**API Errors:**
- 401 Unauthorized → Prompt re-login
- 403 Forbidden → Upgrade subscription message
- 429 Rate Limited → Wait and retry
- 500 Server Error → Show error, allow retry

**Example in App:**

```typescript
try {
  const result = await carbApi.checkVIN(vin);
  if (!result.success) {
    Alert.alert('Error', result.error);
  }
} catch (error) {
  Alert.alert('Connection Error', 'Please check your internet connection');
}
```

---

## 📦 GCS Bucket Integration

### Reading from carb-clean-truck-data

The mobile app doesn't directly access GCS. Instead:

1. **Via API Service:**
   ```
   Mobile App → carb-clean-truck-api → carb-clean-truck-data (GCS)
   ```

2. **For Photos/Reports:**
   - App uploads to GCS via signed URLs from API
   - API generates signed URL with `generateSignedUrl()`
   - App uses URL to upload directly to GCS

**Example Flow:**

```typescript
// 1. Request signed URL from API
const { signedUrl } = await carbApi.getUploadUrl('photo.jpg');

// 2. Upload photo directly to GCS
await fetch(signedUrl, {
  method: 'PUT',
  body: photoBlob,
  headers: { 'Content-Type': 'image/jpeg' },
});

// 3. Save test with photo URL
await carbApi.saveTest({
  photos: ['gs://carb-clean-truck-data/photos/photo.jpg'],
  // ... other data
});
```

---

## 🔧 Next Steps

### Once You Provide Service Account Key:

1. **I'll configure:**
   - Mobile app environment variables
   - API endpoint URLs
   - Authentication flow

2. **I'll test:**
   - Dr. Gilly chat integration
   - VIN check API calls
   - Photo upload to GCS
   - Test result saving

3. **I'll document:**
   - API request/response examples
   - Error codes and handling
   - Rate limits and quotas

---

## 📞 Questions to Answer

Before full integration, please provide:

1. **Load Balancer URL:**
   - What's the public URL for `global-lb-frontend`?

2. **Dr. Gilly Service URL:**
   - What's the URL for `dr-gilly-ai-service`?

3. **Authentication Method:**
   - Firebase Auth?
   - Custom JWT?
   - API keys?

4. **API Schema:**
   - Do your Cloud Run services match the expected endpoints above?
   - Any additional endpoints I should integrate?

5. **Service Account Key:**
   - Ready to provide the JSON key for testing?

---

**Ready to integrate once you provide the Service Account key and Cloud Run URLs!** 🚀

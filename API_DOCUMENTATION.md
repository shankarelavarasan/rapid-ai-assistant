# 📚 Rapid AI Store - API Documentation

**Base URL**: `https://rapid-saas-ai-store.onrender.com`

## 🔗 Quick Links
- [Authentication](#authentication)
- [AI Store APIs](#ai-store-apis)
- [Partnership APIs](#partnership-apis)
- [Payment APIs](#payment-apis)
- [AI Services](#ai-services)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

Currently, the API is open for development. In production, you'll need to implement authentication:

```javascript
// Future authentication header
headers: {
  'Authorization': 'Bearer your-jwt-token',
  'Content-Type': 'application/json'
}
```

---

## 🏪 AI Store APIs

### Get All Apps
```http
GET /api/store/apps
```

**Query Parameters:**
- `category` (string): Filter by category
- `search` (string): Search query
- `sort` (string): Sort by `popular`, `rating`, `newest`, `price_low`, `price_high`
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `minRating` (number): Minimum rating filter
- `maxPrice` (number): Maximum price filter
- `featured` (boolean): Get only featured apps

**Example:**
```javascript
const response = await fetch('https://rapid-saas-ai-store.onrender.com/api/store/apps?category=ai-tools&sort=popular&limit=10');
const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "apps": [
    {
      "id": "app_123",
      "name": "AI Image Generator",
      "description": "Generate stunning images with AI",
      "category": "ai-tools",
      "rating": 4.8,
      "downloads": 15420,
      "price": 29.99,
      "developer": "TechCorp",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Get App Details
```http
GET /api/store/apps/:appId
```

**Example:**
```javascript
const response = await fetch('https://rapid-saas-ai-store.onrender.com/api/store/apps/app_123');
const app = await response.json();
```

### Publish New App
```http
POST /api/store/apps
```

**Request Body:**
```json
{
  "name": "My AI Tool",
  "description": "An amazing AI-powered application",
  "category": "productivity",
  "tags": ["ai", "productivity", "automation"],
  "version": "1.0.0",
  "price": 19.99,
  "website": "https://myapp.com",
  "supportEmail": "support@myapp.com"
}
```

### Download App
```http
POST /api/store/apps/:appId/download
```

**Request Body:**
```json
{
  "location": {
    "region": "US",
    "country": "United States"
  }
}
```

### Search Apps
```http
GET /api/store/search?q=ai%20tools
```

### Get Categories
```http
GET /api/store/categories
```

### Get Featured Apps
```http
GET /api/store/featured?limit=12
```

### Get Store Statistics
```http
GET /api/store/stats
```

### Generate AI Assets
```http
POST /api/store/ai/generate-assets
```

**Request Body:**
```json
{
  "appName": "My AI App",
  "category": "productivity",
  "description": "A productivity app powered by AI",
  "assetTypes": ["icons", "screenshots", "banners"]
}
```

---

## 🤝 Partnership APIs

### Register as Partner
```http
POST /api/partnership/register
```

**Request Body:**
```json
{
  "name": "John Developer",
  "email": "john@example.com",
  "company": "TechCorp Inc",
  "website": "https://techcorp.com",
  "description": "We build amazing AI tools"
}
```

### Get Partner Dashboard
```http
GET /api/partnership/dashboard/:partnerId
```

### Calculate Revenue Share
```http
POST /api/partnership/revenue-share
```

**Request Body:**
```json
{
  "partnerId": "partner_123",
  "revenue": 1000.00
}
```

### Process Partner Payout
```http
POST /api/partnership/payout
```

**Request Body:**
```json
{
  "partnerId": "partner_123",
  "amount": 850.00
}
```

### Get Partnership Tiers
```http
GET /api/partnership/tiers
```

### Get Partnership Programs
```http
GET /api/partnership/programs
```

### Get Partnership Analytics
```http
GET /api/partnership/analytics
```

---

## 💳 Payment APIs

### Process Payment
```http
POST /api/payment/process
```

**Request Body:**
```json
{
  "amount": 29.99,
  "currency": "USD",
  "method": "card",
  "userId": "user_123",
  "description": "AI Tool Purchase",
  "region": "US"
}
```

### Create Subscription
```http
POST /api/payment/subscription
```

**Request Body:**
```json
{
  "planId": "professional",
  "userId": "user_123",
  "trialDays": 14
}
```

### Cancel Subscription
```http
DELETE /api/payment/subscription/:subscriptionId?immediate=false
```

### Process Refund
```http
POST /api/payment/refund
```

**Request Body:**
```json
{
  "transactionId": "txn_123",
  "amount": 29.99,
  "reason": "Customer request"
}
```

### Get Subscription Plans
```http
GET /api/payment/plans
```

### Get Supported Currencies
```http
GET /api/payment/currencies
```

### Convert Currency
```http
POST /api/payment/convert-currency
```

**Request Body:**
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "EUR"
}
```

### Get Payment Providers
```http
GET /api/payment/providers?region=US
```

### Get Payment Analytics
```http
GET /api/payment/analytics?timeRange=30d
```

---

## 🤖 AI Services

### Process with Gemini AI
```http
POST /api/ask-gemini
```

**Request Body:**
```json
{
  "prompt": "Generate a description for an AI productivity app",
  "outputFormat": "json",
  "saveOutput": false
}
```

### Process Files with AI
```http
POST /api/ask-gemini/folder
```

### Get Job Status
```http
GET /api/job/:jobId
```

### Get Templates
```http
GET /api/templates
```

---

## 🌐 Global & System APIs

### Get Optimal Region
```http
POST /api/store/global/optimal-region
```

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "serviceType": "api"
}
```

### Health Check
```http
GET /health
```

### API Information
```http
GET /api
```

### Store Health
```http
GET /api/store/health
```

---

## 📱 Frontend Integration Examples

### React/JavaScript Integration

```javascript
// API Client Class
class RapidAIStoreAPI {
  constructor(baseURL = 'https://rapid-saas-ai-store.onrender.com') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get apps
  async getApps(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/store/apps?${queryString}`);
  }

  // Search apps
  async searchApps(query, filters = {}) {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/store/search?${queryString}`);
  }

  // Get app details
  async getAppDetails(appId) {
    return this.request(`/api/store/apps/${appId}`);
  }

  // Download app
  async downloadApp(appId, location = {}) {
    return this.request(`/api/store/apps/${appId}/download`, {
      method: 'POST',
      body: JSON.stringify({ location })
    });
  }

  // Generate AI assets
  async generateAssets(appData) {
    return this.request('/api/store/ai/generate-assets', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
  }

  // Get subscription plans
  async getSubscriptionPlans() {
    return this.request('/api/payment/plans');
  }

  // Create subscription
  async createSubscription(subscriptionData) {
    return this.request('/api/payment/subscription', {
      method: 'POST',
      body: JSON.stringify(subscriptionData)
    });
  }
}

// Usage Example
const api = new RapidAIStoreAPI();

// Get featured apps
const featuredApps = await api.getApps({ featured: true, limit: 6 });

// Search for AI tools
const searchResults = await api.searchApps('productivity', { 
  category: 'ai-tools',
  minRating: 4.0 
});

// Generate assets for new app
const assets = await api.generateAssets({
  appName: 'My AI Tool',
  category: 'productivity',
  description: 'An amazing productivity tool'
});
```

### Vue.js Integration

```javascript
// Vue.js composable
import { ref, reactive } from 'vue';

export function useRapidAIStore() {
  const loading = ref(false);
  const error = ref(null);
  const apps = ref([]);
  
  const api = reactive({
    baseURL: 'https://rapid-saas-ai-store.onrender.com'
  });

  async function fetchApps(params = {}) {
    loading.value = true;
    error.value = null;
    
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${api.baseURL}/api/store/apps?${queryString}`);
      const data = await response.json();
      
      if (data.success) {
        apps.value = data.apps;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    apps,
    fetchApps
  };
}
```

---

## ❌ Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Error Handling Example
```javascript
async function handleAPICall() {
  try {
    const response = await fetch('https://rapid-saas-ai-store.onrender.com/api/store/apps');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    // Handle error appropriately
    throw error;
  }
}
```

---

## 🔄 Rate Limiting

The API implements rate limiting:
- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP
- **Headers**: Rate limit info in response headers

```javascript
// Check rate limit headers
const response = await fetch('/api/store/apps');
console.log('Rate Limit:', response.headers.get('X-RateLimit-Limit'));
console.log('Remaining:', response.headers.get('X-RateLimit-Remaining'));
console.log('Reset:', response.headers.get('X-RateLimit-Reset'));
```

---

## 🧪 Testing Your Integration

### Test API Connectivity
```javascript
// Test basic connectivity
async function testConnection() {
  try {
    const response = await fetch('https://rapid-saas-ai-store.onrender.com/health');
    const health = await response.json();
    console.log('API Status:', health.status);
    return health.status === 'healthy';
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}
```

### Test App Listing
```javascript
// Test app listing
async function testAppListing() {
  try {
    const response = await fetch('https://rapid-saas-ai-store.onrender.com/api/store/apps?limit=5');
    const data = await response.json();
    console.log('Apps loaded:', data.apps.length);
    return data.success;
  } catch (error) {
    console.error('App listing failed:', error);
    return false;
  }
}
```

---

## 📞 Support & Resources

- **API Status**: https://rapid-saas-ai-store.onrender.com/health
- **Frontend Demo**: https://shankarelavarasan.github.io/rapid-saas-ai-store/
- **GitHub Repository**: https://github.com/shankarelavarasan/rapid-ai-assistant
- **Issues**: Create issues on GitHub for bug reports

---

**Happy coding! 🚀 Your AI Store API is ready to power the next generation of AI applications.**
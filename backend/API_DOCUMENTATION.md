# API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require: `Authorization: Bearer <token>`

---

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

Response 201:
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response 200:
{
  "user": { ... },
  "token": "..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "..."
  }
}
```

---

## Business Management

### Create Business
```http
POST /business/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "TechStart Inc",
  "industry": "Technology",
  "description": "AI-powered software solutions for modern businesses",
  "targetAudience": "Tech-savvy entrepreneurs aged 25-45",
  "brandTone": "innovative, approachable, and professional",
  "socialLinks": {
    "twitter": "https://twitter.com/techstart",
    "linkedin": "https://linkedin.com/company/techstart"
  },
  "logoUrl": "https://example.com/logo.png",
  "brandColors": {
    "primary": "#6366F1",
    "secondary": "#8B5CF6",
    "accent": "#F59E0B"
  },
  "goals": [
    "Increase brand awareness by 50%",
    "Generate 1000 qualified leads per month",
    "Build engaged community of 10k followers"
  ]
}

Response 201:
{
  "id": "uuid",
  "userId": "uuid",
  "name": "TechStart Inc",
  "industry": "Technology",
  ...
}
```

### Get All Businesses
```http
GET /business/all
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "name": "TechStart Inc",
    "industry": "Technology",
    "agents": [
      { "id": "uuid", "agentName": "Marketing Manager", "createdAt": "..." }
    ],
    ...
  }
]
```

### Get Business by ID
```http
GET /business/:id
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "name": "TechStart Inc",
  "agents": [...],
  ...
}
```

### Update Business
```http
PUT /business/:id/edit
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "goals": ["New goal 1", "New goal 2"]
}

Response 200:
{
  "id": "uuid",
  "description": "Updated description",
  ...
}
```

### Delete Business
```http
DELETE /business/:id
Authorization: Bearer <token>

Response 200:
{
  "message": "Business deleted successfully"
}
```

---

## Agent Management

### Create Agent
```http
POST /agent/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessId": "uuid",
  "agentName": "Marketing Manager"
}

Response 201:
{
  "id": "uuid",
  "businessId": "uuid",
  "agentName": "Marketing Manager",
  "memory": "BUSINESS IDENTITY:\n- Name: TechStart Inc\n...",
  "createdAt": "..."
}
```

### Get Agent by ID
```http
GET /agent/:id
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "agentName": "Marketing Manager",
  "business": {
    "id": "uuid",
    "name": "TechStart Inc",
    ...
  },
  ...
}
```

### Get Agents by Business
```http
GET /agent/by-business/:businessId
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "agentName": "Marketing Manager",
    "createdAt": "..."
  },
  {
    "id": "uuid",
    "agentName": "Social Media Manager",
    "createdAt": "..."
  }
]
```

### Update Agent Memory
```http
POST /agent/:id/update-memory
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "memory": "Updated memory profile...",
  ...
}
```

### Delete Agent
```http
DELETE /agent/:id
Authorization: Bearer <token>

Response 200:
{
  "message": "Agent deleted successfully"
}
```

---

## Chat

### Send Message to Agent
```http
POST /agent/:agentId/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Create a social media strategy for our product launch next month"
}

Response 200:
{
  "message": "Based on TechStart Inc's innovative and approachable brand tone, here's a comprehensive social media strategy for your product launch:\n\n1. Pre-Launch Teaser Campaign (3 weeks before):\n- Create curiosity with countdown posts\n- Share behind-the-scenes development stories\n- Use brand colors #6366F1 and #8B5CF6 consistently\n\n2. Launch Week:\n- Live demo sessions on LinkedIn\n- Twitter thread explaining key features\n- User testimonial videos\n\n3. Post-Launch:\n- Case studies highlighting results\n- Community engagement challenges\n- Monthly feature spotlights\n\nTarget your tech-savvy entrepreneur audience with educational content that demonstrates value while maintaining our approachable tone.",
  "usage": {
    "prompt_tokens": 450,
    "completion_tokens": 320,
    "total_tokens": 770
  }
}
```

### Get Message History
```http
GET /agent/:agentId/messages
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "agentId": "uuid",
    "role": "user",
    "message": "Create a social media strategy...",
    "createdAt": "..."
  },
  {
    "id": "uuid",
    "agentId": "uuid",
    "role": "assistant",
    "message": "Based on TechStart Inc's innovative...",
    "createdAt": "..."
  }
]
```

---

## Content Generation

### Generate Content
```http
POST /agent/:agentId/content/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "post",
  "prompt": "Announce our new AI-powered analytics feature"
}

Types: "post", "caption", "ad", "blog", "email"

Response 201:
{
  "content": {
    "id": "uuid",
    "agentId": "uuid",
    "type": "post",
    "data": {
      "prompt": "Announce our new AI-powered analytics feature",
      "content": "🚀 Exciting news for TechStart Inc users!\n\nWe're thrilled to announce our brand-new AI-powered analytics feature that transforms how you understand your data.\n\nKey highlights:\n✨ Real-time insights powered by advanced AI\n📊 Predictive analytics for smarter decisions\n🎯 Customizable dashboards tailored to your goals\n\nReady to unlock the power of intelligent analytics?\n\nLearn more: [link]\n\n#TechInnovation #AIAnalytics #DataDriven #TechStart",
      "businessName": "TechStart Inc",
      "brandTone": "innovative and approachable",
      "generatedAt": "2024-01-01T00:00:00.000Z"
    },
    "createdAt": "..."
  },
  "usage": {
    "prompt_tokens": 380,
    "completion_tokens": 245,
    "total_tokens": 625
  }
}
```

### Get All Generated Content
```http
GET /agent/:agentId/content/all
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "agentId": "uuid",
    "type": "post",
    "data": {
      "prompt": "...",
      "content": "...",
      ...
    },
    "createdAt": "..."
  },
  ...
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}

or

{
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

Currently no rate limits implemented. Consider adding:
- 100 requests per 15 minutes per user
- 20 AI generations per hour per agent

## Pagination

For large datasets, add pagination:
```http
GET /agent/:agentId/messages?page=1&limit=50
```

(Not currently implemented - add as needed)

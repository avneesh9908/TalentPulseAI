# Interview Setup Unified Payload Documentation

## Overview
The interview setup endpoint (`POST /interview/setup`) combines all three interview setup steps into a **single unified payload**. This replaces making three separate API calls.

---

## Payload Structure

### Request: `InterviewSetupRequest`

```typescript
interface InterviewSetupRequest {
  setup_id: number;           // Identifier for setup (typically 0 for new session)
  experience: string;         // Experience level
  difficulty: string;         // Interview difficulty
  skills: string[];           // List of selected skills
  role: string;               // Job role
  profile_option: string;     // Profile type (existing or upload)
  profile_id?: string;        // Optional: existing profile ID
}
```

### Example Payload (JSON)

```json
{
  "setup_id": 0,
  "experience": "1-3",
  "difficulty": "medium",
  "skills": ["React", "TypeScript", "JavaScript", "Node.js"],
  "role": "frontend",
  "profile_option": "existing",
  "profile_id": "profile_123"
}
```

---

## Field Specifications

### `setup_id` (number)
- **Purpose**: Identifier for the setup instance
- **Type**: Integer
- **Default**: `0` (for new interview sessions)
- **Example**: `0`, `1`, `2`
- **Notes**: Used for tracking multiple setup attempts if needed

### `experience` (string)
- **Purpose**: Candidate's experience level
- **Valid Values**:
  - `"0-1"` → Fresher / Intern
  - `"1-3"` → Junior Developer
  - `"3-5"` → Mid-Level Developer
  - `"5-8"` → Senior Developer
  - `"8+"` → Lead / Staff Developer
- **Example**: `"3-5"`

### `difficulty` (string)
- **Purpose**: Interview difficulty level
- **Valid Values**:
  - `"easy"` → Fundamentals & basics
  - `"medium"` → Real interview level (default)
  - `"hard"` → FAANG / Top-tier companies
- **Example**: `"medium"`

### `skills` (string[])
- **Purpose**: Technologies/skills to be tested
- **Type**: Array of strings
- **Min Items**: 1 (recommended: 3-5)
- **Max Items**: 20
- **Examples**: 
  ```json
  ["React", "TypeScript", "CSS", "Next.js", "Redux"]
  ```
- **Suggested Skills List**:
  - Frontend: React, Vue, Angular, Svelte, TypeScript, JavaScript, HTML, CSS, Next.js, Nuxt, Jest, Webpack, Vite
  - Backend: Node.js, Express, NestJS, FastAPI, Django, Spring Boot, Java, Python, REST APIs, GraphQL
  - DevOps: Docker, Kubernetes, CI/CD, AWS, GCP, Azure, Terraform, GitLab CI
  - ML/AI: Python, PyTorch, TensorFlow, Scikit-learn, NLP, Computer Vision

### `role` (string)
- **Purpose**: Target job role
- **Valid Values**:
  - `"frontend"` → Frontend Developer
  - `"backend"` → Backend Developer
  - `"fullstack"` → Full Stack Developer
  - `"ml"` → ML / AI Engineer
  - `"data"` → Data Engineer
  - `"mobile"` → Mobile Developer (iOS/Android)
  - `"devops"` → DevOps / SRE
  - `"general"` → General interview
- **Example**: `"frontend"`

### `profile_option` (string)
- **Purpose**: How profile/resume will be provided
- **Valid Values**:
  - `"existing"` → Use existing profile on platform
  - `"upload"` → Upload resume/document
- **Example**: `"existing"`

### `profile_id` (string, optional)
- **Purpose**: Reference to existing profile when using `"existing"` option
- **Type**: String (UUID or DB ID)
- **Required When**: `profile_option === "existing"`
- **Example**: `"550e8400-e29b-41d4-a716-446655440000"`

---

## Response: `InterviewSetupResponse`

```typescript
interface InterviewSetupResponse {
  interview_id: string;              // Unique interview session ID
  setup_id: number;                  // Echo of setup_id from request
  user_id: string;                   // User who started interview
  role: string;                      // Interview role
  experience: string;                // Experience level
  difficulty: string;                // Interview difficulty
  skills: string[];                  // Selected skills
  profile_option: string;            // Profile option used
  status: string;                    // "initialized" for new session
  started_at: string;                // ISO 8601 timestamp
  message: string;                   // Success message
}
```

### Example Response

```json
{
  "interview_id": "interview_user123_1712910823",
  "setup_id": 0,
  "user_id": "user123",
  "role": "frontend",
  "experience": "1-3",
  "difficulty": "medium",
  "skills": ["React", "TypeScript", "JavaScript", "Node.js"],
  "profile_option": "existing",
  "status": "initialized",
  "started_at": "2024-04-11T10:47:03.000Z",
  "message": "Interview session initialized successfully"
}
```

---

## HTTP Request Example

### cURL
```bash
curl -X POST http://127.0.0.1:8000/interview/setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "setup_id": 0,
    "experience": "1-3",
    "difficulty": "medium",
    "skills": ["React", "TypeScript", "JavaScript", "Node.js"],
    "role": "frontend",
    "profile_option": "existing",
    "profile_id": "profile_123"
  }'
```

### JavaScript/TypeScript
```typescript
import { interviewService } from "@/services/interviewService";

const response = await interviewService.setupInterview({
  setup_id: 0,
  experience: "1-3",
  difficulty: "medium",
  skills: ["React", "TypeScript", "JavaScript", "Node.js"],
  role: "frontend",
  profile_option: "existing",
  profile_id: "profile_123"
});

console.log(response.interview_id); // Use this for subsequent requests
```

---

## Frontend Implementation

### Context Integration

```typescript
// contexts/interview-context.tsx
const setupInterview = useCallback(async () => {
  const payload: InterviewSetupRequest = {
    setup_id: 0,
    experience: experience!,
    difficulty: difficulty!,
    skills: skills,
    role: selectedRole!,
    profile_option: profileOption!,
  };

  const response = await interviewService.setupInterview(payload);
  setInterviewId(response.interview_id);
  setInterview(response);
}, [experience, difficulty, skills, selectedRole, profileOption]);
```

### Component Usage

```typescript
// From quick-setup.tsx after collecting all data
const { setupInterview } = useInterview();

const handleComplete = async () => {
  await setupInterview();  // No arguments needed - uses context state
  navigate('/interview/dashboard');
};
```

---

## Error Handling

### Validation Errors (400 Bad Request)

```json
{
  "detail": "Invalid experience level. Must be one of: ['0-1', '1-3', '3-5', '5-8', '8+']"
}
```

```json
{
  "detail": "Missing required fields: experience, difficulty, role, profile_option"
}
```

### Authorization Errors (401 Unauthorized)

```json
{
  "detail": "Not authenticated"
}
```

### Server Errors (500 Internal Server Error)

```json
{
  "detail": "Failed to setup interview: [error details]"
}
```

---

## Migration Guide

### OLD Flow (Three Separate Calls)
```typescript
// Step 1: Start interview
const interview = await interviewService.startInterview({
  user_id: userId,
  role: "frontend"
});

// Step 2: Save quick setup
await interviewService.saveProgress(interview.id, {
  step: 1,
  experience: "1-3",
  difficulty: "medium",
  skills: ["React", "TypeScript"]
});

// Step 3: Save role
await interviewService.saveProgress(interview.id, {
  step: 2,
  role: "frontend"
});

// Step 4: Save profile
await interviewService.saveProgress(interview.id, {
  step: 3,
  profile_option: "existing"
});
```

### NEW Flow (One Call)
```typescript
// All in one!
const response = await interviewService.setupInterview({
  setup_id: 0,
  experience: "1-3",
  difficulty: "medium",
  skills: ["React", "TypeScript"],
  role: "frontend",
  profile_option: "existing",
  profile_id: "profile_123"
});

// Interview ready to start immediately
const interviewId = response.interview_id;
```

---

## Benefits of Unified Payload

✅ **Single API Call**: Reduces network requests from 4 to 1  
✅ **Atomic Operation**: All data validated together, no partial state  
✅ **Better UX**: Faster setup, less latency  
✅ **Simpler Code**: Less state management in context  
✅ **Type-Safe**: Full TypeScript support  
✅ **Scalable**: Easy to add more fields without breaking flow  

---

## Database Schema (TODO)

The backend should store this as an Interview table:

```sql
CREATE TABLE interviews (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL FOREIGN KEY,
  setup_id INTEGER DEFAULT 0,
  experience VARCHAR(10) NOT NULL,
  difficulty VARCHAR(10) NOT NULL,
  skills JSON NOT NULL,
  role VARCHAR(20) NOT NULL,
  profile_option VARCHAR(10) NOT NULL,
  profile_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'initialized',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Next Steps

1. ✅ **Frontend**: Implement `setupInterview()` method in interview context
2. ✅ **Context**: Update state management to use single setup call
3. ⏳ **Backend**: Create Interview database model and store payload
4. ⏳ **Validation**: Add database constraints for valid values
5. ⏳ **Testing**: Add unit/integration tests for setup endpoint
6. ⏳ **Documentation**: Update API documentation in Swagger/OpenAPI

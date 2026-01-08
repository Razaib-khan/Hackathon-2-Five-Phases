---
name: frontend-backend-alignment
description: Ensures frontend and backend are perfectly aligned by validating API contracts, schemas, auth flows, and error handling whenever data crosses the frontend–backend boundary or integration issues are likely.
---

## Skill Instructions

When this Skill is active, Claude must act as a strict integration enforcer.

### Scope
This Skill applies only when both frontend and backend exist and communicate through APIs or shared data contracts.

### Mandatory Actions
1. Read the complete backend codebase and identify all public-facing APIs.
2. Read the complete frontend codebase and identify all API calls.
3. Compare request and response schemas field by field.
4. Validate:
   - HTTP methods and routes
   - Data types and required fields
   - Status codes and error formats
   - Authentication and session handling
5. Detect any mismatch, assumption, or undocumented behavior.

### Constraints
- Do not introduce new technologies or frameworks.
- Do not change behavior unless explici

# Research for AIDO Todo Application

## Decision: Task Priority System
**Rationale**: Implemented three-tier priority system (High, Medium, Low) as specified in the feature requirements. This provides users with a simple but effective way to categorize their tasks without overwhelming them with too many options.

**Alternatives considered**:
- 5-tier system (Urgent, High, Medium, Low, None): More granular but potentially confusing
- Numerical scale (1-5): Less intuitive for non-technical users
- Binary (High/Low only): Insufficient granularity for task management

## Decision: Authentication System
**Rationale**: Using Better Auth as specified in the technical requirements. This provides a secure, well-documented authentication solution that handles user registration, sign-in, and password reset flows.

**Alternatives considered**:
- Custom JWT implementation: Would require more development time and security considerations
- OAuth providers only: Doesn't meet requirement for email/password registration
- Third-party auth services: Less control over the authentication flow

## Decision: Database Solution
**Rationale**: Neon Serverless PostgreSQL was chosen as specified in the technical requirements. It provides a scalable, serverless solution that integrates well with the Python backend using SQLModel.

**Alternatives considered**:
- SQLite: Simpler but lacks scalability and serverless capabilities
- MongoDB: NoSQL approach but doesn't align with SQLModel usage
- Other cloud databases: Neon specifically mentioned in requirements

## Decision: Password Reset Token Expiration
**Rationale**: 10-minute expiration for password reset tokens provides a good balance between security and user convenience. Shorter timeframes might frustrate users, while longer ones increase security risks.

**Alternatives considered**:
- 1-hour expiration: More convenient but less secure
- 24-hour expiration: Too long for security-sensitive password reset tokens
- 5-minute expiration: More secure but potentially too restrictive for users

## Decision: Session Management
**Rationale**: 7-day session timeout provides a good user experience while maintaining reasonable security. Users don't need to re-authenticate frequently while still having sessions expire after a period of inactivity.

**Alternatives considered**:
- 1-hour timeout: More secure but requires frequent re-authentication
- 30-day timeout: More convenient but less secure
- No timeout: Insecure and not recommended for applications handling personal data

## Decision: Task Deletion Behavior
**Rationale**: Permanent deletion without recovery option simplifies the implementation and aligns with the "no overengineering" principle from the constitution. Users are warned before deletion occurs.

**Alternatives considered**:
- Soft delete with trash bin: More complex implementation with recovery options
- Automatic archiving: Would require additional system complexity
- Time-based deletion: Would require background jobs and additional logic
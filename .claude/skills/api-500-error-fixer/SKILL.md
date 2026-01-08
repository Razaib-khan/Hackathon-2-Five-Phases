---
name: api-500-error-fixer
description: Detects and fixes 500 Internal Server Errors in backend APIs by analyzing stack traces, identifying root causes, and suggesting or applying precise fixes. Must be used whenever any API call returns a 500 error.
---

## Skill Instructions

### Scope
- Applies to all backend API endpoints.
- Focuses on runtime errors causing 500 responses, unhandled exceptions, and mismanaged sessions or database issues.
- Does not alter business logic beyond fixing the error.

### Mandatory Actions
1. Detect API calls that return 500 errors.
2. Analyze logs, stack traces, and error messages to identify root causes.
3. Check for:
   - Null or undefined values
   - Missing database records or invalid queries
   - Authentication/session errors
   - Serialization or response formatting issues
4. Suggest or apply precise fixes:
   - Add missing error handling
   - Correct data queries
   - Ensure proper serialization
   - Validate input before processing
5. Verify that after the fix, the API no longer returns 500 errors and handles errors gracefully.

### Constraints
- Do not introduce new libraries or frameworks.
- Do not change API contract unless necessary to prevent the 500 error.
- Do not alter frontend code; focus only on backend errors.

### Trigger Condition
This Skill must be applied whenever any API call returns a 500 Internal Server Error.

### Output Requirements
- List all 500 errors detected with endpoint and line number.
- Show exact fixes applied or recommended.
- Confirm that the API responds successfully or with correct error codes.

### Success Criteria
The Skill is successful only when all 500 errors are resolved, and APIs fail gracefully for other error conditions.

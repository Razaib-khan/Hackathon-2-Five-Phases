---
name: typescript-error-fixer
description: Automatically detects and resolves TypeScript errors in frontend or backend code. This Skill should be applied whenever TypeScript compilation, type-checking, or linting errors occur.
---

## Skill Instructions

When this Skill is active, Claude acts as a strict TypeScript error resolver.

### Scope
- Applies to all TypeScript files in the codebase.
- Focuses on type errors, interface mismatches, missing imports, and invalid assignments.
- Should never modify functionality beyond fixing type correctness.

### Mandatory Actions
1. Run TypeScript compiler or type checker on the relevant code.
2. Identify all type errors, including:
   - Interface/Type mismatches
   - Missing or incorrect imports
   - Invalid assignments or function arguments
   - Generic type violations
   - Optional/undefined mismatches
3. Suggest or apply precise fixes:
   - Correct type annotations
   - Add or adjust imports
   - Fix function signatures
   - Update generics for compatibility
4. Validate that after fixes, the TypeScript compiler passes with no errors.

### Constraints
- Do not introduce new libraries or frameworks.
- Do not alter business logic or runtime behavior.
- Changes must be minimal and targeted strictly at type correctness.

### Trigger Condition
This Skill must be applied **whenever a TypeScript compiler or linter error is detected**, regardless of task context.

### Output Requirements
- List all TypeScript errors detected with file paths and line numbers.
- Show exact code fixes applied or recommended.
- Confirm successful type-check after fixes.

### Success Criteria
This Skill is successful only when the codebase is fully TypeScript-error-free and type-safe. No partial fixes are acceptable.

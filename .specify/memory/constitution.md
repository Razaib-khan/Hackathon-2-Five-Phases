<!--
Sync Impact Report (2025-12-26):
Version: 0.0.0 → 1.0.0
Change Type: MAJOR (Initial ratification)
Modified Principles: N/A (Initial creation)
Added Sections: All sections (initial creation)
Removed Sections: None
Templates Status:
  ✅ spec-template.md: Aligned (prioritized user stories match constitution)
  ✅ plan-template.md: Aligned (constitution check section ready)
  ✅ tasks-template.md: Aligned (user story organization matches principles)
  ⚠ commands/*.md: Not present in repository yet
Follow-up TODOs: None
-->

# Hackathon II Todo - Spec-Driven Development Constitution

## Core Principles

### I. Specification is the Single Source of Truth

**Specifications are authoritative.** All features, behaviors, and requirements MUST be defined in specifications before implementation. AI agents, developers, and automated tools MUST NOT invent, assume, or extrapolate features beyond what is explicitly documented in the specification.

**Rationale**: Prevents scope creep, ensures traceability, and maintains alignment between intent and implementation. Specifications serve as contracts between stakeholders and implementers.

### II. Spec-Driven Development is Mandatory

**Every feature begins with a specification.** The development workflow MUST follow this sequence:
1. Create feature specification (`spec.md`)
2. Generate implementation plan (`plan.md`)
3. Create task breakdown (`tasks.md`)
4. Execute implementation
5. Validate against specification

**No code may be written without a corresponding specification.** Ad-hoc features, exploratory coding, and "quick fixes" outside the spec-driven process are prohibited.

**Rationale**: Ensures deliberate design, prevents technical debt, enables validation, and creates a clear audit trail from requirement to implementation.

### III. Sequential Phase Execution (NON-NEGOTIABLE)

**Phases MUST be completed in order.** Each phase is a blocking gate for the next:
- **Phase 0**: Research and context gathering
- **Phase 1**: Design and architecture planning
- **Phase 2**: Task breakdown and dependency mapping
- **Phase 3**: Implementation (Red → Green → Refactor when tests are required)
- **Phase 4**: Validation and documentation

**No phase may begin until its prerequisite is complete and approved.** Phases cannot be skipped, reordered, or executed in parallel.

**Rationale**: Each phase builds on the outputs of the previous phase. Skipping phases leads to rework, misalignment, and failed implementations. Sequential execution ensures quality gates are respected.

### IV. No Overengineering or Premature Abstraction

**Build only what the specification requires.** Implementations MUST NOT include:
- Features or capabilities not in the specification
- Generic frameworks or abstractions "for future use"
- Complex patterns when simple solutions suffice
- Speculative code for hypothetical requirements

**Apply YAGNI (You Aren't Gonna Need It) rigorously.** If a capability is not in the current specification, it MUST NOT be implemented.

**Rationale**: Overengineering increases maintenance burden, introduces unnecessary complexity, and delays delivery. Abstractions should emerge from real requirements, not anticipated ones.

### V. Stateless Backend Logic by Default

**Backend services MUST be stateless when first introduced.** State should only be added when:
- Explicitly required by the specification
- Justified with a documented architectural decision (ADR)
- Unavoidable for the feature to function

**Session state, in-memory caching, and persistent connections MUST be avoided unless specified.** Prefer stateless APIs with client-side or external state management.

**Rationale**: Stateless services are easier to scale, test, and debug. State introduces complexity and failure modes that should be intentionally designed, not assumed.

### VI. AI Interactions via Tools and APIs

**AI agent capabilities MUST be exposed through well-defined tools and APIs.** Human-AI collaboration should use:
- Structured tool interfaces (MCP servers, CLI commands)
- Defined input/output contracts
- Programmatic APIs where applicable

**Free-form conversational requests are permitted for clarification and planning, but execution MUST use tools.** AI agents MUST NOT perform tasks through unstructured or implicit mechanisms.

**Rationale**: Tool-based interactions are auditable, testable, and reproducible. They create clear boundaries and prevent "magic" behavior.

### VII. Discourage Manual Coding

**Specifications drive automated implementation.** Manual coding should be minimized in favor of:
- Code generation from specifications
- Template-based artifact creation
- Automated task execution via agents

**Manual coding is permitted only when:**
- Code generation cannot handle the complexity
- Explicit user approval is given
- The task is clearly outside the scope of automation

**Rationale**: Manual coding introduces inconsistency and is error-prone. Automation ensures adherence to standards and accelerates delivery.

### VIII. Process Clarity Over UI Polish

**Internal processes and traceability are prioritized over user interface refinement.** Development efforts should focus on:
- Clear documentation and specifications
- Accurate task tracking and status
- Transparent decision-making (ADRs, PHRs)
- Reproducible workflows

**UI polish and aesthetic improvements are secondary.** Features should be functional and usable, but visual refinement is deferred unless explicitly specified.

**Rationale**: For development tooling and internal systems, clarity and correctness matter more than appearance. Polish can be added later once core functionality is validated.

### IX. Reusable Intelligence Artifacts

**Create intelligence artifacts when they provide lasting value.** Artifacts include:
- **Prompt History Records (PHRs)**: Document all user prompts and agent responses
- **Architecture Decision Records (ADRs)**: Capture significant architectural choices
- **Reusable Intelligence (RI)**: Codified patterns, templates, and knowledge

**Artifacts MUST be:**
- Stored in standardized locations (`history/prompts/`, `history/adr/`, `intelligence/`)
- Created automatically where possible (PHRs)
- Suggested intelligently (ADRs for significant decisions)
- Linked to relevant features and specifications

**Rationale**: Intelligence artifacts enable learning, consistency, and knowledge transfer. They prevent repeated mistakes and accelerate future development.

## Development Workflow

**Standard Feature Development Process:**

1. **Specification** (`/sp.specify`): Define requirements, user stories, acceptance criteria
2. **Planning** (`/sp.plan`): Research context, design architecture, document decisions
3. **Task Breakdown** (`/sp.tasks`): Create actionable, dependency-ordered tasks
4. **Implementation** (`/sp.implement`): Execute tasks sequentially or in parallel where safe
5. **Validation**: Verify implementation matches specification
6. **Commit & PR** (`/sp.git.commit_pr`): Create commit and pull request with traceability

**All steps MUST follow templates and use designated tools.** Free-form development is prohibited.

## Quality Gates

**Pre-Implementation Gates:**
- ✅ Specification complete with user stories and acceptance criteria
- ✅ Constitution check passed (no principle violations)
- ✅ Plan approved with architecture documented
- ✅ Tasks created with dependencies mapped

**Post-Implementation Gates:**
- ✅ All tasks completed and checked off
- ✅ Implementation matches specification (manual or automated verification)
- ✅ PHR created for the implementation session
- ✅ ADR created for significant architectural decisions

**No feature may be merged without passing all gates.**

## Security and Safety

**Hardcoded secrets are FORBIDDEN.** Credentials, API keys, and tokens MUST:
- Be stored in `.env` files (excluded from version control)
- Use environment variables or secure vaults
- Be documented in setup guides but never committed

**Input validation MUST be implemented** for all user-facing interfaces and APIs. Do not trust user input.

**Error handling MUST be explicit.** Errors should be logged, surfaced appropriately, and never silently ignored.

## Constraints and Non-Goals

**Constraints:**
- No backend state without justification
- No features outside specifications
- No phase skipping
- No manual coding without approval

**Non-Goals:**
- UI polish and visual design (unless specified)
- Performance optimization beyond requirements
- Support for hypothetical future requirements
- Backward compatibility with unspecified systems

## Governance

**The constitution supersedes all other practices.** In case of conflict between this constitution and other documentation, team conventions, or historical practices, this constitution takes precedence.

**Amendments require:**
1. Documented rationale for the change
2. Impact analysis on existing templates and workflows
3. Semantic version update (MAJOR/MINOR/PATCH)
4. Migration plan for in-flight features

**All PRs, reviews, and implementations MUST verify compliance** with constitutional principles. Violations require explicit justification documented in an ADR.

**Complexity and exceptions MUST be justified.** Any violation of constitutional principles (e.g., adding state, manual coding, premature abstraction) requires:
- A written justification explaining why it's necessary
- Documentation of simpler alternatives considered and rejected
- Approval from project stakeholders

**Runtime development guidance** is provided in `CLAUDE.md` for AI agents and `.specify/templates/` for artifact structure.

**Version**: 1.0.0 | **Ratified**: 2025-12-26 | **Last Amended**: 2025-12-26

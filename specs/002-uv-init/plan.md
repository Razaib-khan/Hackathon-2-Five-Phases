# Implementation Plan: UV Package Manager Initialization

**Branch**: `002-uv-init` | **Date**: 2025-12-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-uv-init/spec.md`

## Summary

Initialize UV package manager for the existing Python CLI Todo application by creating configuration files (`pyproject.toml`, `.python-version`), updating `.gitignore`, and documenting UV workflows. The implementation preserves all existing source code without modifications and maintains backward compatibility with direct Python execution.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: None (stdlib only, per Phase 1 spec)
**Storage**: N/A (in-memory only)
**Testing**: Manual verification (no test framework yet)
**Target Platform**: Cross-platform (Linux/macOS/Windows with Python 3.11+)
**Project Type**: Single project (src/ structure)
**Performance Goals**: UV initialization < 1 minute, dependency operations < 30 seconds
**Constraints**: Zero source code modifications, maintain direct `python3 src/todo.py` compatibility
**Scale/Scope**: Small CLI application (~300 lines Python code, 0 external dependencies currently)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I: Specification is Single Source of Truth** ✅ PASS
- All UV configuration requirements defined in spec.md
- No assumptions beyond specification

**Principle II: Spec-Driven Development is Mandatory** ✅ PASS
- Following standard workflow: spec → plan → tasks → implement
- This plan created from approved specification

**Principle III: Sequential Phase Execution** ✅ PASS
- Phase 0: Research UV best practices and configuration options
- Phase 1: Design configuration files and documentation structure
- Phase 2: Task breakdown (separate `/sp.tasks` command)
- Phase 3: Implementation

**Principle IV: No Overengineering or Premature Abstraction** ✅ PASS
- Only creating files specified in requirements (pyproject.toml, .python-version, .gitignore updates, documentation)
- No custom UV plugins, wrappers, or abstractions
- Using UV's default conventions

**Principle V: Stateless Backend Logic by Default** ✅ PASS (N/A)
- UV initialization is tooling setup, not backend logic
- No state introduced

**Principle VI: AI Interactions via Tools and APIs** ✅ PASS
- Using standard UV CLI commands (uv init, uv add, uv sync)
- No custom AI integrations

**Principle VII: Discourage Manual Coding** ✅ PASS
- UV configuration files are declarative (TOML, not code)
- Minimal manual editing required

**Principle VIII: Process Clarity Over UI Polish** ✅ PASS
- Focus on correct configuration and clear documentation
- No UI components involved

**Principle IX: Reusable Intelligence Artifacts** ✅ PASS
- Will create PHR for planning and implementation sessions
- No ADR needed (using standard UV conventions, no significant decisions)

**GATE RESULT**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-uv-init/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (UV best practices)
├── quickstart.md        # Phase 1 output (UV workflow guide)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Existing structure (unchanged)
src/
├── task.py              # Task model (existing, no changes)
├── task_manager.py      # CRUD operations (existing, no changes)
├── cli_parser.py        # Argument parsing (existing, no changes)
└── todo.py              # Main entry point (existing, no changes)

tests/                   # Empty directory (existing)

# New UV configuration files (to be created)
pyproject.toml           # UV project configuration
.python-version          # Python version specification (3.11)
.gitignore               # Updated with UV-specific ignores

# UV-managed (auto-generated, excluded from git)
.venv/                   # Virtual environment (if using local mode)
uv.lock                  # Dependency lock file (when dependencies added)
```

**Structure Decision**: Single project structure maintained. UV configuration added at repository root. No changes to existing `src/` or `tests/` directories per FR-004.

## Complexity Tracking

No constitutional violations. This section intentionally left empty.

---

## Phase 0: Research & Context Gathering

### Research Tasks

1. **UV Configuration Best Practices**
   - Research: Standard pyproject.toml structure for Python applications
   - Research: UV-specific configuration options and defaults
   - Research: Python version specification strategies (.python-version vs pyproject.toml)
   - Output: Recommended configuration format

2. **Virtual Environment Strategy**
   - Research: UV virtual environment location options (local .venv vs global cache)
   - Research: Compatibility with existing Python execution methods
   - Output: Chosen strategy and rationale

3. **.gitignore Patterns**
   - Research: Standard UV-related files and directories to exclude
   - Research: Virtual environment ignore patterns
   - Output: Patterns to add to .gitignore

4. **Workflow Documentation Standards**
   - Research: Common UV workflow patterns (init, sync, add, run)
   - Research: Project-specific documentation best practices
   - Output: Documentation structure for quickstart.md

### Output Artifact

**File**: `research.md`

**Required Sections**:
- UV Configuration Options (decision + rationale)
- Virtual Environment Location (decision + rationale)
- .gitignore Patterns (final list)
- Workflow Documentation Structure (outline)

---

## Phase 1: Design & Contracts

### 1.1 Configuration Design

**File**: `pyproject.toml` (design documented, file created in implementation)

**Contents**:
```toml
[project]
name = "hackathon-ii-todo"
version = "0.1.0"
description = "CLI Todo Application - Spec-Driven Development Demo"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
# UV-specific configuration (if needed based on research)
```

**Rationale**:
- `requires-python = ">=3.11"` matches Phase 1 specification
- `dependencies = []` initially (project uses only stdlib)
- Standard hatchling build backend for future packaging compatibility

**File**: `.python-version`

**Contents**:
```
3.11
```

**Rationale**: Matches existing project requirement, enables automatic Python version selection

### 1.2 .gitignore Updates

**Additions**:
```gitignore
# UV
.venv/
uv.lock
__pypackages__/
```

**Rationale**: Excludes UV-managed files from version control while preserving pyproject.toml

### 1.3 Workflow Documentation

**File**: `quickstart.md`

**Structure**:
1. **Prerequisites**: UV installation instructions (external link)
2. **Initial Setup**: `uv sync` to create virtual environment
3. **Running the Application**:
   - Direct: `python3 src/todo.py <command>`
   - UV-managed: `uv run python src/todo.py <command>`
4. **Adding Dependencies**: `uv add <package>` workflow
5. **Development Workflow**: Common commands and patterns
6. **Troubleshooting**: Common issues and solutions

---

## Phase 2: Tasks (Separate Command)

**Note**: Task breakdown will be generated by `/sp.tasks` command based on this plan and the specification.

**Expected Task Categories**:
1. Create configuration files (pyproject.toml, .python-version)
2. Update .gitignore
3. Create documentation (quickstart.md, update main README)
4. Validate existing code still works
5. Test UV workflows (sync, add, run)

---

## Post-Design Constitution Re-Check

**Re-evaluation after Phase 1 design**:

All principles remain satisfied:
- ✅ No overengineering: Using standard UV conventions, no custom tooling
- ✅ No premature abstraction: Straightforward configuration files
- ✅ Stateless: Tooling setup only
- ✅ Spec adherence: All design decisions map to functional requirements

**GATE RESULT**: ✅ CONSTITUTION CHECK PASSED - Ready for `/sp.tasks`

---

## Success Criteria Mapping

| Success Criterion | Implementation Approach |
|-------------------|------------------------|
| SC-001: Init < 1 minute | Single `uv init` command + manual pyproject.toml edits |
| SC-002: Zero functionality impact | No changes to src/ files |
| SC-003: Dependencies < 30 seconds | Standard `uv add` command |
| SC-004: Setup < 2 minutes | `uv sync` installs everything |
| SC-005: Zero code modifications | FR-004 enforced, src/ untouched |
| SC-006: 100% documentation clarity | Comprehensive quickstart.md |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| UV not installed on dev machine | Blocks setup | Document installation in quickstart.md |
| Python version mismatch | Runtime errors | .python-version enforces 3.11+ |
| Conflict with existing Python tools | Confusion | Clear documentation on direct vs UV execution |
| UV cache location unclear | Developer friction | Research and document in Phase 0 |

---

## Next Steps

1. **Immediate**: Generate research.md (Phase 0)
2. **After Research**: Finalize configuration designs
3. **After Design**: Run `/sp.tasks` to generate tasks.md
4. **After Tasks**: Run `/sp.implement` to execute implementation

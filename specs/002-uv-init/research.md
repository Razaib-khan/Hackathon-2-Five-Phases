# Research: UV Package Manager Initialization

**Feature**: 002-uv-init
**Date**: 2025-12-27
**Purpose**: Research UV best practices and configuration options for Python project initialization

## 1. UV Configuration Best Practices

### Decision: Standard pyproject.toml with PEP 621 Metadata

**Chosen Approach**:
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
```

**Rationale**:
- PEP 621 is the standard for Python project metadata
- UV natively supports pyproject.toml-based configuration
- Hatchling is UV's recommended lightweight build backend
- `requires-python` enforces minimum version (matches our 3.11+ requirement)
- Empty `dependencies = []` initially since project uses only stdlib

**Alternatives Considered**:
- **setup.py**: Rejected - legacy approach, UV prefers pyproject.toml
- **Poetry-style config**: Rejected - adds unnecessary Poetry-specific sections
- **requirements.txt**: Rejected - not the modern standard, limited metadata

**References**:
- PEP 621: Python Project Metadata
- UV documentation: Recommends pyproject.toml as primary configuration

---

## 2. Virtual Environment Strategy

### Decision: Local .venv Directory

**Chosen Approach**:
- UV will create `.venv/` in project root
- Virtual environment excluded from git via .gitignore
- Compatible with both direct Python execution and UV-managed execution

**Rationale**:
- **Developer Experience**: Local .venv is easy to locate and understand
- **IDE Integration**: Most IDEs auto-detect .venv in project root
- **Compatibility**: Works with existing `python3 src/todo.py` execution (no activation needed for direct execution)
- **Isolation**: Each project has its own environment, avoiding global pollution
- **Tooling Support**: Standard Python tooling recognizes .venv

**Alternatives Considered**:
- **Global UV Cache**: Rejected - less transparent, harder for developers to inspect
- **System venv**: Rejected - pollutes global Python installation
- **Named venv**: Rejected - .venv is the convention

**Configuration**:
No explicit UV configuration needed - `.venv/` is UV's default when running `uv sync` or `uv venv`

---

## 3. .gitignore Patterns

### Decision: Standard UV and Python Patterns

**Patterns to Add**:
```gitignore
# UV Package Manager
.venv/
uv.lock
__pypackages__/

# Python (already present, verify completeness)
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST
```

**Rationale**:
- `.venv/`: Local virtual environment (large, machine-specific)
- `uv.lock`: Lock file (will be committed once dependencies are added, but initially not needed)
- `__pypackages__/`: Alternative package installation location (rarely used but UV-compatible)
- Python patterns: Standard exclusions for compiled files and build artifacts

**Note**: The existing .gitignore already has Python patterns. We'll add UV-specific patterns only.

---

## 4. Workflow Documentation Structure

### Decision: Comprehensive Quickstart Guide

**Documentation Structure for `quickstart.md`**:

1. **Prerequisites**
   - UV installation (link to official docs)
   - Python 3.11+ verification

2. **Initial Project Setup**
   - Clone repository
   - Run `uv sync` to create virtual environment

3. **Running the CLI Todo Application**
   - **Method 1 - Direct execution**: `python3 src/todo.py <command>`
   - **Method 2 - UV-managed**: `uv run python src/todo.py <command>`
   - Explain when to use each method

4. **Adding Dependencies (Future)**
   - `uv add <package>` - adds to pyproject.toml and installs
   - `uv sync` - installs all dependencies from pyproject.toml
   - Example: `uv add requests`

5. **Common UV Commands**
   - `uv init` - Initialize new project (already done)
   - `uv sync` - Install dependencies
   - `uv add` - Add new dependency
   - `uv remove` - Remove dependency
   - `uv run` - Run command in UV environment
   - `uv pip` - Direct pip-like interface

6. **Development Workflow**
   - Making code changes (no activation needed for direct execution)
   - Running commands via UV
   - Updating dependencies

7. **Troubleshooting**
   - UV not found → Installation instructions
   - Python version mismatch → .python-version specifies 3.11
   - Permission errors → Check UV cache permissions
   - Virtual environment issues → Remove .venv and re-run `uv sync`

**Rationale**:
- **Comprehensive**: Covers all user stories (P1-P3)
- **Practical**: Shows actual commands, not just theory
- **Progressive**: Starts simple, adds complexity
- **Troubleshooting**: Addresses edge cases from spec

**Alternatives Considered**:
- **Minimal README section**: Rejected - insufficient for P3 user story
- **Separate docs per command**: Rejected - overkill for simple project
- **Link-only to UV docs**: Rejected - doesn't provide project-specific guidance

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Configuration | PEP 621 pyproject.toml | Modern standard, UV-native support |
| Venv Location | Local .venv/ | Developer-friendly, IDE-compatible |
| .gitignore | Add .venv/, uv.lock, __pypackages__/ | Exclude generated files |
| Documentation | Comprehensive quickstart.md | Meets P3 user story requirements |

---

## Implementation Readiness

All research complete. No blockers identified. Ready to proceed to Phase 1 design finalization and then `/sp.tasks` for task breakdown.

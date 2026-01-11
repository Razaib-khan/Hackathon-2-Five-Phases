# Research: CLI Todo Application

**Feature**: 001-cli-todo
**Date**: 2025-12-26
**Phase**: Phase 0 - Research and Context Gathering

## Overview

Research to support technical decisions for a simple CLI todo application with in-memory storage.

## Research Areas

### 1. Language Selection

**Decision**: Python 3.11+

**Rationale**:
- Cross-platform compatibility (Linux, macOS, Windows)
- Rich standard library includes everything needed (argparse, dataclasses)
- Rapid development for simple CLI applications
- No compilation step - easy to run and test
- Widely available on most systems

**Alternatives Considered**:
- **Bash**: Too limited for structured data handling and validation
- **Node.js/JavaScript**: Requires runtime installation; Python more ubiquitous for CLI tools
- **Go/Rust**: Overkill for this simple application; compilation adds unnecessary complexity

### 2. CLI Parsing Approach

**Decision**: argparse (Python standard library)

**Rationale**:
- Part of standard library (no external dependencies)
- Mature, well-documented, stable
- Supports subcommands (create, list, update, delete, complete)
- Automatic help generation
- Built-in validation and error handling

**Alternatives Considered**:
- **click**: External dependency; against YAGNI principle
- **sys.argv manual parsing**: Error-prone; argparse provides better UX
- **docopt**: External dependency; less common than argparse

### 3. Data Storage Strategy

**Decision**: Python list of Task objects in memory

**Rationale**:
- Spec explicitly requires in-memory only (no persistence)
- Simple list preserves creation order (FR-005 requirement)
- Direct access by index or iteration for all operations
- No serialization/deserialization overhead
- Auto-incrementing IDs via list length + 1

**Alternatives Considered**:
- **Dictionary (ID → Task)**: More complex; list index serves same purpose
- **SQLite in-memory**: Overkill; violates "no database" exclusion
- **Pickle/JSON file**: Violates "no persistence" requirement

### 4. Task Model Structure

**Decision**: Python dataclass

**Rationale**:
- Clean syntax for defining Task attributes
- Automatic `__init__`, `__repr__`, `__eq__` methods
- Type hints for validation
- Immutability option if needed
- Part of standard library (Python 3.7+)

**Alternatives Considered**:
- **Plain dict**: Less structured; no type safety
- **Named tuple**: Immutable by default; updates would require replacement
- **Custom class**: More boilerplate than dataclass provides

### 5. Input Validation Strategy

**Decision**: Inline validation in TaskManager methods

**Rationale**:
- Simple validation rules (title not empty, length limits)
- Clear error messages at point of validation
- No need for separate validator classes
- Follows YAGNI - avoid abstraction for 2-3 validation rules

**Alternatives Considered**:
- **Pydantic**: External dependency; excessive for simple validation
- **Custom validator framework**: Premature abstraction
- **Schema library**: External dependency not needed

### 6. CLI Command Structure

**Decision**: Subcommand approach (todo create, todo list, etc.)

**Rationale**:
- Clear intent for each operation
- Matches common CLI patterns (git, docker)
- Argparse subcommands well-supported
- Easy to extend with additional commands later
- Natural mapping to CRUD operations

**Alternatives Considered**:
- **Flag-based** (todo --create "title"): Less intuitive; complex flag combinations
- **Interactive mode**: Not specified in requirements; adds complexity
- **Positional commands** (todo 1 "create" "title"): Unconventional; poor UX

## Technical Risks

### Risk 1: Unicode Handling in Terminal

**Impact**: Medium
**Mitigation**: Use UTF-8 encoding; test checkbox characters ([✓], [ ]) across platforms
**Fallback**: ASCII alternatives if Unicode unsupported (e.g., [X], [ ])

### Risk 2: Large Task Lists

**Impact**: Low
**Constraint**: 1000 tasks maximum (performance goal)
**Mitigation**: List operations are O(n); acceptable for n ≤ 1000
**Note**: If >1000 tasks needed, consider warning user

### Risk 3: Argument Parsing Edge Cases

**Impact**: Low
**Mitigation**: argparse handles most edge cases (quotes, special chars)
**Testing**: Include tests for empty strings, whitespace, special characters

## Dependencies

**Production**:
- Python 3.11+ (standard library only)

**Development/Testing**:
- pytest (if tests required)

**No external runtime dependencies** - aligns with simplicity principle.

## Performance Considerations

- List iteration: O(n) for display - acceptable for <1000 tasks
- ID lookup: O(n) worst case - acceptable for small n
- Task creation: O(1) append to list
- Task deletion: O(n) due to list removal
- Memory: ~1KB per task × 1000 tasks = ~1MB maximum

All operations well within "5 seconds" success criterion for expected load.

## Conclusion

All technical decisions resolved. No unknowns remaining. Ready to proceed to Phase 1 (Design).

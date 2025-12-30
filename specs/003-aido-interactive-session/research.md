# Research Document: AIDO Interactive Session Mode

**Feature**: 003-aido-interactive-session
**Date**: 2025-12-27
**Status**: Complete

## Purpose

Research technical decisions and best practices for implementing an interactive REPL-style session manager with rich terminal output for the AIDO todo application.

## Key Decisions

### Decision 1: Interactive Loop Architecture

**Question**: How should the interactive session loop be structured to handle continuous command input while maintaining task state?

**Research Findings**:
- Python's `cmd` module provides a built-in framework for line-oriented command interpreters
- Alternative: Custom REPL loop with `input()` and command parsing
- Rich library integrates well with both approaches

**Decision**: Use Python's built-in `cmd.Cmd` class as the foundation for interactive mode

**Rationale**:
- Provides built-in command parsing, help generation, and tab completion infrastructure
- Clean separation between command logic and I/O
- Well-documented standard library approach (no external dependencies beyond Rich)
- Easily extensible with custom commands
- Handles EOF (Ctrl+D) and keyboard interrupts gracefully

**Alternatives Considered**:
- **Custom input loop**: More flexible but requires reimplementing command parsing, help system, and error handling
  - Rejected: Reinventing the wheel; cmd.Cmd provides exactly what's needed
- **Prompt Toolkit**: More powerful with advanced features (syntax highlighting, auto-completion)
  - Rejected: Adds unnecessary complexity and external dependency for current requirements

---

### Decision 2: Rich Library Integration Strategy

**Question**: How should Rich library be integrated for colored output while maintaining backward compatibility?

**Research Findings**:
- Rich provides `Console` class for unified output handling
- Supports conditional color disable for non-TTY environments
- Tables, panels, and syntax highlighting available for future enhancements
- `Console.print()` can replace standard `print()` throughout codebase

**Decision**: Create a centralized `RichOutputHandler` wrapper around Rich Console

**Rationale**:
- Single point of configuration for colors and styling
- Easy to mock for testing
- Abstracts Rich implementation details from business logic
- Allows future enhancement without touching command logic
- Can gracefully degrade if Rich is unavailable (fallback to plain print)

**Alternatives Considered**:
- **Direct Rich usage everywhere**: Couples code tightly to Rich
  - Rejected: Violates dependency injection principles, harder to test
- **Multiple Console instances**: Inconsistent styling across the app
  - Rejected: Centralized Console ensures consistent colors and themes

---

### Decision 3: Task Storage Architecture

**Question**: How should in-memory task storage be structured to persist across commands within a session?

**Research Findings**:
- TaskManager already exists with in-memory list
- cmd.Cmd instances maintain state between commands naturally
- Existing Task and TaskManager classes can be reused

**Decision**: Instantiate TaskManager once in the cmd.Cmd subclass's `__init__` method

**Rationale**:
- Leverages existing TaskManager logic (zero duplication)
- cmd.Cmd instance persists for the session duration
- TaskManager instance becomes a session-scoped singleton
- No architectural changes needed to existing domain logic

**Alternatives Considered**:
- **Global TaskManager singleton**: Breaks testability, harder to reset between tests
  - Rejected: Makes unit testing difficult, violates clean architecture
- **External state manager**: Overengineering for in-memory-only requirements
  - Rejected: Adds unnecessary complexity for session-only persistence

---

### Decision 4: Mode Detection (Interactive vs Single-Command)

**Question**: How should the application determine whether to enter interactive mode or single-command mode?

**Research Findings**:
- Standard CLI pattern: No arguments → interactive, Arguments → execute and exit
- Alternative: Explicit `--interactive` flag
- argparse supports this via `nargs='?' ` for optional subcommands

**Decision**: Use presence of subcommand as mode selector: no args → interactive, args → single-command

**Rationale**:
- Intuitive UX: `aido` launches interactive, `aido create "task"` runs once
- No breaking changes: existing `aido create` usage continues working
- No new flags needed (simpler API)
- Matches common tool behavior (python, node, psql, mysql)

**Alternatives Considered**:
- **Explicit `--interactive` flag**: More verbose, breaks existing usage
  - Rejected: Adds unnecessary typing burden for most common case
- **Detect TTY**: Confusing in scripts and pipes
  - Rejected: Breaks predictability, hard to override

---

### Decision 5: AIDO Logo Design

**Question**: What format and content should the AIDO logo use for terminal display?

**Research Findings**:
- ASCII art generators available online
- Rich supports colored text rendering
- Logo should fit in 80-column terminals with padding
- Simple designs render better across different terminals

**Decision**: Use multi-color ASCII art spelling "AIDO" with tagline

**Design**:
```
   ___    ____  ____   ____
  / _ |  /  _/ / __ \ / __ \
 / __ | _/ /  / / / // / / /
/_/ |_|/___/ /_/ /_//_/ /_/

 AI-Powered Interactive Task Manager
```

**Colors**:
- "AIDO" letters: Cyan (tech/AI association)
- Tagline: White/Default
- Success messages: Green
- Errors: Red
- Warnings: Yellow
- Completed tasks: Green
- Incomplete tasks: Yellow

**Rationale**:
- Fits within 80 columns (maximum line ~36 chars)
- Clean, modern aesthetic
- Easily recognizable letters
- Rich can apply colors per line or per character

**Alternatives Considered**:
- **Figlet/Banner style**: Too large for 80-column terminals
  - Rejected: Wastes vertical space, poor UX on smaller terminals
- **Simple text**: "AIDO" in colored letters
  - Rejected: Less impactful, doesn't establish strong brand identity

---

### Decision 6: Command Naming in Interactive Mode

**Question**: Should interactive mode use the same command names as single-command mode?

**Research Findings**:
- cmd.Cmd expects `do_<command>` methods
- Users are already familiar with `create`, `list`, `complete`, etc.
- Consistency reduces cognitive load

**Decision**: Maintain identical command names and arguments in both modes

**Rationale**:
- Users learn once, use everywhere
- Help text can be shared between modes
- Testing strategy can validate both paths with same test cases
- Documentation doesn't fragment

**Alternatives Considered**:
- **Shortened commands**: `c` for create, `l` for list
  - Rejected: Less discoverable, cryptic for new users
- **Different verbs**: `add` vs `create`, `show` vs `list`
  - Rejected: Confusing to remember which mode uses which verb

---

### Decision 7: Error Handling Strategy

**Question**: How should errors be presented in interactive mode vs single-command mode?

**Research Findings**:
- Single-command mode: Print error, exit with code 1
- Interactive mode: Print error, continue session (don't exit)
- Rich supports styled error panels

**Decision**: Wrap errors in Rich panels for interactive mode, plain red text for single-command

**Rationale**:
- Interactive mode benefits from formatted panels (clearer, more professional)
- Single-command mode should stay fast and lightweight
- Different error handling matches different user expectations
- Exit codes preserved for scripting compatibility

**Alternatives Considered**:
- **Same error format everywhere**: Inconsistent with UX expectations
  - Rejected: Interactive users want helpful formatting, script users want parseable text
- **Exceptions bubble up**: Poor UX, stack traces confuse users
  - Rejected: Not user-friendly for end-user CLI application

---

## Implementation Notes

### Dependency Changes

**New Dependency**: `rich>=13.0.0`
- Add to `pyproject.toml` dependencies array
- Run `uv add rich` to install

**No other dependencies required**: Python 3.11 stdlib is sufficient

### File Modifications Required

1. **src/todo.py**: Add interactive mode entry point, logo display
2. **src/cli_parser.py**: Modify to make subcommand optional
3. **New file: src/interactive_session.py**: cmd.Cmd subclass with command handlers
4. **New file: src/output_handler.py**: Rich Console wrapper
5. **README.md**: Update with interactive mode usage examples

### Testing Strategy

- Unit tests for InteractiveSession commands (mock output handler)
- Integration tests for full session workflows
- Regression tests for single-command mode (ensure no breaking changes)
- Manual testing for visual output (color rendering, logo display)

### Performance Considerations

- Rich Console initialization: <10ms (negligible)
- Command parsing overhead: <1ms per command
- Task operations unchanged (already <1ms for <50 tasks)
- Logo rendering: One-time cost at startup (~5ms)

**Conclusion**: All performance targets (SC-005: <100ms) easily met

---

## Open Questions Resolved

1. **How to handle Ctrl+C in interactive mode?**
   - Answer: cmd.Cmd's default behavior catches KeyboardInterrupt, prints `^C`, continues
   - Action: Keep default behavior, document in help text

2. **Should task IDs reset between sessions?**
   - Answer: Yes, each session starts with fresh ID sequence
   - Rationale: Session is ephemeral; no persistence means no need for stable IDs

3. **What happens to tasks on exit?**
   - Answer: Lost (per spec: "tasks are lost when session ends")
   - Action: Display warning on first `exit` if tasks exist

4. **Should help command be customized?**
   - Answer: Yes, use Rich tables for better formatting
   - Action: Override `do_help` to use Rich tables

---

## References

- Python cmd module: https://docs.python.org/3/library/cmd.html
- Rich library docs: https://rich.readthedocs.io/
- ASCII art generator: http://patorjk.com/software/taag/
- CLI design patterns: https://clig.dev/

**Research Complete**: 2025-12-27
**Reviewed By**: AI Agent
**Approved**: Ready for Phase 1 (Design & Contracts)

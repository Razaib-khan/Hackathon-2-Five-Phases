# UV Quickstart Guide - Hackathon II Todo

**Project**: CLI Todo Application
**Package Manager**: UV (Python package and project manager)
**Python Version**: 3.11+

## Prerequisites

### Install UV

UV must be installed on your system. Choose one method:

**macOS/Linux**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows (PowerShell)**:
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Alternative - Using pip**:
```bash
pip install uv
```

Verify installation:
```bash
uv --version
```

### Verify Python 3.11+

```bash
python3 --version  # Should show 3.11 or higher
```

---

## Initial Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hackathon-ii-todo
```

### 2. Initialize UV Environment

```bash
uv sync
```

This command:
- Reads `pyproject.toml` to understand project requirements
- Creates a `.venv/` virtual environment in the project directory
- Installs all dependencies (currently none, project uses stdlib only)

You should see output like:
```
Using Python 3.11...
Creating virtualenv at .venv
Resolved 0 packages in 10ms
```

---

## Running the CLI Todo Application

The application can be run in two ways:

### Method 1: Direct Python Execution (Recommended for Development)

```bash
python3 src/todo.py --help
python3 src/todo.py create "Buy groceries" --description "Milk, eggs, bread"
python3 src/todo.py list
```

**When to use**: Daily development, quick testing, IDE integration

### Method 2: UV-Managed Execution

```bash
uv run python src/todo.py --help
uv run python src/todo.py create "Buy groceries" --description "Milk, eggs, bread"
uv run python src/todo.py list
```

**When to use**: Ensuring exact UV environment, CI/CD pipelines, reproducible execution

**Note**: Both methods work identically because the project currently has no external dependencies.

---

## Working with Dependencies

### Adding a New Dependency

When you need to add an external package:

```bash
uv add <package-name>
```

**Example**: Adding the `requests` library
```bash
uv add requests
```

This command:
1. Adds `requests` to `pyproject.toml` under `dependencies`
2. Installs the package in `.venv/`
3. Updates `uv.lock` with pinned versions

### Installing Dependencies (After Clone)

If someone else added dependencies:

```bash
uv sync
```

This installs all dependencies listed in `pyproject.toml`.

### Removing a Dependency

```bash
uv remove <package-name>
```

**Example**:
```bash
uv remove requests
```

---

## Common UV Commands Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `uv sync` | Install all dependencies from pyproject.toml | `uv sync` |
| `uv add` | Add new dependency | `uv add pytest` |
| `uv remove` | Remove dependency | `uv remove pytest` |
| `uv run` | Run command in UV environment | `uv run python src/todo.py list` |
| `uv pip list` | List installed packages | `uv pip list` |
| `uv pip freeze` | Export dependencies (pip-compatible) | `uv pip freeze` |
| `uv venv` | Create virtual environment manually | `uv venv` |

---

## Development Workflow

### Typical Development Session

1. **Pull latest changes**:
   ```bash
   git pull
   uv sync  # Install any new dependencies
   ```

2. **Make code changes** in `src/` directory

3. **Test your changes**:
   ```bash
   python3 src/todo.py create "Test task"
   python3 src/todo.py list
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

### Adding Development Tools

For testing, linting, or formatting tools:

```bash
uv add --dev pytest       # Testing framework
uv add --dev ruff         # Linter and formatter
uv add --dev mypy         # Type checker
```

The `--dev` flag adds these as development dependencies.

---

## Project Structure

```
hackathon-ii-todo/
├── src/                    # Application source code
│   ├── task.py
│   ├── task_manager.py
│   ├── cli_parser.py
│   └── todo.py
├── tests/                  # Test files (empty currently)
├── specs/                  # Feature specifications
├── .venv/                  # Virtual environment (git-ignored)
├── .python-version         # Python version requirement (3.11)
├── pyproject.toml          # Project configuration and dependencies
├── uv.lock                 # Dependency lock file (when dependencies added)
└── .gitignore              # Git ignore patterns
```

---

## Troubleshooting

### UV Command Not Found

**Problem**: `uv: command not found`

**Solution**: UV not installed or not in PATH
```bash
# Reinstall UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH (if needed)
export PATH="$HOME/.cargo/bin:$PATH"  # Linux/macOS
```

### Python Version Mismatch

**Problem**: UV complains about Python version

**Solution**: The project requires Python 3.11+
```bash
# Check your Python version
python3 --version

# Install Python 3.11+ if needed
# macOS: brew install python@3.11
# Ubuntu: sudo apt install python3.11
# Windows: Download from python.org
```

### Virtual Environment Issues

**Problem**: `.venv/` corrupted or has issues

**Solution**: Remove and recreate
```bash
rm -rf .venv
uv sync
```

### Permission Errors

**Problem**: Permission denied when running UV commands

**Solution**: Check UV cache permissions
```bash
# macOS/Linux
ls -la ~/.cache/uv

# Fix permissions if needed
chmod -R u+w ~/.cache/uv
```

### Application Not Working After UV Setup

**Problem**: `python3 src/todo.py` fails after UV initialization

**Solution**: This shouldn't happen (no code changes). Verify:
```bash
# Check source files unchanged
git status src/

# Try direct Python (bypass UV)
python3 src/todo.py --help

# If still failing, check Python path
which python3
```

---

## Additional Resources

- **UV Documentation**: https://docs.astral.sh/uv/
- **PEP 621 (Project Metadata)**: https://peps.python.org/pep-0621/
- **Project Specification**: `specs/002-uv-init/spec.md`
- **Implementation Plan**: `specs/002-uv-init/plan.md`

---

## Quick Reference Card

**First Time Setup**:
```bash
uv sync
```

**Daily Development**:
```bash
python3 src/todo.py <command>
```

**Add Dependency**:
```bash
uv add <package>
```

**Update After Pull**:
```bash
git pull && uv sync
```

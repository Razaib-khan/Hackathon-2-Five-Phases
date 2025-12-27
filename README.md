# Hackathon II Todo

CLI Todo Application - Spec-Driven Development Demo

## Prerequisites

- Python 3.11 or higher
- [UV](https://docs.astral.sh/uv/) package manager

## Initial Setup

Clone the repository and set up the environment:

```bash
git clone <repository-url>
cd hackathon-ii-todo
uv sync
```

This creates a virtual environment in `.venv/` and installs the project.

## Running the Application

### Method 1: Direct Python Execution

```bash
python3 src/todo.py <command>
```

### Method 2: UV-Managed Execution

```bash
uv run python src/todo.py <command>
```

### Available Commands

```bash
# Create a new task
python3 src/todo.py create "Task title" --description "Optional description"

# List all tasks
python3 src/todo.py list

# Complete a task
python3 src/todo.py complete <task-id>

# Mark task as incomplete
python3 src/todo.py incomplete <task-id>

# Update a task
python3 src/todo.py update <task-id> --title "New title" --description "New description"

# Delete a task
python3 src/todo.py delete <task-id>
```

## Adding Dependencies

To add a new package dependency:

```bash
uv add <package-name>
```

This updates `pyproject.toml` and installs the package. Example:

```bash
uv add requests
```

To remove a dependency:

```bash
uv remove <package-name>
```

## Troubleshooting

### UV Not Found

Install UV following the [official installation guide](https://docs.astral.sh/uv/getting-started/installation/).

### Python Version Mismatch

The project requires Python 3.11+. The `.python-version` file specifies `3.11`. UV will download the correct Python version automatically if needed.

### Virtual Environment Issues

If you encounter virtual environment problems:

```bash
rm -rf .venv
uv sync
```

This recreates the environment from scratch.

## Documentation

For complete UV workflow documentation, see [quickstart.md](specs/002-uv-init/quickstart.md).

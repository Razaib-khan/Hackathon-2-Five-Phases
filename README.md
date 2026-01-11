---
title: AIDO Todo Backend
emoji: 📝
colorFrom: blue
colorTo: purple
sdk: docker
---

# AIDO - AI-Powered Interactive Task Manager

A colorful, interactive command-line task manager built with Python and Rich.

## Features

- Interactive REPL mode with persistent task storage within a session
- Rich terminal UI with colored output and formatted tables
- Single-command mode for quick task operations
- Full CRUD operations for task management

## Backend API

The full-stack version includes a backend API built with FastAPI that supports:

- User authentication (register/login)
- Task management (CRUD operations)
- Database integration with PostgreSQL

### Backend Endpoints

- `GET /` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /api/users/{user_id}/tasks` - Get user tasks
- `POST /api/users/{user_id}/tasks` - Create task
- `PUT /api/users/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/users/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/users/{user_id}/tasks/{task_id}/complete` - Toggle task completion

## Deployment

### Backend to Hugging Face Spaces

To deploy the backend to Hugging Face Spaces:

1. Create a new Space on Hugging Face
2. Connect this repository
3. Use Docker SDK
4. Set environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET_KEY`: Secret key for JWT tokens
   - `AUTH_SECRET`: Authentication secret

## Prerequisites

- Python 3.11 or higher
- [UV](https://docs.astral.sh/uv/) package manager

## Installation

Clone the repository and set up the environment:

```bash
git clone <repository-url>
cd hackathon-ii-todo
uv sync
```

This creates a virtual environment in `.venv/` and installs all dependencies including Rich.

## Usage

### Interactive Mode

Launch AIDO without any arguments to enter interactive mode:

```bash
uv run src/todo.py
```

You'll see the AIDO logo and an interactive prompt:

```
   ___    ____  ____   ____
  / _ |  /  _/ / __ \ / __ \
 / __ | _/ /  / / / // / / /
/_/ |_|/___/ /_/ /_//_/ /_/

AI-Powered Interactive Task Manager

Type 'help' for available commands.

AIDO [0 tasks]>
```

#### Interactive Commands

| Command | Description |
|---------|-------------|
| `create <title> [-d <description>]` | Create a new task |
| `list` | List all tasks |
| `complete <id>` | Mark a task as complete |
| `incomplete <id>` | Mark a task as incomplete |
| `update <id> [-t <title>] [-d <description>]` | Update a task |
| `delete <id>` | Delete a task |
| `help [command]` | Show help |
| `exit` / `quit` | Exit AIDO |

#### Example Session

```
AIDO [0 tasks]> create "Buy groceries" -d "Milk, eggs, bread"
✓ Created task #1: Buy groceries

AIDO [1 tasks]> create "Call mom"
✓ Created task #2: Call mom

AIDO [2 tasks]> list
                      Tasks
┏━━━━┳━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ ID ┃ Status ┃ Title         ┃ Description       ┃
┡━━━━╇━━━━━━━━╇━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━┩
│  1 │ ○ Todo │ Buy groceries │ Milk, eggs, bread │
│  2 │ ○ Todo │ Call mom      │ -                 │
└────┴────────┴───────────────┴───────────────────┘

AIDO [2 tasks]> complete 1
✓ Marked task #1 as complete

AIDO [2 tasks]> exit
⚠ Exiting with 2 task(s). Tasks will be lost.
Goodbye!
```

### Single-Command Mode

Run individual commands without entering interactive mode:

```bash
# Create a task
uv run src/todo.py create "Task title" --description "Optional description"

# List all tasks
uv run src/todo.py list

# Complete a task
uv run src/todo.py complete <task-id>

# Mark task as incomplete
uv run src/todo.py incomplete <task-id>

# Update a task
uv run src/todo.py update <task-id> --title "New title" --description "New description"

# Delete a task
uv run src/todo.py delete <task-id>
```

## Adding Dependencies

To add a new package dependency:

```bash
uv add <package-name>
```

This updates `pyproject.toml` and installs the package.

## Troubleshooting

### UV Not Found

Install UV following the [official installation guide](https://docs.astral.sh/uv/getting-started/installation/).

### Python Version Mismatch

The project requires Python 3.11+. UV will download the correct Python version automatically if needed.

### Virtual Environment Issues

If you encounter virtual environment problems:

```bash
rm -rf .venv
uv sync
```

This recreates the environment from scratch.

## Documentation

For complete UV workflow documentation, see [quickstart.md](specs/002-uv-init/quickstart.md).

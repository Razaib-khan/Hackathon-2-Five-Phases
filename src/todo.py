#!/usr/bin/env python3
"""CLI Todo Application - Main entry point."""

import sys

from cli_parser import parse_args
from task_manager import TaskManager
from interactive_session import InteractiveSession


def main() -> int:
    """Main entry point for the CLI Todo Application.

    Returns:
        Exit code (0 for success, 1 for error).
    """
    args = parse_args()

    # If no command specified, launch interactive mode
    if args.command is None:
        session = InteractiveSession()
        session.cmdloop()
        return 0

    # Single-command mode with shared TaskManager
    manager = TaskManager()

    # Command dispatch
    if args.command == "create":
        return handle_create(manager, args)
    elif args.command == "list":
        return handle_list(manager)
    elif args.command == "complete":
        return handle_complete(manager, args)
    elif args.command == "incomplete":
        return handle_incomplete(manager, args)
    elif args.command == "update":
        return handle_update(manager, args)
    elif args.command == "delete":
        return handle_delete(manager, args)

    return 0


def handle_create(manager: TaskManager, args) -> int:
    """Handle the create command.

    Args:
        manager: TaskManager instance.
        args: Parsed command-line arguments.

    Returns:
        Exit code (0 for success, 1 for error).
    """
    success, result = manager.create_task(args.title, args.description)
    if success:
        print(f"Created task #{result}: {args.title.strip()}")
        return 0
    else:
        print(f"Error: {result}", file=sys.stderr)
        return 1


def handle_list(manager: TaskManager) -> int:
    """Handle the list command.

    Args:
        manager: TaskManager instance.

    Returns:
        Exit code (0 for success).
    """
    output = manager.format_task_list()
    print(output)
    return 0


def handle_complete(manager: TaskManager, args) -> int:
    """Handle the complete command.

    Args:
        manager: TaskManager instance.
        args: Parsed command-line arguments.

    Returns:
        Exit code (0 for success, 1 for error).
    """
    success, error = manager.mark_complete(args.id)
    if success:
        print(f"Marked task #{args.id} as complete")
        return 0
    else:
        print(f"Error: {error}", file=sys.stderr)
        return 1


def handle_incomplete(manager: TaskManager, args) -> int:
    """Handle the incomplete command.

    Args:
        manager: TaskManager instance.
        args: Parsed command-line arguments.

    Returns:
        Exit code (0 for success, 1 for error).
    """
    success, error = manager.mark_incomplete(args.id)
    if success:
        print(f"Marked task #{args.id} as incomplete")
        return 0
    else:
        print(f"Error: {error}", file=sys.stderr)
        return 1


def handle_update(manager: TaskManager, args) -> int:
    """Handle the update command.

    Args:
        manager: TaskManager instance.
        args: Parsed command-line arguments.

    Returns:
        Exit code (0 for success, 1 for error).
    """
    # Check that at least one field is provided
    if args.title is None and args.description is None:
        print("Error: Must specify --title and/or --description", file=sys.stderr)
        return 1

    success, error = manager.update_task(args.id, args.title, args.description)
    if success:
        print(f"Updated task #{args.id}")
        return 0
    else:
        print(f"Error: {error}", file=sys.stderr)
        return 1


def handle_delete(manager: TaskManager, args) -> int:
    """Handle the delete command.

    Args:
        manager: TaskManager instance.
        args: Parsed command-line arguments.

    Returns:
        Exit code (0 for success, 1 for error).
    """
    success, error = manager.delete_task(args.id)
    if success:
        print(f"Deleted task #{args.id}")
        return 0
    else:
        print(f"Error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

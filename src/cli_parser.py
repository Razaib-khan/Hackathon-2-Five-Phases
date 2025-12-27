"""CLI argument parsing for Todo Application."""

import argparse


def positive_int(value: str) -> int:
    """Validate that a value is a positive integer.

    Args:
        value: String value to validate.

    Returns:
        The validated positive integer.

    Raises:
        argparse.ArgumentTypeError: If value is not a positive integer.
    """
    try:
        int_value = int(value)
    except ValueError:
        raise argparse.ArgumentTypeError("Invalid task ID")
    if int_value <= 0:
        raise argparse.ArgumentTypeError("Invalid task ID")
    return int_value


def create_parser() -> argparse.ArgumentParser:
    """Create and configure the argument parser with subcommands.

    Returns:
        Configured ArgumentParser with all subcommands.
    """
    parser = argparse.ArgumentParser(
        prog="todo",
        description="CLI Todo Application - Manage your tasks from the command line"
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Create command
    create_parser = subparsers.add_parser("create", help="Create a new task")
    create_parser.add_argument("title", help="Task title (required)")
    create_parser.add_argument(
        "--description", "-d",
        default="",
        help="Task description (optional)"
    )

    # List command
    subparsers.add_parser("list", help="List all tasks")

    # Complete command
    complete_parser = subparsers.add_parser("complete", help="Mark a task as complete")
    complete_parser.add_argument("id", type=positive_int, help="Task ID")

    # Incomplete command
    incomplete_parser = subparsers.add_parser("incomplete", help="Mark a task as incomplete")
    incomplete_parser.add_argument("id", type=positive_int, help="Task ID")

    # Update command
    update_parser = subparsers.add_parser("update", help="Update a task")
    update_parser.add_argument("id", type=positive_int, help="Task ID")
    update_parser.add_argument("--title", "-t", help="New task title")
    update_parser.add_argument("--description", "-d", help="New task description")

    # Delete command
    delete_parser = subparsers.add_parser("delete", help="Delete a task")
    delete_parser.add_argument("id", type=positive_int, help="Task ID")

    return parser


def parse_args(args: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments.

    Args:
        args: Optional list of arguments. If None, uses sys.argv.

    Returns:
        Parsed arguments namespace.
    """
    parser = create_parser()
    return parser.parse_args(args)

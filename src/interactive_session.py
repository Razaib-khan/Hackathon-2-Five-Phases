"""
Interactive Session module for AIDO.

This module provides the REPL (Read-Eval-Print Loop) interface for interactive
task management using Python's cmd module with Rich formatting.
"""

import cmd
import shlex

from rich.table import Table

from task_manager import TaskManager
from output_handler import OutputHandler


class InteractiveSession(cmd.Cmd):
    """Interactive command-line session for AIDO task management.

    Extends cmd.Cmd to provide a REPL interface with persistent task storage
    within a single session. Tasks are stored in memory and lost when the
    session ends.

    Attributes:
        intro: Welcome message displayed on session start.
        prompt: Command prompt string, updated with task count.
        task_manager: TaskManager instance for task operations.
        output: OutputHandler for styled terminal output.
    """

    intro = ""  # We use print_logo() instead for styled intro

    def __init__(self, task_manager: TaskManager | None = None,
                 output_handler: OutputHandler | None = None):
        """Initialize InteractiveSession with task manager and output handler.

        Args:
            task_manager: Optional TaskManager instance for dependency injection.
                         If not provided, creates a new TaskManager.
            output_handler: Optional OutputHandler instance for dependency injection.
                           If not provided, creates a new OutputHandler.
        """
        super().__init__()
        self.task_manager = task_manager if task_manager is not None else TaskManager()
        self.output = output_handler if output_handler is not None else OutputHandler()
        self._update_prompt()

    def preloop(self) -> None:
        """Hook called before the command loop starts.

        Displays the AIDO logo and welcome message.
        """
        self.output.print_logo()
        self.output.print_info("Type 'help' for available commands.\n")

    def _update_prompt(self) -> None:
        """Update the prompt to show current task count."""
        count = len(self.task_manager.list_tasks())
        self.prompt = f"AIDO [{count} tasks]> "

    def precmd(self, line: str) -> str:
        """Hook called before command execution to update prompt.

        Args:
            line: The command line entered by the user.

        Returns:
            The command line unchanged.
        """
        self._update_prompt()
        return line

    def emptyline(self) -> bool:
        """Handle empty input (just pressing Enter).

        Overrides default behavior to do nothing instead of repeating
        the last command.

        Returns:
            False to continue the session.
        """
        return False

    def do_create(self, arg: str) -> None:
        """Create a new task.

        Usage: create <title> [-d <description>]

        Arguments:
            title: The task title (required)
            -d, --description: Optional task description

        Examples:
            create "Buy groceries"
            create "Call mom" -d "Ask about weekend plans"
        """
        if not arg.strip():
            self.output.print_error("Usage: create <title> [-d <description>]")
            return

        # Parse arguments
        try:
            parts = shlex.split(arg)
        except ValueError as e:
            self.output.print_error(f"Invalid input: {e}")
            return

        title = None
        description = ""

        i = 0
        while i < len(parts):
            if parts[i] in ("-d", "--description"):
                if i + 1 < len(parts):
                    description = parts[i + 1]
                    i += 2
                else:
                    self.output.print_error("Description flag requires a value")
                    return
            elif title is None:
                title = parts[i]
                i += 1
            else:
                i += 1

        if not title:
            self.output.print_error("Title is required")
            return

        success, result = self.task_manager.create_task(title, description)
        if success:
            self.output.print_success(f"Created task #{result}: {title}")
        else:
            self.output.print_error(str(result))

    def do_list(self, arg: str) -> None:
        """List all tasks in the current session.

        Usage: list

        Shows all tasks with their ID, status, title, and description.
        Completed tasks are shown in green, incomplete in yellow.
        """
        tasks = self.task_manager.list_tasks()
        self.output.print_task_list(tasks)

    def do_complete(self, arg: str) -> None:
        """Mark a task as complete.

        Usage: complete <id>

        Arguments:
            id: The task ID to mark as complete

        Example:
            complete 1
        """
        if not arg.strip():
            self.output.print_error("Usage: complete <id>")
            return

        try:
            task_id = int(arg.strip())
            if task_id <= 0:
                raise ValueError()
        except ValueError:
            self.output.print_error("Invalid task ID")
            return

        success, error = self.task_manager.mark_complete(task_id)
        if success:
            self.output.print_success(f"Marked task #{task_id} as complete")
        else:
            self.output.print_error(error)

    def do_incomplete(self, arg: str) -> None:
        """Mark a task as incomplete.

        Usage: incomplete <id>

        Arguments:
            id: The task ID to mark as incomplete

        Example:
            incomplete 1
        """
        if not arg.strip():
            self.output.print_error("Usage: incomplete <id>")
            return

        try:
            task_id = int(arg.strip())
            if task_id <= 0:
                raise ValueError()
        except ValueError:
            self.output.print_error("Invalid task ID")
            return

        success, error = self.task_manager.mark_incomplete(task_id)
        if success:
            self.output.print_success(f"Marked task #{task_id} as incomplete")
        else:
            self.output.print_error(error)

    def do_update(self, arg: str) -> None:
        """Update a task's title and/or description.

        Usage: update <id> [-t <title>] [-d <description>]

        Arguments:
            id: The task ID to update
            -t, --title: New task title
            -d, --description: New task description

        Examples:
            update 1 -t "New title"
            update 1 -d "New description"
            update 1 -t "New title" -d "New description"
        """
        if not arg.strip():
            self.output.print_error("Usage: update <id> [-t <title>] [-d <description>]")
            return

        try:
            parts = shlex.split(arg)
        except ValueError as e:
            self.output.print_error(f"Invalid input: {e}")
            return

        if not parts:
            self.output.print_error("Task ID is required")
            return

        try:
            task_id = int(parts[0])
            if task_id <= 0:
                raise ValueError()
        except ValueError:
            self.output.print_error("Invalid task ID")
            return

        title = None
        description = None

        i = 1
        while i < len(parts):
            if parts[i] in ("-t", "--title"):
                if i + 1 < len(parts):
                    title = parts[i + 1]
                    i += 2
                else:
                    self.output.print_error("Title flag requires a value")
                    return
            elif parts[i] in ("-d", "--description"):
                if i + 1 < len(parts):
                    description = parts[i + 1]
                    i += 2
                else:
                    self.output.print_error("Description flag requires a value")
                    return
            else:
                i += 1

        if title is None and description is None:
            self.output.print_error("Must specify --title and/or --description")
            return

        success, error = self.task_manager.update_task(task_id, title, description)
        if success:
            self.output.print_success(f"Updated task #{task_id}")
        else:
            self.output.print_error(error)

    def do_delete(self, arg: str) -> None:
        """Delete a task.

        Usage: delete <id>

        Arguments:
            id: The task ID to delete

        Example:
            delete 1
        """
        if not arg.strip():
            self.output.print_error("Usage: delete <id>")
            return

        try:
            task_id = int(arg.strip())
            if task_id <= 0:
                raise ValueError()
        except ValueError:
            self.output.print_error("Invalid task ID")
            return

        success, error = self.task_manager.delete_task(task_id)
        if success:
            self.output.print_success(f"Deleted task #{task_id}")
        else:
            self.output.print_error(error)

    def do_exit(self, arg: str) -> bool:
        """Exit the AIDO interactive session.

        Usage: exit

        Note: All tasks will be lost when you exit.
        """
        tasks = self.task_manager.list_tasks()
        if tasks:
            self.output.print_warning(f"Exiting with {len(tasks)} task(s). Tasks will be lost.")
        self.output.print_info("Goodbye!")
        return True

    def do_quit(self, arg: str) -> bool:
        """Exit the AIDO interactive session (alias for exit).

        Usage: quit

        Note: All tasks will be lost when you quit.
        """
        return self.do_exit(arg)

    def do_EOF(self, arg: str) -> bool:
        """Handle Ctrl+D (EOF) to exit gracefully.

        Usage: Ctrl+D
        """
        print()  # Print newline after ^D
        return self.do_exit(arg)

    def do_help(self, arg: str) -> None:
        """Display help information for AIDO commands.

        Usage: help [command]

        Without arguments, shows a list of all available commands.
        With a command name, shows detailed help for that command.
        """
        if arg:
            # Show help for specific command
            try:
                func = getattr(self, 'do_' + arg)
                if func.__doc__:
                    self.output.print_info(func.__doc__)
                else:
                    self.output.print_info(f"No help available for '{arg}'")
            except AttributeError:
                self.output.print_error(f"Unknown command: {arg}")
            return

        # Show all commands in a Rich table
        table = Table(title="AIDO Commands", show_header=True, header_style="bold")
        table.add_column("Command", style="cyan")
        table.add_column("Description")

        commands = [
            ("create", "Create a new task"),
            ("list", "List all tasks"),
            ("complete", "Mark a task as complete"),
            ("incomplete", "Mark a task as incomplete"),
            ("update", "Update a task's title or description"),
            ("delete", "Delete a task"),
            ("help", "Show this help message"),
            ("exit/quit", "Exit AIDO"),
        ]

        for cmd_name, description in commands:
            table.add_row(cmd_name, description)

        self.output.console.print(table)
        self.output.print_info("\nType 'help <command>' for detailed usage.")

    def default(self, line: str) -> None:
        """Handle unknown commands.

        Args:
            line: The unrecognized command line.
        """
        self.output.print_error(f"Unknown command: {line.split()[0]}")
        self.output.print_info("Type 'help' for available commands.")

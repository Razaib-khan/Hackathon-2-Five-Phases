"""
Output Handler module for AIDO.

This module provides centralized terminal output handling with Rich formatting,
colors, and visual hierarchy for the AIDO interactive task manager.
"""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel


class OutputHandler:
    """Centralized output handler with Rich formatting.

    Provides styled terminal output for the AIDO interactive task manager.
    All output goes through a single Rich Console instance for consistency.

    Attributes:
        console: Rich Console instance for all output operations.
    """

    def __init__(self, console: Console | None = None):
        """Initialize OutputHandler with a Rich Console.

        Args:
            console: Optional Console instance for dependency injection.
                    If not provided, creates a new Console with default settings.
        """
        self.console = console if console is not None else Console()

    def print_success(self, message: str) -> None:
        """Print a success message with green color and checkmark.

        Args:
            message: The success message to display.
        """
        self.console.print(f"[green]✓ {message}[/green]")

    def print_error(self, message: str) -> None:
        """Print an error message with red color and X mark.

        Args:
            message: The error message to display.
        """
        self.console.print(f"[red]✗ {message}[/red]")

    def print_warning(self, message: str) -> None:
        """Print a warning message with yellow color and warning symbol.

        Args:
            message: The warning message to display.
        """
        self.console.print(f"[yellow]⚠ {message}[/yellow]")

    def print_info(self, message: str) -> None:
        """Print an info message with default color.

        Args:
            message: The info message to display.
        """
        self.console.print(message)

    def print_task_list(self, tasks: list) -> None:
        """Print task list as a Rich table with colored status.

        Args:
            tasks: List of Task objects to display.
        """
        if not tasks:
            self.print_info("No tasks found")
            return

        table = Table(title="Tasks", show_header=True, header_style="bold")
        table.add_column("ID", style="cyan", justify="right")
        table.add_column("Status", justify="center")
        table.add_column("Title", style="white")
        table.add_column("Description", style="dim")

        for task in tasks:
            if task.completed:
                status = "[green]✓ Done[/green]"
            else:
                status = "[yellow]○ Todo[/yellow]"

            table.add_row(
                str(task.id),
                status,
                task.title,
                task.description or "-"
            )

        self.console.print(table)

    def print_logo(self) -> None:
        """Print the AIDO ASCII art logo with cyan color.

        The logo is designed to fit within 80-column terminals.
        """
        logo = """[cyan]
   ___    ____  ____   ____
  / _ |  /  _/ / __ \\ / __ \\
 / __ | _/ /  / / / // / / /
/_/ |_|/___/ /_/ /_//_/ /_/
[/cyan]
[dim]AI-Powered Interactive Task Manager[/dim]
"""
        self.console.print(logo)

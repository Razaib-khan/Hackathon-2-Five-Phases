"""Task model for CLI Todo Application."""

from dataclasses import dataclass


@dataclass
class Task:
    """Represents a single todo item.

    Attributes:
        id: Unique identifier (positive integer, auto-assigned)
        title: Task title (required, 1-200 characters)
        description: Optional description (0-1000 characters)
        completed: Completion status (defaults to False)
    """
    id: int
    title: str
    description: str = ""
    completed: bool = False

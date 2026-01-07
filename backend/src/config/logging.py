import logging
import sys
from datetime import datetime
from typing import Optional
from .settings import settings


class CustomFormatter(logging.Formatter):
    """Custom formatter to add color and additional context to logs."""

    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"

    FORMATS = {
        logging.DEBUG: grey + format + reset,
        logging.INFO: grey + format + reset,
        logging.WARNING: yellow + format + reset,
        logging.ERROR: red + format + reset,
        logging.CRITICAL: bold_red + format + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


def setup_logging(
    name: Optional[str] = None,
    level: Optional[int] = None,
    log_file: Optional[str] = None
) -> logging.Logger:
    """
    Set up logging with custom formatting.

    Args:
        name: Name of the logger (defaults to __name__)
        level: Logging level (defaults to settings.log_level)
        log_file: Optional file to log to

    Returns:
        Configured logger instance
    """
    if name is None:
        name = __name__

    if level is None:
        level = getattr(logging, settings.log_level.upper())

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Prevent adding multiple handlers if logger already configured
    if logger.handlers:
        return logger

    # Create console handler with custom formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(CustomFormatter())

    # Add console handler
    logger.addHandler(console_handler)

    # Optionally add file handler
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(level)
        file_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance."""
    return setup_logging(name=name)


# Initialize root logger
root_logger = setup_logging(name="aido", level=getattr(logging, settings.log_level.upper()))
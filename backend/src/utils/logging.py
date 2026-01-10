import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime


def setup_logging(log_level=logging.INFO):
    """
    Set up logging configuration for the application
    """
    # Create logs directory if it doesn't exist
    if not os.path.exists("logs"):
        os.makedirs("logs")

    # Create logger
    logger = logging.getLogger("aido_app")
    logger.setLevel(log_level)

    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s"
    )

    # Create rotating file handler
    file_handler = RotatingFileHandler(
        f"logs/aido_app_{datetime.now().strftime('%Y%m%d')}.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)

    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)

    # Add handlers to logger
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger


# Global logger instance
app_logger = setup_logging()
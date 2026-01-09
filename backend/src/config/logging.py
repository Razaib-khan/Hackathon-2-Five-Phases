import logging
import sys
from datetime import datetime
from typing import Optional
from pythonjsonlogger import jsonlogger


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        if not log_record.get('timestamp'):
            # Add timestamp in ISO format
            log_record['timestamp'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname


def setup_logging(log_level: str = "INFO", json_format: bool = True):
    """
    Set up comprehensive logging configuration
    """
    # Create a custom logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))

    # Clear any existing handlers
    logger.handlers.clear()

    # Create a handler that outputs to stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, log_level.upper()))

    if json_format:
        # Use JSON formatter
        formatter = CustomJsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s %(module)s %(funcName)s %(lineno)d',
            rename_fields={'levelname': 'level', 'name': 'logger', 'funcName': 'function'}
        )
    else:
        # Use standard formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s - [%(module)s:%(funcName)s:%(lineno)d]'
        )

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Also configure uvicorn loggers to use the same format
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.handlers.clear()
    uvicorn_logger.addHandler(handler)
    uvicorn_logger.setLevel(getattr(logging, log_level.upper()))

    access_logger = logging.getLogger("uvicorn.access")
    access_logger.handlers.clear()
    access_logger.addHandler(handler)
    access_logger.setLevel(getattr(logging, log_level.upper()))

    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name
    """
    return logging.getLogger(name)


def log_api_call(
    endpoint: str,
    method: str,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    status_code: Optional[int] = None,
    response_time: Optional[float] = None,
    extra: Optional[dict] = None
):
    """
    Log an API call with structured data
    """
    logger = get_logger("api")
    log_data = {
        "event": "api_call",
        "endpoint": endpoint,
        "method": method,
        "user_id": user_id,
        "ip_address": ip_address,
        "status_code": status_code,
        "response_time_ms": response_time,
        **(extra or {})
    }
    logger.info("API call", extra=log_data)


def log_security_event(
    event_type: str,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    description: str = "",
    severity: str = "medium"
):
    """
    Log a security-related event
    """
    logger = get_logger("security")
    log_data = {
        "event": "security_event",
        "event_type": event_type,
        "user_id": user_id,
        "ip_address": ip_address,
        "description": description,
        "severity": severity
    }
    logger.warning("Security event", extra=log_data)


def log_performance_metric(
    metric_name: str,
    value: float,
    unit: str = "",
    tags: Optional[dict] = None
):
    """
    Log a performance metric
    """
    logger = get_logger("performance")
    log_data = {
        "event": "performance_metric",
        "metric_name": metric_name,
        "value": value,
        "unit": unit,
        "tags": tags or {}
    }
    logger.info("Performance metric", extra=log_data)
from fastapi import FastAPI
from typing import List, Optional
from enum import Enum


class ApiVersion(str, Enum):
    """Enumeration of API versions."""
    V1 = "v1"
    V2 = "v2"
    # Add new versions as needed


class ApiVersionConfig:
    """Configuration class for API versioning."""

    def __init__(self):
        self.current_version = ApiVersion.V1
        self.supported_versions: List[ApiVersion] = [ApiVersion.V1]
        self.deprecated_versions: List[ApiVersion] = []
        self.default_version = ApiVersion.V1

    def is_version_supported(self, version: str) -> bool:
        """Check if the given version is supported."""
        try:
            api_version = ApiVersion(version.lower())
            return api_version in self.supported_versions
        except ValueError:
            return False

    def is_version_deprecated(self, version: str) -> bool:
        """Check if the given version is deprecated."""
        try:
            api_version = ApiVersion(version.lower())
            return api_version in self.deprecated_versions
        except ValueError:
            return False

    def get_version_prefix(self, version: str) -> str:
        """Get the path prefix for the given version."""
        return f"/{version.lower()}"

    def get_available_versions(self) -> List[str]:
        """Get list of available versions as strings."""
        return [version.value for version in self.supported_versions]

    def add_version(self, version: ApiVersion):
        """Add a new version to supported versions."""
        if version not in self.supported_versions:
            self.supported_versions.append(version)

    def deprecate_version(self, version: ApiVersion):
        """Deprecate a version."""
        if version in self.supported_versions and version not in self.deprecated_versions:
            self.deprecated_versions.append(version)


# Create global instance
api_version_config = ApiVersionConfig()


def setup_versioned_applications(base_app: FastAPI) -> dict:
    """
    Set up versioned applications.

    Args:
        base_app: Base FastAPI application

    Returns:
        Dictionary of versioned applications
    """
    versioned_apps = {}

    for version in api_version_config.supported_versions:
        versioned_app = FastAPI(
            title=f"{base_app.title} - {version.value.upper()}",
            description=f"{base_app.description} - {version.value.upper()} Version",
            version=version.value,
        )
        versioned_apps[version.value] = versioned_app

    return versioned_apps


def get_version_from_request_path(path: str) -> Optional[str]:
    """
    Extract version from request path.

    Args:
        path: Request path

    Returns:
        Version string if found, None otherwise
    """
    path_parts = path.strip('/').split('/')
    if len(path_parts) > 0 and path_parts[0].lower().startswith('v'):
        version_part = path_parts[0].lower()
        try:
            ApiVersion(version_part)
            return version_part
        except ValueError:
            pass
    return None


# Version headers for API responses
VERSION_HEADER = "X-API-Version"
DEPRECATED_HEADER = "X-API-Deprecated"
SUPPORTED_VERSIONS_HEADER = "X-API-Supported-Versions"
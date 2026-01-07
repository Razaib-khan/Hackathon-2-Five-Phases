import asyncio
from sqlmodel import SQLModel, Session, select
from ..config.database import engine, get_session
from ..models.user import User
from ..models.role import Role
from ..models.permission import Permission
from ..utils.auth import get_password_hash
from typing import List
import logging


logger = logging.getLogger(__name__)


async def create_initial_data():
    """Create initial data for the application."""
    logger.info("Creating initial data...")

    with Session(engine) as session:
        # Create default roles if they don't exist
        roles_to_create = [
            {"name": "admin", "description": "Administrator role with full access"},
            {"name": "user", "description": "Regular user role with standard access"},
            {"name": "viewer", "description": "Viewer role with read-only access"},
        ]

        for role_data in roles_to_create:
            existing_role = session.exec(select(Role).where(Role.name == role_data["name"])).first()
            if not existing_role:
                role = Role(**role_data)
                session.add(role)
                logger.info(f"Created role: {role_data['name']}")

        session.commit()

        # Create default permissions if they don't exist
        permissions_to_create = [
            {"name": "read:users", "description": "Read user information", "resource": "user", "action": "read"},
            {"name": "create:users", "description": "Create new users", "resource": "user", "action": "create"},
            {"name": "update:users", "description": "Update user information", "resource": "user", "action": "update"},
            {"name": "delete:users", "description": "Delete users", "resource": "user", "action": "delete"},
            {"name": "read:tasks", "description": "Read task information", "resource": "task", "action": "read"},
            {"name": "create:tasks", "description": "Create new tasks", "resource": "task", "action": "create"},
            {"name": "update:tasks", "description": "Update task information", "resource": "task", "action": "update"},
            {"name": "delete:tasks", "description": "Delete tasks", "resource": "task", "action": "delete"},
            {"name": "read:projects", "description": "Read project information", "resource": "project", "action": "read"},
            {"name": "create:projects", "description": "Create new projects", "resource": "project", "action": "create"},
            {"name": "update:projects", "description": "Update project information", "resource": "project", "action": "update"},
            {"name": "delete:projects", "description": "Delete projects", "resource": "project", "action": "delete"},
        ]

        for perm_data in permissions_to_create:
            existing_perm = session.exec(select(Permission).where(Permission.name == perm_data["name"])).first()
            if not existing_perm:
                permission = Permission(**perm_data)
                session.add(permission)
                logger.info(f"Created permission: {perm_data['name']}")

        session.commit()

        # Create admin user if it doesn't exist
        admin_username = "admin"
        admin_user = session.exec(select(User).where(User.username == admin_username)).first()

        if not admin_user:
            admin_user = User(
                username=admin_username,
                email="admin@aido.example.com",
                hashed_password=get_password_hash("admin123"),  # Change this in production
                first_name="Admin",
                last_name="User",
                is_active=True,
                is_verified=True
            )
            session.add(admin_user)
            session.commit()
            logger.info(f"Created admin user: {admin_username}")

            # Assign admin role to admin user
            admin_role = session.exec(select(Role).where(Role.name == "admin")).first()
            if admin_role:
                admin_user.roles.append(admin_role)
                session.add(admin_user)
                session.commit()
                logger.info(f"Assigned admin role to admin user")

    logger.info("Initial data creation completed.")


def main():
    """Main function to run the initialization."""
    print("Initializing database with default data...")
    asyncio.run(create_initial_data())
    print("Database initialization completed!")


if __name__ == "__main__":
    main()
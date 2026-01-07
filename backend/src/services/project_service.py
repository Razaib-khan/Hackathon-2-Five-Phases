from sqlmodel import Session, select
from typing import Optional, List
from fastapi import HTTPException, status
from ..models.project import Project
from ..models.user import User
from ..models.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse


class ProjectService:
    """Service class for handling project-related operations."""

    @staticmethod
    def get_project_by_id(session: Session, project_id: int) -> Optional[Project]:
        """
        Get a project by ID.

        Args:
            session: Database session
            project_id: Project ID to search for

        Returns:
            Project object if found, None otherwise
        """
        return session.get(Project, project_id)

    @staticmethod
    def get_projects_by_owner(session: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
        """
        Get projects by owner ID.

        Args:
            session: Database session
            owner_id: Owner ID to filter by
            skip: Number of projects to skip
            limit: Maximum number of projects to return

        Returns:
            List of Project objects
        """
        return session.exec(
            select(Project)
            .where(Project.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        ).all()

    @staticmethod
    def get_projects(session: Session, skip: int = 0, limit: int = 100) -> List[Project]:
        """
        Get all projects.

        Args:
            session: Database session
            skip: Number of projects to skip
            limit: Maximum number of projects to return

        Returns:
            List of Project objects
        """
        return session.exec(select(Project).offset(skip).limit(limit)).all()

    @staticmethod
    def create_project(session: Session, project_data: ProjectCreate, owner_id: int) -> Project:
        """
        Create a new project.

        Args:
            session: Database session
            project_data: Project creation data
            owner_id: ID of the user creating the project

        Returns:
            Created Project object
        """
        # Verify the owner exists
        owner = session.get(User, owner_id)
        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Owner not found"
            )

        # Create new project
        db_project = Project(
            name=project_data.name,
            description=project_data.description,
            owner_id=owner_id,
            is_active=project_data.is_active
        )
        session.add(db_project)
        session.commit()
        session.refresh(db_project)
        return db_project

    @staticmethod
    def update_project(session: Session, project_id: int, project_update: ProjectUpdate) -> Optional[Project]:
        """
        Update a project.

        Args:
            session: Database session
            project_id: ID of project to update
            project_update: Project update data

        Returns:
            Updated Project object if successful, None if project not found
        """
        db_project = session.get(Project, project_id)
        if not db_project:
            return None

        # Update project fields
        update_data = project_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)

        session.add(db_project)
        session.commit()
        session.refresh(db_project)
        return db_project

    @staticmethod
    def delete_project(session: Session, project_id: int) -> bool:
        """
        Delete a project.

        Args:
            session: Database session
            project_id: ID of project to delete

        Returns:
            True if project was deleted, False if project not found
        """
        db_project = session.get(Project, project_id)
        if not db_project:
            return False

        session.delete(db_project)
        session.commit()
        return True

    @staticmethod
    def activate_project(session: Session, project_id: int) -> Optional[Project]:
        """
        Activate a project.

        Args:
            session: Database session
            project_id: ID of project to activate

        Returns:
            Updated Project object if successful, None if project not found
        """
        db_project = session.get(Project, project_id)
        if not db_project:
            return None

        db_project.is_active = True
        session.add(db_project)
        session.commit()
        session.refresh(db_project)
        return db_project

    @staticmethod
    def deactivate_project(session: Session, project_id: int) -> Optional[Project]:
        """
        Deactivate a project.

        Args:
            session: Database session
            project_id: ID of project to deactivate

        Returns:
            Updated Project object if successful, None if project not found
        """
        db_project = session.get(Project, project_id)
        if not db_project:
            return None

        db_project.is_active = False
        session.add(db_project)
        session.commit()
        session.refresh(db_project)
        return db_project

    @staticmethod
    def check_project_access(session: Session, project_id: int, user_id: int) -> bool:
        """
        Check if a user has access to a project (is the owner).

        Args:
            session: Database session
            project_id: ID of the project to check
            user_id: ID of the user to check

        Returns:
            True if user has access, False otherwise
        """
        project = session.get(Project, project_id)
        if not project:
            return False

        return project.owner_id == user_id
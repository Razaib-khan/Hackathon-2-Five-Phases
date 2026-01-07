from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..config.database import get_session
from ..models.user import User
from ..models.project import Project
from ..models.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from ..services.project_service import ProjectService
from ..utils.auth import get_current_user_from_token


router = APIRouter()


@router.post("/projects/", response_model=ProjectResponse, summary="Create a new project")
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> ProjectResponse:
    """
    Create a new project owned by the current user.

    Args:
        project_data: Project creation data
        current_user: Authenticated user (owner)
        session: Database session

    Returns:
        ProjectResponse object with the created project's information
    """
    project = ProjectService.create_project(session, project_data, current_user.id)
    return ProjectResponse.from_orm(project)


@router.get("/projects/", response_model=List[ProjectResponse], summary="List user's projects")
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> List[ProjectResponse]:
    """
    List projects owned by the current user with pagination.

    Args:
        skip: Number of projects to skip
        limit: Maximum number of projects to return
        current_user: Authenticated user
        session: Database session

    Returns:
        List of ProjectResponse objects
    """
    projects = ProjectService.get_projects_by_owner(session, current_user.id, skip=skip, limit=limit)
    return [ProjectResponse.from_orm(project) for project in projects]


@router.get("/projects/{project_id}", response_model=ProjectResponse, summary="Get specific project")
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> ProjectResponse:
    """
    Get information about a specific project owned by the user.

    Args:
        project_id: ID of the project to retrieve
        current_user: Authenticated user
        session: Database session

    Returns:
        ProjectResponse object with the project's information
    """
    project = ProjectService.get_project_by_id(session, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if the user is the owner of the project
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this project"
        )

    return ProjectResponse.from_orm(project)


@router.put("/projects/{project_id}", response_model=ProjectResponse, summary="Update a project")
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> ProjectResponse:
    """
    Update a project owned by the current user.

    Args:
        project_id: ID of the project to update
        project_update: Project update data
        current_user: Authenticated user
        session: Database session

    Returns:
        ProjectResponse object with the updated project's information
    """
    # Check if the project exists and belongs to the user
    project = ProjectService.get_project_by_id(session, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )

    updated_project = ProjectService.update_project(session, project_id, project_update)
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return ProjectResponse.from_orm(updated_project)


@router.delete("/projects/{project_id}", summary="Delete a project")
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> dict:
    """
    Delete a project owned by the current user.

    Args:
        project_id: ID of the project to delete
        current_user: Authenticated user
        session: Database session

    Returns:
        Success message
    """
    # Check if the project exists and belongs to the user
    project = ProjectService.get_project_by_id(session, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this project"
        )

    deleted = ProjectService.delete_project(session, project_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return {"message": "Project deleted successfully"}


@router.post("/projects/{project_id}/activate", response_model=ProjectResponse, summary="Activate a project")
async def activate_project(
    project_id: int,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> ProjectResponse:
    """
    Activate a project owned by the current user.

    Args:
        project_id: ID of the project to activate
        current_user: Authenticated user
        session: Database session

    Returns:
        ProjectResponse object with the activated project's information
    """
    # Check if the project exists and belongs to the user
    project = ProjectService.get_project_by_id(session, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to activate this project"
        )

    activated_project = ProjectService.activate_project(session, project_id)
    if not activated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return ProjectResponse.from_orm(activated_project)


@router.post("/projects/{project_id}/deactivate", response_model=ProjectResponse, summary="Deactivate a project")
async def deactivate_project(
    project_id: int,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> ProjectResponse:
    """
    Deactivate a project owned by the current user.

    Args:
        project_id: ID of the project to deactivate
        current_user: Authenticated user
        session: Database session

    Returns:
        ProjectResponse object with the deactivated project's information
    """
    # Check if the project exists and belongs to the user
    project = ProjectService.get_project_by_id(session, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to deactivate this project"
        )

    deactivated_project = ProjectService.deactivate_project(session, project_id)
    if not deactivated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return ProjectResponse.from_orm(deactivated_project)
"""
Tag Service Layer

Implements business logic for tag CRUD operations:
- create_tag: Create new tag with 100 tag limit enforcement (FR-106)
- get_tags: Retrieve all user tags
- get_tag: Get single tag by ID
- update_tag: Update tag name/color
- delete_tag: Delete tag (CASCADE removes from task_tags)

Limits:
- Maximum 100 tags per user (FR-106)
"""

from typing import List
from uuid import UUID

from sqlmodel import Session, select, func

from ..models.tag import Tag
from ..schemas.tag import TagCreateRequest, TagUpdateRequest


class TagService:
    """Service for tag operations."""

    MAX_TAGS_PER_USER = 100  # FR-106

    @staticmethod
    def create_tag(
        session: Session,
        user_id: UUID,
        data: TagCreateRequest,
    ) -> Tag:
        """
        Create a new tag.

        Args:
            session: Database session
            user_id: Owner user UUID
            data: Tag creation data

        Returns:
            Created Tag instance

        Raises:
            ValueError: If user has reached 100 tag limit (FR-106)
            ValueError: If tag name already exists for user (unique constraint)
        """
        # Check tag limit
        tag_count = session.exec(
            select(func.count(Tag.id)).where(Tag.user_id == user_id)
        ).one()

        if tag_count >= TagService.MAX_TAGS_PER_USER:
            raise ValueError(
                f"Tag limit reached. Maximum {TagService.MAX_TAGS_PER_USER} tags per user."
            )

        # Check for duplicate name
        existing_tag = session.exec(
            select(Tag).where(
                Tag.user_id == user_id,
                Tag.name == data.name,
            )
        ).first()

        if existing_tag:
            raise ValueError(f"Tag with name '{data.name}' already exists.")

        # Create tag
        tag = Tag(
            user_id=user_id,
            name=data.name,
            color=data.color,
        )

        session.add(tag)
        session.commit()
        session.refresh(tag)

        return tag

    @staticmethod
    def get_tags(session: Session, user_id: UUID) -> List[Tag]:
        """
        Get all tags for a user.

        Args:
            session: Database session
            user_id: Owner user UUID

        Returns:
            List of Tag instances ordered by name
        """
        statement = (
            select(Tag)
            .where(Tag.user_id == user_id)
            .order_by(Tag.name)
        )

        tags = session.exec(statement).all()
        return list(tags)

    @staticmethod
    def get_tag(session: Session, tag_id: UUID, user_id: UUID) -> Tag:
        """
        Get a single tag by ID.

        Args:
            session: Database session
            tag_id: Tag UUID
            user_id: Owner user UUID (for authorization)

        Returns:
            Tag instance

        Raises:
            ValueError: If tag not found or doesn't belong to user
        """
        tag = session.get(Tag, tag_id)

        if not tag:
            raise ValueError("Tag not found.")

        if tag.user_id != user_id:
            raise ValueError("Unauthorized access to tag.")

        return tag

    @staticmethod
    def update_tag(
        session: Session,
        tag_id: UUID,
        user_id: UUID,
        data: TagUpdateRequest,
    ) -> Tag:
        """
        Update tag name and/or color.

        Args:
            session: Database session
            tag_id: Tag UUID
            user_id: Owner user UUID (for authorization)
            data: Update data (name and/or color)

        Returns:
            Updated Tag instance

        Raises:
            ValueError: If tag not found or doesn't belong to user
            ValueError: If new name conflicts with existing tag
        """
        tag = TagService.get_tag(session, tag_id, user_id)

        # Check for name conflict if name is being updated
        if data.name and data.name != tag.name:
            existing_tag = session.exec(
                select(Tag).where(
                    Tag.user_id == user_id,
                    Tag.name == data.name,
                    Tag.id != tag_id,
                )
            ).first()

            if existing_tag:
                raise ValueError(f"Tag with name '{data.name}' already exists.")

            tag.name = data.name

        # Update color if provided
        if data.color:
            tag.color = data.color

        session.add(tag)
        session.commit()
        session.refresh(tag)

        return tag

    @staticmethod
    def delete_tag(session: Session, tag_id: UUID, user_id: UUID) -> None:
        """
        Delete a tag.

        CASCADE DELETE: All task_tags entries referencing this tag are automatically deleted.

        Args:
            session: Database session
            tag_id: Tag UUID
            user_id: Owner user UUID (for authorization)

        Raises:
            ValueError: If tag not found or doesn't belong to user
        """
        tag = TagService.get_tag(session, tag_id, user_id)

        session.delete(tag)
        session.commit()

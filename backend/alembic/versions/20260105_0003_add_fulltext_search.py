"""Add fulltext search to tasks

Revision ID: 0008
Revises: 0007
Create Date: 2026-01-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0008'
down_revision: Union[str, None] = '0007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add tsvector column for full-text search
    op.add_column(
        'tasks',
        sa.Column(
            'search_vector',
            postgresql.TSVECTOR,
            nullable=True
        )
    )

    # Create GIN index for fast full-text search
    op.create_index(
        'ix_tasks_search_vector',
        'tasks',
        ['search_vector'],
        postgresql_using='gin'
    )

    # Create function to update search_vector
    op.execute("""
        CREATE OR REPLACE FUNCTION tasks_search_vector_update() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector :=
                setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Create trigger to auto-update search_vector
    op.execute("""
        CREATE TRIGGER tasks_search_vector_trigger
        BEFORE INSERT OR UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION tasks_search_vector_update();
    """)

    # Populate existing rows
    op.execute("""
        UPDATE tasks SET search_vector =
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B');
    """)


def downgrade() -> None:
    # Drop trigger
    op.execute("DROP TRIGGER IF EXISTS tasks_search_vector_trigger ON tasks")

    # Drop function
    op.execute("DROP FUNCTION IF EXISTS tasks_search_vector_update()")

    # Drop index
    op.drop_index('ix_tasks_search_vector', table_name='tasks')

    # Drop column
    op.drop_column('tasks', 'search_vector')

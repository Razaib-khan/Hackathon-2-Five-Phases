"""Create performance indexes

Revision ID: 0007
Revises: 0006
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0007'
down_revision = '0006'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create performance indexes for tasks table."""
    # Index on priority for filtering
    op.create_index('idx_task_priority', 'tasks', ['priority'])

    # Partial index on due_date (only for tasks with due dates)
    op.create_index(
        'idx_task_due_date',
        'tasks',
        ['due_date'],
        postgresql_where=sa.text('due_date IS NOT NULL')
    )

    # Index on status for Kanban view filtering
    op.create_index('idx_task_status', 'tasks', ['status'])

    # Partial index on custom_order (only for manually ordered tasks)
    op.create_index(
        'idx_task_custom_order',
        'tasks',
        ['custom_order'],
        postgresql_where=sa.text('custom_order IS NOT NULL')
    )

    # Index on completed for filtering completed/incomplete tasks
    op.create_index('idx_task_completed', 'tasks', ['completed'])


def downgrade() -> None:
    """Drop performance indexes."""
    op.drop_index('idx_task_completed', table_name='tasks')
    op.drop_index('idx_task_custom_order', table_name='tasks')
    op.drop_index('idx_task_status', table_name='tasks')
    op.drop_index('idx_task_due_date', table_name='tasks')
    op.drop_index('idx_task_priority', table_name='tasks')

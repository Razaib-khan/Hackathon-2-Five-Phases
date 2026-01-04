"""Add new columns to tasks table

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add priority, due_date, status, time_spent, custom_order, recurrence_pattern, version columns to tasks."""
    # Add new columns
    op.add_column('tasks', sa.Column('priority', sa.String(10), nullable=False, server_default='none'))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('tasks', sa.Column('status', sa.String(20), nullable=False, server_default='todo'))
    op.add_column('tasks', sa.Column('time_spent', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('tasks', sa.Column('custom_order', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_pattern', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('tasks', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))

    # Add check constraints
    op.create_check_constraint(
        'tasks_priority_check',
        'tasks',
        "priority IN ('high', 'medium', 'low', 'none')"
    )
    op.create_check_constraint(
        'tasks_status_check',
        'tasks',
        "status IN ('todo', 'in_progress', 'done')"
    )
    op.create_check_constraint(
        'tasks_time_spent_check',
        'tasks',
        'time_spent >= 0'
    )


def downgrade() -> None:
    """Remove added columns from tasks."""
    # Drop check constraints first
    op.drop_constraint('tasks_time_spent_check', 'tasks', type_='check')
    op.drop_constraint('tasks_status_check', 'tasks', type_='check')
    op.drop_constraint('tasks_priority_check', 'tasks', type_='check')

    # Drop columns
    op.drop_column('tasks', 'version')
    op.drop_column('tasks', 'recurrence_pattern')
    op.drop_column('tasks', 'custom_order')
    op.drop_column('tasks', 'time_spent')
    op.drop_column('tasks', 'status')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')

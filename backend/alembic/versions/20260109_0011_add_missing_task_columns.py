"""Add missing columns to tasks table

Revision ID: 0011
Revises: 0010
Create Date: 2026-01-09 04:30:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0011'
down_revision = '0010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add missing columns to tasks table."""
    # Add the missing columns to tasks table
    op.add_column('tasks', sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('tasks', sa.Column('assigned_to', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('tasks', sa.Column('priority', sa.String(length=10), nullable=True))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('status', sa.String(length=20), nullable=True))
    op.add_column('tasks', sa.Column('time_spent', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('custom_order', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('recurrence_pattern', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('tasks', sa.Column('version', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True))

    # Set default values for existing records
    connection = op.get_bind()
    connection.execute(sa.text('''
        UPDATE tasks
        SET created_by = user_id,
            assigned_to = user_id,
            priority = 'none',
            status = 'todo',
            time_spent = 0,
            version = 1
        WHERE created_by IS NULL;
    '''))

    # Add indexes for performance
    op.create_index('ix_tasks_created_by', 'tasks', ['created_by'])
    op.create_index('ix_tasks_assigned_to', 'tasks', ['assigned_to'])
    op.create_index('ix_tasks_status', 'tasks', ['status'])


def downgrade() -> None:
    """Remove the added columns from tasks table."""
    op.drop_index('ix_tasks_status', table_name='tasks')
    op.drop_index('ix_tasks_assigned_to', table_name='tasks')
    op.drop_index('ix_tasks_created_by', table_name='tasks')

    op.drop_column('tasks', 'project_id')
    op.drop_column('tasks', 'version')
    op.drop_column('tasks', 'recurrence_pattern')
    op.drop_column('tasks', 'custom_order')
    op.drop_column('tasks', 'time_spent')
    op.drop_column('tasks', 'status')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
    op.drop_column('tasks', 'assigned_to')
    op.drop_column('tasks', 'created_by')
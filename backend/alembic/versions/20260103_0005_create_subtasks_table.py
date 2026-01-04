"""Create subtasks table

Revision ID: 0005
Revises: 0004
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create subtasks table with task_id FK and CASCADE delete."""
    op.create_table(
        'subtasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE')
    )

    # Create indexes for faster lookups
    op.create_index('idx_subtask_task_id', 'subtasks', ['task_id'])
    op.create_index('idx_subtask_order', 'subtasks', ['task_id', 'order_index'])


def downgrade() -> None:
    """Drop subtasks table."""
    op.drop_index('idx_subtask_order', table_name='subtasks')
    op.drop_index('idx_subtask_task_id', table_name='subtasks')
    op.drop_table('subtasks')

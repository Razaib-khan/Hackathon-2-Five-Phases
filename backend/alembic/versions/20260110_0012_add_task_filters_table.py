"""Add task_filters table

Revision ID: 20260110_0012
Revises: 20260109_0011
Create Date: 2026-01-10 00:12:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '20260110_0012'
down_revision = '20260109_0011'
branch_labels = None
depends_on = None


def upgrade():
    # Create task_filters table
    op.create_table(
        'task_filters',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('filter_config', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index for user_id
    op.create_index('ix_task_filters_user_id', 'task_filters', ['user_id'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_task_filters_user_id')

    # Drop table
    op.drop_table('task_filters')
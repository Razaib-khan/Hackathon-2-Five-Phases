"""Create user_settings table

Revision ID: 0006
Revises: 0005
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0006'
down_revision = '0005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create user_settings table with unique user_id constraint."""
    op.create_table(
        'user_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False, unique=True),
        sa.Column('theme', sa.String(10), nullable=False, server_default='system'),
        sa.Column('default_view', sa.String(10), nullable=False, server_default='list'),
        sa.Column('date_format', sa.String(20), nullable=False, server_default='MMM dd, yyyy'),
        sa.Column('week_start_day', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('animations_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('pomodoro_work_minutes', sa.Integer(), nullable=False, server_default='25'),
        sa.Column('pomodoro_break_minutes', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )

    # Add check constraints
    op.create_check_constraint(
        'user_settings_theme_check',
        'user_settings',
        "theme IN ('light', 'dark', 'system')"
    )
    op.create_check_constraint(
        'user_settings_default_view_check',
        'user_settings',
        "default_view IN ('list', 'kanban', 'calendar', 'matrix')"
    )
    op.create_check_constraint(
        'user_settings_week_start_day_check',
        'user_settings',
        'week_start_day IN (0, 1)'
    )
    op.create_check_constraint(
        'user_settings_pomodoro_work_check',
        'user_settings',
        'pomodoro_work_minutes > 0'
    )
    op.create_check_constraint(
        'user_settings_pomodoro_break_check',
        'user_settings',
        'pomodoro_break_minutes > 0'
    )

    # Create index on user_id for faster lookups
    op.create_index('idx_user_settings_user_id', 'user_settings', ['user_id'])


def downgrade() -> None:
    """Drop user_settings table."""
    op.drop_index('idx_user_settings_user_id', table_name='user_settings')
    op.drop_constraint('user_settings_pomodoro_break_check', 'user_settings', type_='check')
    op.drop_constraint('user_settings_pomodoro_work_check', 'user_settings', type_='check')
    op.drop_constraint('user_settings_week_start_day_check', 'user_settings', type_='check')
    op.drop_constraint('user_settings_default_view_check', 'user_settings', type_='check')
    op.drop_constraint('user_settings_theme_check', 'user_settings', type_='check')
    op.drop_table('user_settings')

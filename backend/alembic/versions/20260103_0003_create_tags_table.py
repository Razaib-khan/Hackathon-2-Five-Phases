"""Create tags table

Revision ID: 0003
Revises: 0002
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create tags table with user_id FK and unique constraint."""
    op.create_table(
        'tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('color', sa.String(7), nullable=False, server_default='#808080'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'name', name='tags_user_id_name_unique')
    )

    # Create index on user_id for faster lookups
    op.create_index('idx_tag_user_id', 'tags', ['user_id'])


def downgrade() -> None:
    """Drop tags table."""
    op.drop_index('idx_tag_user_id', table_name='tags')
    op.drop_table('tags')

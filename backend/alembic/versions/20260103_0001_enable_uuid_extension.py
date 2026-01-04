"""Enable UUID extension

Revision ID: 0001
Revises:
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Enable uuid-ossp extension for UUID generation."""
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')


def downgrade() -> None:
    """Drop uuid-ossp extension."""
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')

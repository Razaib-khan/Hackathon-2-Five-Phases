"""Update users table to match current model

Revision ID: 0010
Revises: 0009
Create Date: 2026-01-09 04:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0010'
down_revision = '0009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Update users table to match current model."""
    # Add missing columns to users table
    op.add_column('users', sa.Column('username', sa.String(length=255), nullable=True))  # Initially nullable
    op.add_column('users', sa.Column('first_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=True, server_default='false'))

    # Update existing records to have a username (generate from email if needed)
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE users SET username = email || '_' || id::text WHERE username IS NULL;
    """))

    # Now make username non-nullable and unique
    op.alter_column('users', 'username', nullable=False)

    # Create unique constraint and index for username
    op.create_unique_constraint('uq_users_username', 'users', ['username'])
    op.create_index('ix_users_username', 'users', ['username'])

    # Add created_at and updated_at columns if they don't exist
    op.add_column('users', sa.Column('created_at', sa.DateTime(timezone=True),
                                     server_default=sa.text('NOW()'), nullable=True))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(timezone=True),
                                     server_default=sa.text('NOW()'),
                                     onupdate=sa.text('NOW()'), nullable=True))

    # Update existing records to have timestamps
    connection.execute(sa.text("""
        UPDATE users SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL;
    """))

    # Make timestamps non-nullable
    op.alter_column('users', 'created_at', nullable=False)
    op.alter_column('users', 'updated_at', nullable=False)


def downgrade() -> None:
    """Revert the changes."""
    # Drop the added columns
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'created_at')
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')
    op.drop_index('ix_users_username', table_name='users')
    op.drop_constraint('uq_users_username', 'users', type_='unique')
    op.drop_column('users', 'username')
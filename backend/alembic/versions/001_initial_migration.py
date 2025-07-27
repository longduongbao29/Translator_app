"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2025-01-28 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'])
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create translations table
    op.create_table('translations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('source_text', sa.Text(), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('source_language', sa.String(10), nullable=False),
        sa.Column('target_language', sa.String(10), nullable=False),
        sa.Column('translation_engine', sa.String(50), default='google'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_translations_id'), 'translations', ['id'])

    # Create supported_languages table
    op.create_table('supported_languages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(10), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('native_name', sa.String(100), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('supports_offline', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index(op.f('ix_supported_languages_id'), 'supported_languages', ['id'])

    # Insert default supported languages
    op.execute("""
        INSERT INTO supported_languages (code, name, native_name, supports_offline) VALUES
        ('en', 'English', 'English', true),
        ('vi', 'Vietnamese', 'Tiếng Việt', true),
        ('fr', 'French', 'Français', true),
        ('de', 'German', 'Deutsch', true),
        ('es', 'Spanish', 'Español', true),
        ('ja', 'Japanese', '日本語', true),
        ('ko', 'Korean', '한국어', true),
        ('zh', 'Chinese', '中文', true),
        ('th', 'Thai', 'ไทย', false),
        ('ar', 'Arabic', 'العربية', false)
    """)

def downgrade():
    op.drop_table('supported_languages')
    op.drop_table('translations')
    op.drop_table('users')

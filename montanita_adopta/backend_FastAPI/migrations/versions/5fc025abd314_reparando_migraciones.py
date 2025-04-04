"""Reparando migraciones

Revision ID: 5fc025abd314
Revises: 
Create Date: 2025-03-19 19:13:46.401196

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5fc025abd314'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('mascotas', sa.Column('sexo', sa.String(length=20), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('mascotas', 'sexo')
    # ### end Alembic commands ###

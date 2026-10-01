"""Cloud seed helper: run schema.sql first, then create fictional records through the UI/API."""
from .config import settings
print('Configured database mode:',settings.database_mode)

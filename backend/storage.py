from pathlib import Path
from uuid import uuid4
from .config import settings
ALLOWED={'image/jpeg','image/png','image/webp','application/pdf'}; MAX=5*1024*1024
async def upload(uid,filename,ctype,data,purpose):
 if ctype not in ALLOWED: raise ValueError('Only JPG, PNG, WEBP and PDF files are allowed')
 if len(data)>MAX: raise ValueError('Maximum file size is 5 MB')
 name=(filename or 'upload').replace('\\','_').replace('/','_'); path=f'users/{uid}/{purpose}/{uuid4()}-{name}'
 if settings.storage_mode=='supabase':
  from supabase import create_client
  c=create_client(settings.supabase_url,settings.supabase_service_key); c.storage.from_(settings.supabase_bucket).upload(path,data,{'content-type':ctype,'upsert':'false'})
  return path,c.storage.from_(settings.supabase_bucket).get_public_url(path) if settings.supabase_bucket_public else None
 target=Path(__file__).parent/'local_uploads'/path; target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(data); return path,f'/local-files/{path}'
async def remove(path):
 if settings.storage_mode=='supabase':
  from supabase import create_client
  create_client(settings.supabase_url,settings.supabase_service_key).storage.from_(settings.supabase_bucket).remove([path]); return
 p=Path(__file__).parent/'local_uploads'/path
 if p.exists():p.unlink()

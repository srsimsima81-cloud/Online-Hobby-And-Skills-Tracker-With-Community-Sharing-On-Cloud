from datetime import datetime,timedelta,timezone
import jwt
from passlib.context import CryptContext
from fastapi import Depends,HTTPException
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from .config import settings
pwd=CryptContext(schemes=['bcrypt'],deprecated='auto'); bearer=HTTPBearer(auto_error=False)
def hash_password(x): return pwd.hash(x)
def verify_password(x,h): return pwd.verify(x,h)
def token(uid,role='user'): return jwt.encode({'sub':str(uid),'role':role,'exp':datetime.now(timezone.utc)+timedelta(minutes=settings.jwt_expire_minutes)},settings.jwt_secret,algorithm='HS256')
def current(c:HTTPAuthorizationCredentials=Depends(bearer)):
 if not c: raise HTTPException(401,'Authentication required')
 try: return jwt.decode(c.credentials,settings.jwt_secret,algorithms=['HS256'])
 except jwt.PyJWTError: raise HTTPException(401,'Invalid or expired token')
def uid(c=Depends(current)): return c['sub']

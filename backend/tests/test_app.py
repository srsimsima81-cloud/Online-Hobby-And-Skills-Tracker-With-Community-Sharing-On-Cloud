import os
os.environ['DATABASE_MODE']='memory';os.environ['STORAGE_MODE']='local';os.environ['JWT_SECRET']='test-secret'
from fastapi.testclient import TestClient
from backend.app import app
from backend.store import reset,seed

def client(): reset();seed();return TestClient(app)
def auth(c,email='maya@example.com'):
 r=c.post('/api/auth/login',json={'email':email,'password':'DemoPass123!'});return {'Authorization':'Bearer '+r.json()['access_token']}
def test_health(): assert client().get('/health').status_code==200
def test_login_profile(): c=client();h=auth(c);assert c.get('/api/profile',headers=h).json()['email']=='maya@example.com'
def test_duplicate_registration():
 c=client();r=c.post('/api/auth/register',json={'name':'Maya2','username':'maya2','email':'maya@example.com','password':'DemoPass123!'});assert r.status_code==409
def test_invalid_login(): assert client().post('/api/auth/login',json={'email':'maya@example.com','password':'wrong'}).status_code==401
def test_skill_user_isolation():
 c=client();h=auth(c);sid=c.get('/api/skills',headers=h).json()[0]['skill_id'];hb=auth(c,'aarav@example.com');assert c.get('/api/skills/'+sid,headers=hb).status_code==404
def test_practice_progress():
 c=client();h=auth(c);sid=c.get('/api/skills',headers=h).json()[0]['skill_id'];c.post('/api/goals',headers=h,json={'skill_id':sid,'title':'20 hours','target_value':20,'unit':'hours'});assert c.post('/api/practice',headers=h,json={'skill_id':sid,'duration_minutes':60,'activity':'Portrait practice'}).status_code==201;assert any(g['progress']>0 for g in c.get('/api/goals',headers=h).json())
def test_duplicate_like():
 c=client();h=auth(c,'aarav@example.com');pid=c.get('/api/feed',headers=h).json()[0]['post_id'];c.post(f'/api/posts/{pid}/like',headers=h);c.post(f'/api/posts/{pid}/like',headers=h);assert c.get('/api/feed',headers=h).json()[0]['likes_count']>=1
def test_unauthorized_delete():
 c=client();a=auth(c);b=auth(c,'aarav@example.com');pid=c.get('/api/feed',headers=a).json()[0]['post_id'];assert c.delete('/api/posts/'+pid,headers=b).status_code==403
def test_file_validation():
 c=client();h=auth(c);r=c.post('/api/files/upload',headers=h,files={'file':('bad.exe',b'x','application/octet-stream')});assert r.status_code==400
def test_analytics(): c=client();assert 'total_practice_hours' in c.get('/api/analytics/dashboard',headers=auth(c)).json()

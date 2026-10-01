from fastapi import FastAPI,Depends,HTTPException,UploadFile,File,Form,Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel,Field,EmailStr
from datetime import datetime, timezone, timedelta
from uuid import uuid4
from .config import settings
from .security import hash_password,verify_password,token,uid
from .store import *
from .analytics import progress,streak,longest
from .storage import upload,remove
from .cloud_store import cloud_enabled, load_cloud, sync_user, sync_delete
app=FastAPI(title='Cloud Hobby & Skills Tracker API',version='1.0.0')
if cloud_enabled(): load_cloud()
app.add_middleware(CORSMiddleware,allow_origins=settings.cors,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])

class Register(BaseModel): name:str=Field(min_length=2,max_length=120); username:str=Field(min_length=3,max_length=60); email:EmailStr; password:str=Field(min_length=8,max_length=128)
class Login(BaseModel): email:EmailStr; password:str
class Profile(BaseModel): name:str|None=None; bio:str|None=None; interests:str|None=None
class SkillIn(BaseModel): skill_name:str; category:str; current_level:str='BEGINNER'; target_level:str='INTERMEDIATE'; status:str='ACTIVE'; description:str=''
class GoalIn(BaseModel): skill_id:str; title:str; target_value:float=Field(gt=0); unit:str='hours'
class MilestoneIn(BaseModel): title:str; target_value:float=Field(gt=0)
class PracticeIn(BaseModel): skill_id:str; duration_minutes:int=Field(gt=0,le=1440); activity:str; notes:str=''
class PostIn(BaseModel): content:str=Field(min_length=1,max_length=2000); skill_id:str|None=None; media_url:str|None=None
class CommentIn(BaseModel): content:str=Field(min_length=1,max_length=1000)

@app.get('/')
def root():return {'name':'Cloud Hobby & Skills Tracker','status':'running','docs':'/docs'}
@app.get('/health')
def health():return {'status':'ok','database_mode':settings.database_mode,'storage_mode':settings.storage_mode}

def me(user):
 u=USERS.get(user); return {k:v for k,v in u.items() if k!='password_hash'} if u else None
@app.post('/api/auth/register',status_code=201)
def register(p:Register):
 seed()
 if any(u['email'].lower()==p.email.lower() for u in USERS.values()) or any(u['username'].lower()==p.username.lower() for u in USERS.values()): raise HTTPException(409,'Email or username already registered')
 i=str(uuid4());USERS[i]={'user_id':i,'name':p.name,'username':p.username,'email':p.email,'password_hash':hash_password(p.password),'profile_picture':None,'bio':'','interests':'','role':'user'};sync_user(i); return {'access_token':token(i),'token_type':'bearer'}
@app.post('/api/auth/login')
def login(p:Login):
 seed();u=next((x for x in USERS.values() if x['email'].lower()==p.email.lower()),None)
 if not u or not verify_password(p.password,u['password_hash']):raise HTTPException(401,'Invalid email or password')
 return {'access_token':token(u['user_id'],u['role']),'token_type':'bearer'}
@app.post('/api/auth/logout')
def logout():return {'message':'Discard the JWT on the client.'}
@app.get('/api/profile')
def profile(user=Depends(uid)):seed();return me(user) or (_ for _ in ()).throw(HTTPException(404,'User not found'))
@app.put('/api/profile')
def profile_update(p:Profile,user=Depends(uid)):
 seed();u=USERS.get(user)
 if not u: raise HTTPException(404,'User not found')
 for k,v in p.model_dump(exclude_none=True).items(): u[k]=v
 sync_user(user); return me(user)
@app.get('/api/skills')
def skills(user=Depends(uid)):seed();return [s for s in SKILLS.values() if s['user_id']==user]
@app.post('/api/skills',status_code=201)
def skill_create(p:SkillIn,user=Depends(uid)):seed();i=str(uuid4());SKILLS[i]={'skill_id':i,'user_id':user,**p.model_dump()}; sync_user(user); return SKILLS[i]
@app.get('/api/skills/{sid}')
def skill_get(sid,user=Depends(uid)):
 seed();s=SKILLS.get(sid)
 if not s or s['user_id']!=user: raise HTTPException(404,'Skill not found')
 return s
@app.put('/api/skills/{sid}')
def skill_update(sid,p:SkillIn,user=Depends(uid)):
 s=SKILLS.get(sid)
 if not s or s['user_id']!=user: raise HTTPException(404,'Skill not found')
 s.update(p.model_dump()); sync_user(user); return s
@app.delete('/api/skills/{sid}',status_code=204)
def skill_delete(sid,user=Depends(uid)):
 s=SKILLS.get(sid)
 if not s or s['user_id']!=user: raise HTTPException(404,'Skill not found')
 del SKILLS[sid]; sync_user(user)
@app.post('/api/goals',status_code=201)
def goal_create(p:GoalIn,user=Depends(uid)):
 seed();s=SKILLS.get(p.skill_id)
 if not s or s['user_id']!=user: raise HTTPException(404,'Skill not found')
 i=str(uuid4());g={'goal_id':i,'skill_id':p.skill_id,'user_id':user,'title':p.title,'target_value':p.target_value,'current_value':0,'unit':p.unit,'status':'ACTIVE'};GOALS[i]=g; sync_user(user); return {**g,'progress':0}
@app.get('/api/goals')
def goals(user=Depends(uid)):seed();return [{**g,'progress':progress(g['current_value'],g['target_value'])} for g in GOALS.values() if g['user_id']==user]
@app.post('/api/goals/{gid}/milestones',status_code=201)
def milestone_create(gid,p:MilestoneIn,user=Depends(uid)):
 g=GOALS.get(gid)
 if not g or g['user_id']!=user: raise HTTPException(404,'Goal not found')
 i=str(uuid4());m={'milestone_id':i,'goal_id':gid,**p.model_dump(),'achieved':False,'achieved_at':None};MILESTONES[i]=m; sync_user(user); return m
@app.get('/api/goals/{gid}/milestones')
def milestones(gid,user=Depends(uid)):
 g=GOALS.get(gid)
 if not g or g['user_id']!=user: raise HTTPException(404,'Goal not found')
 return [m for m in MILESTONES.values() if m['goal_id']==gid]
@app.post('/api/practice',status_code=201)
def practice_create(p:PracticeIn,user=Depends(uid)):
 seed();s=SKILLS.get(p.skill_id)
 if not s or s['user_id']!=user: raise HTTPException(404,'Skill not found')
 i=str(uuid4());r={'session_id':i,'user_id':user,**p.model_dump(),'practiced_at':datetime.now(timezone.utc)};PRACTICE[i]=r
 for g in GOALS.values():
  if g['user_id']==user and g['skill_id']==p.skill_id and g['status']=='ACTIVE':
   g['current_value']=min(g['target_value'],g['current_value']+p.duration_minutes/60);g['status']='COMPLETED' if g['current_value']>=g['target_value'] else 'ACTIVE'
   for m in MILESTONES.values():
    if m['goal_id']==g['goal_id'] and not m['achieved'] and g['current_value']>=m['target_value']:m['achieved']=True;m['achieved_at']=r['practiced_at']
 sync_user(user); return r
@app.get('/api/practice')
def practices(user=Depends(uid)):seed();return sorted([p for p in PRACTICE.values() if p['user_id']==user],key=lambda x:x['practiced_at'],reverse=True)
@app.get('/api/skills/{sid}/practice')
def skill_practice(sid,user=Depends(uid)):
 s=SKILLS.get(sid)
 if not s or s['user_id']!=user: raise HTTPException(404,'Skill not found')
 return [p for p in PRACTICE.values() if p['user_id']==user and p['skill_id']==sid]

def post_view(p,user):
 u=USERS[p['user_id']];s=SKILLS.get(p.get('skill_id'));return {**p,'username':u['username'],'name':u['name'],'skill_name':s['skill_name'] if s else None,'liked_by_me':(p['post_id'],user) in LIKES,'likes_count':sum(x[0]==p['post_id'] for x in LIKES),'comments_count':sum(x['post_id']==p['post_id'] for x in COMMENTS.values())}
@app.post('/api/posts',status_code=201)
def post_create(p:PostIn,user=Depends(uid)):
 seed()
 if p.skill_id and (p.skill_id not in SKILLS or SKILLS[p.skill_id]['user_id']!=user): raise HTTPException(404,'Skill not found')
 i=str(uuid4());POSTS[i]={'post_id':i,'user_id':user,**p.model_dump(),'created_at':datetime.now(timezone.utc)}; sync_user(user); return POSTS[i]
@app.get('/api/feed')
def feed(user=Depends(uid),search:str|None=Query(None)):seed();rows=sorted(POSTS.values(),key=lambda x:x['created_at'],reverse=True);return [post_view(p,user) for p in rows if not search or search.lower() in p['content'].lower()]
@app.delete('/api/posts/{pid}',status_code=204)
def post_delete(pid,user=Depends(uid)):
 p=POSTS.get(pid)
 if not p: raise HTTPException(404,'Post not found')
 if p['user_id']!=user: raise HTTPException(403,'You can delete only your own post')
 del POSTS[pid]; sync_user(user)
@app.post('/api/posts/{pid}/like')
def like(pid,user=Depends(uid)):
 seed()
 if pid not in POSTS: raise HTTPException(404,'Post not found')
 LIKES.add((pid,user)); sync_user(user); return {'liked':True}
@app.delete('/api/posts/{pid}/like')
def unlike(pid,user=Depends(uid)):
 LIKES.discard((pid,user)); sync_user(user); return {'liked':False}
@app.post('/api/posts/{pid}/comments',status_code=201)
def comment(pid,p:CommentIn,user=Depends(uid)):
 seed()
 if pid not in POSTS: raise HTTPException(404,'Post not found')
 i=str(uuid4());c={'comment_id':i,'post_id':pid,'user_id':user,'content':p.content,'created_at':datetime.now(timezone.utc)};COMMENTS[i]=c; sync_user(user); return c
@app.get('/api/posts/{pid}/comments')
def comments(pid,user=Depends(uid)):seed();return [{**c,'username':USERS[c['user_id']]['username']} for c in COMMENTS.values() if c['post_id']==pid]
@app.delete('/api/comments/{cid}',status_code=204)
def comment_delete(cid,user=Depends(uid)):
 c=COMMENTS.get(cid)
 if not c: raise HTTPException(404,'Comment not found')
 if c['user_id']!=user: raise HTTPException(403,'Only the comment owner can delete it')
 del COMMENTS[cid]; sync_user(user)
@app.post('/api/users/{target}/follow')
def follow(target,user=Depends(uid)):
 seed()
 if target==user: raise HTTPException(400,'Cannot follow yourself')
 if target not in USERS: raise HTTPException(404,'User not found')
 FOLLOWS.add((user,target)); sync_user(user); return {'following':True}
@app.delete('/api/users/{target}/follow')
def unfollow(target,user=Depends(uid)):
 FOLLOWS.discard((user,target)); sync_user(user); return {'following':False}
@app.post('/api/files/upload',status_code=201)
async def file_upload(file:UploadFile=File(...),purpose:str=Form('achievement'),user=Depends(uid)):
 data=await file.read()
 try:path,url=await upload(user,file.filename or 'upload',file.content_type or '',data,purpose)
 except ValueError as e:raise HTTPException(400,str(e))
 i=str(uuid4());FILES[i]={'file_id':i,'user_id':user,'object_path':path,'original_name':file.filename,'content_type':file.content_type,'size_bytes':len(data),'purpose':purpose,'url':url}; sync_user(user); return FILES[i]
@app.get('/api/files')
def files(user=Depends(uid)):return [f for f in FILES.values() if f['user_id']==user]
@app.delete('/api/files/{fid}',status_code=204)
async def file_delete(fid,user=Depends(uid)):
 f=FILES.get(fid)
 if not f or f['user_id']!=user: raise HTTPException(404,'File not found')
 await remove(f['object_path']);del FILES[fid]; sync_user(user)
@app.get('/api/analytics/dashboard')
def dashboard(user=Depends(uid)):
    seed()

    ss = [p for p in PRACTICE.values() if p['user_id'] == user]

    # Supabase returns timestamps as strings.
    # Convert them to timezone-aware datetime objects.
    for p in ss:
        if isinstance(p['practiced_at'], str):
            value = p['practiced_at'].replace('Z', '+00:00')
            p['practiced_at'] = datetime.fromisoformat(value)

    now = datetime.now(timezone.utc)

    weekly = sum(
        p['duration_minutes']
        for p in ss
        if p['practiced_at'] >= now - timedelta(days=7)
    ) / 60

    monthly = sum(
        p['duration_minutes']
        for p in ss
        if p['practiced_at'] >= now - timedelta(days=30)
    ) / 60

    total = sum(
        p['duration_minutes']
        for p in ss
    ) / 60

    by = {}

    for p in ss:
        n = SKILLS[p['skill_id']]['skill_name']
        by[n] = by.get(n, 0) + p['duration_minutes'] / 60

    gs = [
        g for g in GOALS.values()
        if g['user_id'] == user
    ]

    ms = [
        m for m in MILESTONES.values()
        if any(g['goal_id'] == m['goal_id'] for g in gs)
    ]

    ps = [
        p for p in POSTS.values()
        if p['user_id'] == user
    ]

    return {
        'total_practice_hours': round(total, 2),
        'weekly_practice_hours': round(weekly, 2),
        'monthly_practice_hours': round(monthly, 2),
        'most_practiced_skill': max(by, key=by.get) if by else None,
        'practice_hours_by_skill': by,
        'current_streak': streak([p['practiced_at'] for p in ss]),
        'longest_streak': longest([p['practiced_at'] for p in ss]),
        'goals_completed': sum(
            g['status'] == 'COMPLETED' for g in gs
        ),
        'active_goals': sum(
            g['status'] == 'ACTIVE' for g in gs
        ),
        'milestones_achieved': sum(
            m['achieved'] for m in ms
        ),
        'posts': len(ps),
        'likes_received': sum(
            x[0] == p['post_id']
            for p in ps
            for x in LIKES
        ),
        'comments_received': sum(
            c['post_id'] == p['post_id']
            for p in ps
            for c in COMMENTS.values()
        )
    }
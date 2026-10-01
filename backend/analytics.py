from datetime import datetime,timezone,timedelta
def progress(current,target): return round(min(100,(current/target*100) if target else 0),1)
def streak(dates):
 ds=sorted({d.date() for d in dates},reverse=True) if dates else []
 if not ds:return 0
 today=datetime.now(timezone.utc).date()
 if ds[0] not in {today,today-timedelta(days=1)}:return 0
 n=1
 for a,b in zip(ds,ds[1:]):
  if (a-b).days==1:n+=1
  else:break
 return n
def longest(dates):
 ds=sorted({d.date() for d in dates}) if dates else []
 if not ds:return 0
 best=n=1
 for a,b in zip(ds,ds[1:]): n=n+1 if (b-a).days==1 else 1; best=max(best,n)
 return best

from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
 database_mode:str='memory'; storage_mode:str='local'; database_url:str=''; supabase_url:str=''; supabase_service_key:str=''; supabase_bucket:str='hobby-files'; supabase_bucket_public:bool=False; jwt_secret:str='change-me'; jwt_expire_minutes:int=120; cors_origins:str='http://localhost:5173'
 model_config=SettingsConfigDict(env_file='.env',extra='ignore')
 @property
 def cors(self): return [x.strip() for x in self.cors_origins.split(',') if x.strip()]
settings=Settings()

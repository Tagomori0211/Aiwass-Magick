from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    default_model: str = "deepseek-v4-flash"
    max_input_length: int = 10000
    rate_limit_per_minute: int = 20
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:80"]
    obsidian_vault_path: str = "obsidian_vault"

    class Config:
        env_file = ".env"


settings = Settings()

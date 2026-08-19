import os
from functools import lru_cache
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env file."""

    # CognoDB (Neo4j Bolt Protocol) Connection Settings
    COGNODB_URI: str = "bolt+s://your-instance.databases.cognodb.cloud"
    COGNODB_USER: str = "cognodb"
    COGNODB_PASSWORD: str = "your-password"

    # Server Settings
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://frontend-gilt-xi-54.vercel.app",
    ]
    CORS_ORIGIN_REGEX: str = r"https:\/\/.*\.vercel\.app"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip().rstrip("/") for origin in v.split(",") if origin.strip()]
        if isinstance(v, list):
            return [origin.strip().rstrip("/") for origin in v if isinstance(origin, str) and origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()

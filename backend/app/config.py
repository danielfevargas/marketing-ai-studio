import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")  # service_role key (backend only)

    # Hugging Face (generación de imágenes)
    HF_API_TOKEN: str = os.getenv("HF_API_TOKEN", "")
    HF_MODEL_ID: str = os.getenv("HF_MODEL_ID", "black-forest-labs/FLUX.1-schnell")

    # Groq (simula el rol de Claude para edición de texto)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")


settings = Settings()

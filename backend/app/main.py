from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import images, content, collaboration, projects, teams

app = FastAPI(
    title="Marketing AI Studio API",
    description="API para generación de imágenes y edición de contenido con IA generativa, organizada por equipos.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router)
app.include_router(content.router)
app.include_router(collaboration.router)
app.include_router(projects.router)
app.include_router(teams.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "Marketing AI Studio API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
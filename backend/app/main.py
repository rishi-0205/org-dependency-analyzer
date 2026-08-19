import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_driver, close_driver, verify_connection
from app.exceptions import register_exception_handlers
from app.routers import dashboard, people, modules, search, graph

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("org_analyzer.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle, initializing and tearing down the Neo4j driver pool."""
    logger.info("Initializing Org Dependency Analyzer backend...")
    init_driver()
    try:
        verify_connection()
        logger.info("✅ Connected to CognoDB successfully.")
    except Exception as e:
        logger.warning("⚠️ Database connection check at startup notice: %s", e)

    yield

    logger.info("Shutting down Org Dependency Analyzer backend...")
    close_driver()


settings = get_settings()

app = FastAPI(
    title="Org Dependency & Bus-Factor Analyzer API",
    description="Graph-powered blast radius analysis and skill-backfill intelligence API for CognoDB.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handlers
register_exception_handlers(app)

# Register API Routers
app.include_router(dashboard.router)
app.include_router(people.router)
app.include_router(modules.router)
app.include_router(search.router)
app.include_router(graph.router)


@app.get("/", tags=["Health"])
def root():
    """Root health and status endpoint."""
    return {
        "app": "Org Dependency & Bus-Factor Analyzer API",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Database connectivity health check."""
    try:
        is_connected = verify_connection()
        return {"status": "healthy", "database_connected": is_connected}
    except Exception as exc:
        return {"status": "degraded", "database_connected": False, "error": str(exc)}

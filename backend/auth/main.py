from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from database import engine, Base
from routers import auth_routes, image_routes, result_routes, geospatial_routes
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="DepthWizard & 3D Fly Through API",
    description="College project backend for authentication, image validation, depth maps, 3D fly-through, geospatial summaries and result history.",
    version="1.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_routes.router)
app.include_router(image_routes.router)
app.include_router(result_routes.router)
app.include_router(geospatial_routes.router)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else "Request could not be completed."
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"status_code": exc.status_code, "message": detail}},
        headers=exc.headers,
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception):
    # Do not expose stack traces, filesystem paths, or internal exception details.
    return JSONResponse(status_code=500, content={"error": {"status_code": 500, "message": "Internal server error."}})



@app.get("/")
def root():
    return {"project": "DepthWizard & 3D Fly Through", "status": "running", "version": app.version, "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}

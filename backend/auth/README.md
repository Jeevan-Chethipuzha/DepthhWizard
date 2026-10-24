# DepthWizard & 3D Fly Through — Backend

College project backend built with:

- Python
- FastAPI
- SQLite
- SQLAlchemy
- JWT authentication
- Pillow
- OpenCV
- NumPy

## Features

1. User registration
2. User login with JWT
3. Protected APIs
4. Image upload
5. Image validation
6. User image history
7. Depth-map generation
8. Depth-based fly-through video
9. Result history
10. Result deletion
11. Swagger API documentation

## 1. Open the project

Open this `backend` folder in VS Code.

## 2. Create virtual environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3. Install packages

```bash
pip install -r requirements.txt
```

## 4. Run

```bash
uvicorn main:app --reload
```

## 5. Open Swagger

http://127.0.0.1:8000/docs

## API flow

### Register

POST `/auth/register`

```json
{
  "name": "Student",
  "email": "student@example.com",
  "password": "Password123"
}
```

### Login

POST `/auth/login`

```json
{
  "email": "student@example.com",
  "password": "Password123"
}
```

Copy the returned access token.

In Swagger click `Authorize` and enter:

```text
Bearer YOUR_TOKEN
```

### Upload

POST `/images/upload`

Choose a JPG/PNG image.

### Generate

POST `/results/generate/{image_id}`

Example:

```text
POST /results/generate/1
```

### History

GET `/results`

### One result

GET `/results/{result_id}`

### Delete

DELETE `/results/{result_id}`

## Output folders

Uploaded images:

```text
uploads/
```

Generated depth maps and videos:

```text
results/
```

Database:

```text
depthwizard.db
```

## Important project note

The included depth estimator is a lightweight baseline that converts image luminance into a normalized depth map. It is designed to make the complete backend runnable on a normal college laptop.

For the final AI version, replace:

```text
services/depth_estimation.py
```

with a pretrained monocular depth-estimation model such as Depth Anything or MiDaS. The rest of the backend can remain unchanged.

## Project explanation

The backend follows this flow:

User → Authentication → Image Upload → Validation → Depth Map → Fly-through → Results History

This architecture keeps authentication, database operations, image processing and AI processing separated into modules.


## Added backend topics

### 4. Elevation & Geospatial Processing
- `services/geospatial_processing.py` calculates normalized relative-depth statistics from generated depth maps.
- `routers/geospatial_routes.py` adds `GET /geospatial/results/{result_id}/elevation-summary`.
- The endpoint requires authentication and only returns a result belonging to the signed-in user.
- The current depth estimator produces relative depth, not survey-grade absolute elevation. Real-world elevation requires georeferencing and reference/scale data.

### 9. Database
- `database.py` configures SQLAlchemy and uses SQLite by default; set `DATABASE_URL` to use another supported database.
- `models.py` defines users, images, and results.
- `services/database_service.py` includes transaction rollback and owner-scoped record lookup helpers.

### 10. Error Handling & Security
- `main.py` returns consistent JSON error responses and hides unexpected internal exception details.
- `services/security.py` checks upload filename, MIME type, and file size (10 MB default; configure with `MAX_UPLOAD_BYTES`).
- Uploads are still decoded and validated by the existing image-validation service.
- Keep `SECRET_KEY` private and configure a strong value before deployment. Use HTTPS in production.

### Test the geospatial endpoint
1. Start the backend: `uvicorn main:app --reload`
2. Open `http://127.0.0.1:8000/docs`.
3. Register/login, upload an image, and generate a result.
4. Use the result ID with `GET /geospatial/results/{result_id}/elevation-summary`.


## Security fixes before public upload

- The public `/files` static mount has been removed so project files and `.env` cannot be served by that route.
- The real `.env` file is excluded from the ZIP; use `.env.example` as a template and set secrets through environment variables.
- `.gitignore` now keeps local database, uploaded files, and generated results out of Git while preserving `.gitkeep` placeholders.
- Set a unique, long `SECRET_KEY` and a suitable `DATABASE_URL` in the hosting platform before deployment.

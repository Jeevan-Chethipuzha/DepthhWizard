# Quick API Test Checklist

1. Start server:
   `uvicorn main:app --reload`

2. Open:
   `http://127.0.0.1:8000/docs`

3. Register:
   `POST /auth/register`

4. Login:
   `POST /auth/login`

5. Click Swagger `Authorize`.

6. Upload:
   `POST /images/upload`

7. Note the returned image ID.

8. Generate:
   `POST /results/generate/{image_id}`

9. Check:
   `GET /results`

10. Delete:
   `DELETE /results/{result_id}`

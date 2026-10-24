from flask import Flask, jsonify, request
import os
from PIL import Image
from transformers import pipeline
from terrain.terrain import terrain_bp
app = Flask(__name__)
app.register_blueprint(terrain_bp)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
projects = []
processing_jobs = []


@app.route("/")
def home():
    return jsonify({
        "message": "DepthWizard Backend is running!"
    })


# =========================
# PROJECT MANAGEMENT
# =========================

@app.route("/projects", methods=["GET"])
def get_projects():
    return jsonify(projects)


@app.route("/projects", methods=["POST"])
def create_project():
    data = request.get_json()

    project = {
        "id": len(projects) + 1,
        "name": data.get("name"),
        "description": data.get("description")
    }

    projects.append(project)

    return jsonify({
        "message": "Project created successfully",
        "project": project
    }), 201


# =========================
# PROCESSING STATUS
# =========================

@app.route("/processing-status", methods=["GET"])
def get_processing_status():
    return jsonify(processing_jobs)


@app.route("/processing-status", methods=["POST"])
def start_processing():
    data = request.get_json()

    job = {
        "id": len(processing_jobs) + 1,
        "project_id": data.get("project_id"),
        "file_name": data.get("file_name"),
        "status": "Processing"
    }

    processing_jobs.append(job)

    return jsonify({
        "message": "Processing started",
        "job": job
    }), 201


@app.route("/processing-status/<int:job_id>", methods=["PUT"])
def update_processing_status(job_id):
    data = request.get_json()

    for job in processing_jobs:
        if job["id"] == job_id:
            job["status"] = data.get("status", job["status"])

            return jsonify({
                "message": "Processing status updated",
                "job": job
            })

    return jsonify({
        "error": "Job not found"
    }), 404

# =========================
# AI TRACKING MODULE
# =========================

@app.route("/ai-tracking", methods=["GET"])
def get_ai_tracking():
    return jsonify({
        "module": "AI Tracking",
        "status": "Ready",
        "message": "DepthWizard AI tracking API is running"
    })


@app.route("/ai-tracking", methods=["POST"])
def start_ai_tracking():
    data = request.get_json(silent=True) or {}

    return jsonify({
        "message": "AI tracking request received",
        "project_id": data.get("project_id"),
        "image_name": data.get("image_name"),
        "status": "Pending",
        "note": "Actual terrain estimation and 3D reconstruction are not connected yet."
    }), 202
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({
            "error": "No file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected"
        }), 400

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        file.filename
    )

    file.save(file_path)

    job = {
        "id": len(processing_jobs) + 1,
        "file_name": file.filename,
        "status": "Uploaded"
    }

    processing_jobs.append(job)

    return jsonify({
        "message": "File uploaded successfully",
        "job": job
    }), 201

@app.route("/jobs", methods=["GET"])
def get_jobs():
    return jsonify(processing_jobs)



@app.route("/jobs/<int:job_id>/status", methods=["PUT"])
def update_job_status(job_id):
    for job in processing_jobs:
        if job["id"] == job_id:
            status = request.json.get("status")

            if status not in ["Uploaded", "Processing", "Completed", "Failed"]:
                return jsonify({"error": "Invalid status"}), 400

            job["status"] = status
            return jsonify({
                "message": "Status updated successfully",
                "job": job
            }), 200

    return jsonify({"error": "Job not found"}), 404

depth_estimator = None

@app.route("/depth/<int:job_id>", methods=["POST"])
def estimate_depth(job_id):
    global depth_estimator

    job = next(
        (j for j in processing_jobs if j["id"] == job_id),
        None
    )

    if job is None:
        return jsonify({"error": "Job not found"}), 404

    image_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        job["file_name"]
    )

    if not os.path.exists(image_path):
        return jsonify({"error": "Uploaded image not found"}), 404

    try:
        if depth_estimator is None:
            depth_estimator = pipeline(
                task="depth-estimation",
                model="depth-anything/Depth-Anything-V2-Small-hf"
            )

        result = depth_estimator(Image.open(image_path).convert("RGB"))

        output_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            f"depth_{job_id}.png"
        )
        result["depth"].save(output_path)

        job["status"] = "Completed"

        return jsonify({
            "message": "Depth estimation completed",
            "job_id": job_id,
            "depth_map": f"depth_{job_id}.png",
            "note": "Relative depth estimate only; not calibrated terrain elevation."
        }), 200

    except Exception as e:
        job["status"] = "Failed"
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
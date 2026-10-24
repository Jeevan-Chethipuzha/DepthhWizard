from flask import Blueprint, jsonify, request
import math

terrain_bp = Blueprint("terrain", __name__, url_prefix="/terrain")


@terrain_bp.route("/generate", methods=["POST"])
def generate_terrain():
    """
    Generate simple terrain data from an uploaded image/result.

    This is a demo terrain generator. It creates a height grid that
    the frontend can use for 3D visualization.
    """

    data = request.get_json(silent=True) or {}

    image_id = data.get("image_id")
    result_id = data.get("result_id")

    if not image_id and not result_id:
        return jsonify({
            "error": "image_id or result_id is required"
        }), 400

    # Demo height grid.
    # The frontend can convert these values into a 3D terrain surface.
    size = 20
    heights = []

    for y in range(size):
        row = []

        for x in range(size):
            distance_x = (x - size / 2) / (size / 2)
            distance_y = (y - size / 2) / (size / 2)

            distance = math.sqrt(
                distance_x ** 2 + distance_y ** 2
            )

            height = max(
                0,
                1.0 - distance
            )

            # Add smaller terrain variations.
            height += (
                math.sin(x * 0.7) * 0.08
                + math.cos(y * 0.5) * 0.06
            )

            row.append(round(max(0, height), 4))

        heights.append(row)

    return jsonify({
        "status": "success",
        "image_id": image_id,
        "result_id": result_id,
        "width": size,
        "height": size,
        "min_height": 0,
        "max_height": 1,
        "heights": heights,
        "units": "relative",
        "note": "Demo terrain surface. Heights are relative, not metres."
    })


@terrain_bp.route("/health", methods=["GET"])
def terrain_health():
    return jsonify({
        "status": "ok",
        "module": "terrain"
    })
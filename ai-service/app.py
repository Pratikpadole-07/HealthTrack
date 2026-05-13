from flask import Flask, request, jsonify
import joblib
import os
from difflib import get_close_matches
from datetime import datetime

app = Flask(__name__)

# ================= LOAD MODEL ONCE =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

model = joblib.load(os.path.join(MODEL_DIR, "symptom_model.pkl"))
mlb = joblib.load(os.path.join(MODEL_DIR, "symptom_binarizer.pkl"))

MODEL_VERSION = "v1.0.0"
KNOWN_SYMPTOMS = list(mlb.classes_)

# ================= SEVERITY RULES =================
SEVERITY_MAP = {
    "general physician": "mild",
    "gastroenterologist": "see-doctor",
    "pulmonologist": "see-doctor",
    "cardiologist": "emergency"
}

# ================= PREDICTION ENDPOINT =================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not data or "symptoms" not in data:
        return jsonify({"error": "symptoms field is required"}), 400

    raw_symptoms = data["symptoms"]
    if not isinstance(raw_symptoms, list):
        return jsonify({"error": "symptoms must be a list"}), 400

    normalized = []
    warnings = []

    # -------- Normalize + fuzzy match --------
    for s in raw_symptoms:
        if isinstance(s, dict):
            s = s.get("name", "")

        if not isinstance(s, str):
            continue

        s = s.lower().strip()

        if s in KNOWN_SYMPTOMS:
            normalized.append(s)
        else:
            match = get_close_matches(s, KNOWN_SYMPTOMS, n=1, cutoff=0.45)
            if match:
                normalized.append(match[0])
                warnings.append(f"mapped '{s}' -> '{match[0]}'")
            else:
                warnings.append(f"ignored '{s}'")

    if not normalized:
        return jsonify({
            "error": "no recognizable symptoms",
            "warnings": warnings
        }), 200

    # -------- Vectorize --------
    try:
        X = mlb.transform([normalized])
    except Exception:
        return jsonify({"error": "vectorization failed"}), 500

    # -------- Predict --------
    try:
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X)[0]
            idx = probs.argmax()
            primary_specialty = model.classes_[idx]
            confidence = round(float(probs[idx]), 2)
        else:
            primary_specialty = model.predict(X)[0]
            confidence = 0.7
    except Exception:
        return jsonify({"error": "prediction failed"}), 500

    # -------- Final SAFE response --------
    severity = SEVERITY_MAP.get(primary_specialty.lower(), "mild")

    return jsonify({
        "condition": f"Consult {primary_specialty.title()}",
        "recommended_specialty": primary_specialty,
        "severity": severity,
        "confidence": confidence,
        "matched_symptoms": normalized,
        "warnings": warnings,
        "model_version": MODEL_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    })

# ================= HEALTH CHECK =================
@app.route("/health", methods=["GET"])
def health():
    return {
        "status": "ok",
        "model_version": MODEL_VERSION
    }

# ================= RUN =================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

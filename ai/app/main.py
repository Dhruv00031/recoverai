import os
import joblib
from fastapi import FastAPI
from datetime import datetime, timezone
from app.intelligence import analyze_payment
from app.intelligence import (
    analyze_payment,
    classify_failure,
)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "recovery_model.joblib",
)

ml_model = joblib.load(MODEL_PATH)

app = FastAPI(
    title="RecoverAI Intelligence Service",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "RecoverAI AI Service is running",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "recoverai-ai",
        "status": "healthy",
    }


@app.get("/model")
def model_metadata():
    return {
        "success": True,
        "model": {
            "name": "RecoverAI Recovery Intelligence",
            "version": "recovery-v1",
            "type": "Logistic Regression",
            "status": "active"
        }
    }


@app.post("/predict")
def predict_payment(data: dict):
    failure_reason = data.get("failureReason")
    attempts = int(data.get("attempts", 1))
    amount = float(data.get("amount", 0))

    # Rule-based analysis
    rule_result = analyze_payment(
        failure_reason=failure_reason,
        attempts=attempts,
        amount=amount,
    )

    # Classify failure for ML feature encoding
    failure_type = classify_failure(failure_reason)

    failure_type_encoding = {
        "temporary_failure": 0,
        "network_failure": 1,
        "authentication_failure": 2,
        "insufficient_funds": 3,
        "hard_decline": 4,
        "unknown": 5,
    }

    encoded_failure_type = failure_type_encoding.get(
        failure_type,
        5,
    )

    # ML prediction
    ml_features = [[
        encoded_failure_type,
        attempts,
        amount,
    ]]

    ml_prediction = int(
        ml_model.predict(ml_features)[0]
    )

    ml_probability = float(
        ml_model.predict_proba(ml_features)[0][1]
    )

    return {
        "success": True,
        "data": {
            **rule_result,
            "mlPrediction": ml_prediction,
            "mlRecoveryProbability": round(
                ml_probability,
                2,
            ),
        },
    }

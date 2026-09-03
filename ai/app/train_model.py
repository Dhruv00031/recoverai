import os
import joblib
import random

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    roc_auc_score,
    confusion_matrix,
)

# ==========================================================
# RecoverAI ML Training
# Target:
#   1 = payment is likely recoverable
#   0 = payment is unlikely recoverable
#
# Features:
#   1. failure_type
#   2. attempts
#   3. amount
#
# NOTE:
# This is synthetic training data for the hackathon prototype.
# It should NOT be presented as proprietary/real payment data.
# ==========================================================

random.seed(42)

FAILURE_TYPES = {
    "temporary_failure": 0,
    "network_failure": 1,
    "authentication_failure": 2,
    "insufficient_funds": 3,
    "hard_decline": 4,
    "unknown": 5,
}


def generate_sample():
    """
    Generate one synthetic historical payment outcome.

    The outcome is intentionally based on plausible recovery
    behavior so that the model learns patterns rather than
    simply memorizing one label per failure type.
    """

    failure_type = random.choice(list(FAILURE_TYPES.keys()))
    failure_code = FAILURE_TYPES[failure_type]

    attempts = random.randint(1, 3)
    amount = random.randint(500, 150000)

    # Base probability by failure type.
    probability_by_type = {
        "temporary_failure": 0.88,
        "network_failure": 0.80,
        "authentication_failure": 0.65,
        "insufficient_funds": 0.45,
        "hard_decline": 0.12,
        "unknown": 0.35,
    }

    probability = probability_by_type[failure_type]

    # More attempts generally reduce the chance of recovery.
    probability -= max(0, attempts - 1) * 0.10

    # Very large transactions receive a small downward adjustment.
    if amount > 100000:
        probability -= 0.05
    elif amount < 5000:
        probability += 0.03

    # Clamp probability to a sensible range.
    probability = max(0.02, min(probability, 0.98))

    recovered = 1 if random.random() < probability else 0

    return [failure_code, attempts, amount], recovered


# ----------------------------------------------------------
# Generate synthetic dataset
# ----------------------------------------------------------

X = []
y = []

for _ in range(600):
    features, target = generate_sample()
    X.append(features)
    y.append(target)

print(f"Generated samples: {len(X)}")
print(f"Recovered samples: {sum(y)}")
print(f"Unrecovered samples: {len(y) - sum(y)}")


# ----------------------------------------------------------
# Train/test split
# ----------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


# ----------------------------------------------------------
# Train Logistic Regression
# ----------------------------------------------------------

model = LogisticRegression(
    max_iter=2000,
)

model.fit(X_train, y_train)


# ----------------------------------------------------------
# Evaluation
# ----------------------------------------------------------

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, predictions)
precision = precision_score(
    y_test,
    predictions,
    zero_division=0,
)
recall = recall_score(
    y_test,
    predictions,
    zero_division=0,
)
roc_auc = roc_auc_score(
    y_test,
    probabilities,
)

matrix = confusion_matrix(
    y_test,
    predictions,
)


print("\n==============================")
print("RecoverAI ML Evaluation")
print("==============================")

print(f"Accuracy : {accuracy:.3f}")
print(f"Precision: {precision:.3f}")
print(f"Recall   : {recall:.3f}")
print(f"ROC-AUC  : {roc_auc:.3f}")

print("\nConfusion Matrix:")
print(matrix)


# ----------------------------------------------------------
# Save model
# ----------------------------------------------------------

model_dir = os.path.join(
    os.path.dirname(__file__),
    "models",
)

os.makedirs(
    model_dir,
    exist_ok=True,
)

model_path = os.path.join(
    model_dir,
    "recovery_model.joblib",
)

joblib.dump(
    model,
    model_path,
)

print("\nML model trained successfully.")
print(f"Model saved to: {model_path}")
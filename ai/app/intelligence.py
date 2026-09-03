def classify_failure(failure_reason: str | None) -> str:
    """
    Classify a payment failure into a RecoverAI failure category.
    """

    if not failure_reason:
        return "unknown"

    reason = failure_reason.lower()

    if any(word in reason for word in [
        "timeout",
        "temporary",
        "processing",
        "try again",
    ]):
        return "temporary_failure"

    if any(word in reason for word in [
        "network",
        "connection",
        "gateway",
    ]):
        return "network_failure"

    if any(word in reason for word in [
        "authentication",
        "auth",
        "3ds",
        "otp",
    ]):
        return "authentication_failure"

    if any(word in reason for word in [
        "insufficient",
        "balance",
        "funds",
    ]):
        return "insufficient_funds"

    if any(word in reason for word in [
        "declined",
        "decline",
        "hard decline",
    ]):
        return "hard_decline"

    return "unknown"


def calculate_risk_score(
    failure_type: str,
    attempts: int = 1,
    amount: float = 0,
) -> int:
    """
    Calculate a simple 0-100 risk score.
    Higher score = higher recovery risk.
    """

    base_scores = {
        "temporary_failure": 18,
        "network_failure": 25,
        "authentication_failure": 40,
        "insufficient_funds": 55,
        "hard_decline": 85,
        "unknown": 70,
    }

    score = base_scores.get(failure_type, 70)

    # Repeated attempts increase risk.
    if attempts > 1:
        score += (attempts - 1) * 10

    # Large transactions receive a small additional risk factor.
    if amount > 100000:
        score += 5

    return min(score, 100)


def calculate_recovery_probability(
    risk_score: int,
) -> float:
    """
    Convert risk score into a recovery probability.
    """

    probability = 1 - (risk_score / 100)

    return round(max(0.0, min(probability, 1.0)), 2)


def recommend_action(
    failure_type: str,
    risk_score: int,
    recovery_probability: float,
) -> str:
    """
    Recommend a bounded recovery action.
    """

    if risk_score >= 80:
        return "manual_review"

    if recovery_probability < 0.6:
        return "manual_review"

    if failure_type in [
        "temporary_failure",
        "network_failure",
    ]:
        return "retry"

    if failure_type in [
        "authentication_failure",
        "insufficient_funds",
    ]:
        return "re_engage"

    return "manual_review"


def analyze_payment(
    failure_reason: str | None,
    attempts: int = 1,
    amount: float = 0,
) -> dict:
    """
    Complete RecoverAI rule-based analysis.
    """

    failure_type = classify_failure(failure_reason)

    risk_score = calculate_risk_score(
        failure_type=failure_type,
        attempts=attempts,
        amount=amount,
    )

    recovery_probability = calculate_recovery_probability(
        risk_score
    )

    recommended_action = recommend_action(
        failure_type=failure_type,
        risk_score=risk_score,
        recovery_probability=recovery_probability,
    )

    decision_factors = [
        failure_type,
        "low_risk" if risk_score < 40 else "elevated_risk",
        (
            "high_recovery_probability"
            if recovery_probability >= 0.8
            else "moderate_recovery_probability"
            if recovery_probability >= 0.6
            else "low_recovery_probability"
        ),
        (
            "retry_limit_not_reached"
            if attempts <= 2
            else "retry_limit_reached"
        ),
    ]

    return {
        "failureType": failure_type,
        "riskScore": risk_score,
        "recoveryProbability": recovery_probability,
        "recommendedAction": recommended_action,
        "decisionFactors": decision_factors,
        "modelVersion": "recovery-v1",
    }
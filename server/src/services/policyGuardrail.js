export function evaluatePolicy({
  policy,
  transaction,
  prediction,
}) {
  const reasons = [];
  const violations = [];

  if (!policy) {
    return {
      allowed: false,
      action: 'manual_review',
      reasons: ['No recovery policy found'],
      violations: ['policy_missing'],
      policyVersion: null,
    };
  }

  const riskScore = Number(prediction.riskScore ?? 100);
  const recoveryProbability = Number(
    prediction.recoveryProbability ?? 0
  );
  const attempts = Number(transaction.attempts ?? 0);
  const amount = Number(transaction.amount ?? 0);

  const recommendedAction =
    prediction.recommendedAction || 'manual_review';

  // ---------------------------------------------
  // Guardrail 1: Automatic recovery enabled
  // ---------------------------------------------

  if (!policy.automaticRecoveryEnabled) {
    violations.push('automatic_recovery_disabled');
  }

  // ---------------------------------------------
  // Guardrail 2: Risk score
  // ---------------------------------------------

  if (riskScore > policy.maxRisk) {
    violations.push('risk_score_exceeds_limit');
  } else {
    reasons.push('risk_score_within_limit');
  }

  // ---------------------------------------------
  // Guardrail 3: Recovery probability
  // ---------------------------------------------

  if (
    recoveryProbability <
    policy.minRecoveryProbability
  ) {
    violations.push(
      'recovery_probability_below_minimum'
    );
  } else {
    reasons.push(
      'recovery_probability_meets_minimum'
    );
  }

  // ---------------------------------------------
  // Guardrail 4: Retry limit
  // ---------------------------------------------

  if (attempts >= policy.maxAutomaticRetries) {
    violations.push('automatic_retry_limit_reached');
  } else {
    reasons.push('retry_limit_not_reached');
  }

  // ---------------------------------------------
  // Guardrail 5: Transaction value
  // ---------------------------------------------

  if (amount < policy.minTransactionValue) {
    violations.push(
      'transaction_value_below_minimum'
    );
  } else {
    reasons.push('transaction_value_meets_minimum');
  }

  // ---------------------------------------------
  // Guardrail 6: Maximum automatic recovery amount
  // ---------------------------------------------

  if (
    amount >
    policy.maxAutomaticRecoveryAmount
  ) {
    violations.push(
      'automatic_recovery_amount_exceeded'
    );
  } else {
    reasons.push(
      'automatic_recovery_amount_within_limit'
    );
  }

  // ---------------------------------------------
  // Determine final decision
  // ---------------------------------------------

  const allowed =
    violations.length === 0;

  let finalAction = recommendedAction;

  if (!allowed) {
    finalAction =
      policy.safetyRules?.policyViolationAction ||
      'manual_review';
  }

  return {
    allowed,
    action: finalAction,
    recommendedAction,
    reasons,
    violations,
    policyVersion: policy.version,
  };
}
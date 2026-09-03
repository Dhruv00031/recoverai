import RecoveryAction from '../models/RecoveryAction.js';
import RecoveryOpportunity from '../models/RecoveryOpportunity.js';
import Transaction from '../models/Transaction.js';
import RecoveryPolicy from '../models/RecoveryPolicy.js';
import AuditEvent from '../models/AuditEvent.js';

import { evaluatePolicy } from './policyGuardrail.js';


export async function executeRecovery({
  merchantId,
  transactionId,
  recoveryOpportunityId,
}) {

  console.log("🔥 RECOVERY EXECUTION FILE IS RUNNING 🔥");
  // --------------------------------------------------
  // 1. Find transaction
  // --------------------------------------------------

  console.log('RECOVERY DEBUG:', {
    merchantId: merchantId?.toString(),
    transactionId: transactionId?.toString(),
  });

  const transaction = await Transaction.findById(transactionId);

    console.log('DATABASE CHECK:', {
    found: !!transaction,
    transactionMerchantId: transaction?.merchantId?.toString(),
    expectedMerchantId: merchantId?.toString(),
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }


  // --------------------------------------------------
  // 2. Find recovery opportunity
  // --------------------------------------------------

  const opportunity = await RecoveryOpportunity.findOne({
    _id: recoveryOpportunityId,
    merchantId,
    transactionId,
  });

  if (!opportunity) {
    throw new Error('Recovery opportunity not found');
  }


  // --------------------------------------------------
  // 3. Get latest policy
  // --------------------------------------------------

  const policy = await RecoveryPolicy.findOne({
    merchantId,
  })
    .sort({ version: -1 });

  if (!policy) {
    throw new Error('Recovery policy not found');
  }


  // --------------------------------------------------
  // 4. Evaluate policy BEFORE execution
  // --------------------------------------------------

  const prediction = {
  failureType: transaction.failureType || 'unknown',

  riskScore: opportunity.riskScore,

  recoveryProbability:
    opportunity.recoveryProbability,

  recommendedAction:
    opportunity.recommendedAction,
  };

  const evaluation = evaluatePolicy({
    policy,
    transaction,
    prediction,
  });


  // --------------------------------------------------
  // 5. Create recovery action record
  // --------------------------------------------------

  const action = await RecoveryAction.create({
    merchantId,
    transactionId,
    recoveryOpportunityId,

    actionType:
      evaluation.action ||
      opportunity.recommendedAction,

    status: evaluation.allowed
      ? 'initiated'
      : 'blocked',

    initiatedBy: 'system',

    expectedRecoveryValue:
      opportunity.expectedRecoveryValue || 0,

    actualRecoveredValue: 0,

    policyVersion: policy.version,
  });


  // --------------------------------------------------
  // 6. Block if policy does not allow it
  // --------------------------------------------------

  if (!evaluation.allowed) {
    await AuditEvent.create({
      merchantId,
      transactionId,
      recoveryOpportunityId,

      eventType: 'recovery_action_blocked',

      actor: 'policy_engine',

      message:
        'Recovery action was blocked by policy guardrails.',

      metadata: {
        action: evaluation.action,
        recommendedAction:
          opportunity.recommendedAction,

        violations:
          evaluation.violations,

        policyVersion:
          policy.version,
      },

      policyVersion: policy.version,
    });


    return {
      executed: false,
      action,
      evaluation,
    };
  }


  // --------------------------------------------------
  // 7. Bounded demo execution
  // --------------------------------------------------
  //
  // IMPORTANT:
  // We do NOT perform a real payment retry here.
  // This is a safe demo execution.
  // --------------------------------------------------

  action.status = 'succeeded';

  await action.save();


  // --------------------------------------------------
  // 8. Update opportunity
  // --------------------------------------------------

  opportunity.status = 'in_progress';

  await opportunity.save();


  // --------------------------------------------------
  // 9. Record audit event
  // --------------------------------------------------

  await AuditEvent.create({
    merchantId,
    transactionId,
    recoveryOpportunityId,

    eventType: 'recovery_action_succeeded',

    actor: 'system',

    message:
      'Recovery action executed within configured policy guardrails.',

    metadata: {
      actionType: action.actionType,

      expectedRecoveryValue:
        opportunity.expectedRecoveryValue,

      policyVersion:
        policy.version,
    },

    policyVersion: policy.version,
  });


  return {
    executed: true,
    action,
    evaluation,
  };
}
# RecoverAI --- Product Requirements Document (PRD)

**Version:** 1.0\
**Date:** August 23, 2026\
**Track:** AI Revenue Recovery\
**Product:** RecoverAI\
**Document Status:** Source of truth for implementation

------------------------------------------------------------------------

## 1. Product Overview

### 1.1 Product Name

**RecoverAI**

### 1.2 One-line Description

RecoverAI is an AI-powered revenue recovery orchestrator that identifies
failed payments worth recovering, predicts recovery probability and
value, recommends the best intervention, checks merchant-defined
guardrails, and executes permitted recovery actions while recording
every decision.

### 1.3 Product Vision

Help merchants recover more legitimate revenue with fewer unnecessary
payment attempts by combining payment intelligence, recovery prediction,
merchant policies, and explainable automation.

### 1.4 Core Product Principle

> **AI should recommend and act within merchant-defined boundaries ---
> not operate without guardrails.**

------------------------------------------------------------------------

## 2. Problem Statement

Payment failures do not always represent lost customers or permanently
lost revenue.

A merchant may have:

-   temporary payment failures,
-   network failures,
-   authentication failures,
-   insufficient-funds situations,
-   recoverable payment-method issues,
-   or failures where retrying would be unnecessary or harmful.

Simple fixed-retry systems treat many failures similarly. This can lead
to:

-   poorly timed retries,
-   unnecessary payment attempts,
-   wasted customer interventions,
-   poor prioritization of high-value opportunities,
-   limited visibility into why a recovery action was chosen,
-   and difficulty proving how much revenue was actually recovered.

Merchants need a system that answers:

> **Which failed payments are worth recovering, what should we do, and
> why?**

------------------------------------------------------------------------

## 3. Proposed Solution

RecoverAI evaluates payment failures through a bounded recovery
pipeline:

``` text
Payment Failure
      ↓
Observe transaction
      ↓
Classify failure + collect context
      ↓
Estimate risk
      ↓
Predict recovery probability
      ↓
Estimate expected recovery value
      ↓
Check merchant guardrails
      ↓
Recommend recovery intervention
      ↓
Execute permitted action
      ↓
Stop when recovered / unsafe / policy-limited
      ↓
Record complete audit trail
```

The system prioritizes recovery opportunities based on expected business
value rather than simply retrying every failed payment.

------------------------------------------------------------------------

## 4. Target Users

### Primary User --- Merchant / Revenue Operations Team

A merchant using online payments who wants to:

-   monitor revenue at risk,
-   recover failed payments,
-   understand recovery opportunities,
-   control automation,
-   inspect individual AI decisions,
-   and measure recovered revenue.

### Secondary User --- Payment / Finance / Operations Analyst

A user who needs:

-   recovery analytics,
-   failure-type analysis,
-   strategy performance,
-   baseline comparison,
-   and auditability.

------------------------------------------------------------------------

## 5. MVP Goals

The MVP must demonstrate an end-to-end recovery workflow.

### Required MVP capabilities

1.  Revenue-at-risk detection
2.  Payment-failure classification
3.  Risk scoring
4.  Recovery-probability prediction
5.  Expected-recovery-value calculation
6.  AI recovery recommendation
7.  Recovery prioritization
8.  Merchant-defined guardrails
9.  Bounded automatic recovery action
10. Transaction investigation and explanation
11. Recovery analytics
12. Audit logging
13. Razorpay payment integration where permitted by the buildathon/API
    environment
14. A polished merchant-facing web application

------------------------------------------------------------------------

## 6. Core User Journey

### 6.1 Merchant Overview

Merchant opens RecoverAI and sees:

-   revenue at risk,
-   recoverable revenue,
-   recovered revenue,
-   recovery rate,
-   active AI recovery state.

### 6.2 Recovery Queue

Merchant opens the recovery queue and sees opportunities ranked by
recovery priority.

Priority considers:

-   transaction value,
-   recovery probability,
-   risk,
-   expected recovery value,
-   merchant policies,
-   retry/intervention history.

### 6.3 Transaction Investigation

Merchant opens an individual transaction.

RecoverAI displays:

-   payment failure,
-   risk score,
-   recovery probability,
-   expected recovery,
-   AI recommendation,
-   decision factors,
-   merchant guardrails,
-   audit timeline.

### 6.4 Recovery Action

If all guardrails pass, RecoverAI can recommend or execute a permitted
action.

Example:

``` text
Payment failed
↓
Risk = 18/100
↓
Recovery probability = 92%
↓
Expected recovery = ₹39,100
↓
Guardrails passed
↓
Recommendation = Retry
```

### 6.5 Audit

Every meaningful event is recorded:

-   failure,
-   observation,
-   risk calculation,
-   recovery prediction,
-   policy check,
-   AI recommendation,
-   recovery action,
-   final payment result.

------------------------------------------------------------------------

## 7. Functional Requirements

### FR-01 --- Transaction Intake

The system shall receive or ingest payment transaction information
required for recovery analysis.

Minimum useful information includes:

-   transaction/payment identifier,
-   amount,
-   payment status,
-   failure reason,
-   timestamp,
-   attempt count,
-   payment method category,
-   available historical context.

------------------------------------------------------------------------

### FR-02 --- Failure Classification

The system shall classify payment failures into meaningful recovery
categories such as:

-   Temporary Failure
-   Network Failure
-   Authentication Failure
-   Insufficient Funds
-   Hard Decline
-   Gateway/Processor Error
-   Other/Unknown

Classification may initially use deterministic rules and later
incorporate an ML model.

------------------------------------------------------------------------

### FR-03 --- Risk Scoring

The system shall calculate a normalized risk score.

Example:

``` text
0–30   Low
31–60  Medium
61–100 High
```

The exact production thresholds must remain configurable through
merchant policies.

------------------------------------------------------------------------

### FR-04 --- Recovery Probability

The system shall estimate the probability that a transaction can be
successfully recovered.

Example:

``` text
Recovery Probability = 92%
```

The MVP may use a lightweight ML model, calibrated heuristic, or hybrid
rule + model approach depending on available training data.

------------------------------------------------------------------------

### FR-05 --- Expected Recovery Value

The system shall calculate expected recovery value.

Conceptually:

``` text
Expected Recovery Value
= Transaction Amount × Recovery Probability
```

Additional business adjustments may later incorporate:

-   fees,
-   intervention cost,
-   policy constraints,
-   retry count,
-   or other merchant-specific factors.

------------------------------------------------------------------------

### FR-06 --- Recovery Recommendation

The system shall recommend an intervention based on transaction context,
predicted recovery, failure type, risk, and merchant policies.

Possible MVP actions:

-   Retry
-   Retry Later
-   Re-engage
-   Alternative Payment
-   Manual Review
-   Stop

------------------------------------------------------------------------

### FR-07 --- Recovery Priority

Each recovery opportunity shall receive a priority ranking.

Priority should favor opportunities where:

-   expected recovery value is high,
-   recovery probability is strong,
-   risk is acceptable,
-   and the recommended action is allowed.

The UI shall explain that priority is calculated using transaction
value, recovery probability, risk, and merchant recovery policy.

------------------------------------------------------------------------

### FR-08 --- Merchant Guardrails

Merchants shall be able to configure:

-   maximum risk,
-   minimum recovery probability,
-   maximum automatic retries,
-   maximum automatic recovery amount,
-   daily automatic recovery limit,
-   maximum customer interventions,
-   minimum transaction value,
-   safety behavior for high-risk/low-confidence/conflicting cases.

Example default policy:

``` text
Maximum Risk: 60/100
Minimum Recovery Probability: 60%
Maximum Automatic Retries: 2
Maximum Automatic Recovery Amount: ₹10,000
```

------------------------------------------------------------------------

### FR-09 --- Bounded Automation

RecoverAI shall only execute an automatic recovery action when
configured guardrails pass.

Conceptually:

``` text
IF
  risk <= max_risk
  AND recovery_probability >= min_probability
  AND attempts < max_attempts
  AND amount <= max_auto_amount
  AND policy allows action
THEN
  automatic action permitted
ELSE
  manual review / stop
```

------------------------------------------------------------------------

### FR-10 --- Transaction Investigation

The system shall provide an explainable transaction view showing:

-   transaction details,
-   risk,
-   recovery probability,
-   expected recovery,
-   attempts,
-   AI recommendation,
-   decision factors,
-   guardrail checks,
-   recommended action,
-   audit timeline.

The explanation must be concise and structured rather than a generic
chatbot response.

------------------------------------------------------------------------

### FR-11 --- Recovery Queue

The recovery queue shall support:

-   search,
-   filtering,
-   sorting,
-   priority ranking,
-   risk filtering,
-   recovery-probability filtering,
-   status filtering,
-   failure-type filtering,
-   transaction drill-down.

Example filters:

``` text
All
Ready
At Risk
High Value
Manual Review
Recovered
```

------------------------------------------------------------------------

### FR-12 --- Analytics

The system shall show:

-   revenue at risk,
-   eligible/recoverable revenue,
-   recovered revenue,
-   recovery rate,
-   recovery trend,
-   recovery funnel,
-   strategy performance,
-   recovery by failure type,
-   AI insights,
-   and RecoverAI vs fixed-retry baseline.

The baseline comparison should demonstrate whether intelligence improves
recovery outcomes and reduces unnecessary attempts.

------------------------------------------------------------------------

### FR-13 --- Policy Simulator

The merchant shall be able to test a transaction against current
policies.

Example:

``` text
Amount: ₹8,500
Risk: 18/100
Recovery Probability: 92%
Attempts: 1/2

↓ Guardrail Evaluation

✓ Risk threshold passed
✓ Recovery probability passed
✓ Retry limit passed
✓ Amount limit passed

↓ Decision

Automatic Recovery Permitted
Recommendation: Retry
```

------------------------------------------------------------------------

### FR-14 --- Audit Log

The system shall record:

-   transaction failure,
-   observation,
-   risk calculation,
-   recovery prediction,
-   policy check,
-   AI recommendation,
-   recovery action,
-   final result,
-   manual override,
-   blocked action,
-   failed action.

Each event should include, where available:

-   timestamp,
-   transaction,
-   source/actor,
-   event type,
-   important values,
-   result/status.

------------------------------------------------------------------------

### FR-15 --- System Actors

Audit records should distinguish between:

-   AI Engine
-   Policy Engine
-   Payment System
-   Merchant

This improves traceability and accountability.

------------------------------------------------------------------------

## 8. AI / Intelligence Requirements

### 8.1 Intelligence Architecture

The MVP should use a hybrid approach:

``` text
Rules
  +
Transaction Features
  +
ML Prediction
  +
Merchant Guardrails
  ▼
Recovery Decision
```

Rules provide deterministic safety and business logic.

ML provides prediction where useful.

Guardrails remain authoritative for automatic action.

### 8.2 Explainability

Every recommendation should expose concise decision factors.

Example:

``` text
AI Decision: RETRY

Why:
✓ Temporary failure
✓ Low risk
✓ Recovery probability above threshold
✓ Expected recovery value is high
✓ Retry limit not reached
```

### 8.3 AI Safety Principle

The model must never override merchant guardrails.

A high-confidence prediction does not automatically authorize an action
if policy rules prohibit it.

------------------------------------------------------------------------

## 9. Recovery Strategy Logic

Initial strategy mapping:

| Failure Type | Typical Recommendation | Automation |
|---|---|---|
| Temporary Failure | Retry | Automatic if guardrails pass |
| Network Failure | Retry Later | Automatic if guardrails pass |
| Authentication Failure | Re-engage | Automatic if configured |
| Insufficient Funds | Re-engage | Automatic if configured |
| Hard Decline | Manual Review | Manual |
| High Risk | Stop | Blocked |

This mapping is a starting policy and should remain configurable.

------------------------------------------------------------------------

## 10. Razorpay Integration

Razorpay should be used as the payment infrastructure/integration layer
where the buildathon's available APIs and rules permit.

The integration should support the MVP's demonstrated payment/recovery
flow without fabricating unsupported payment capabilities.

Integration responsibilities may include:

-   payment/order creation where required,
-   payment status retrieval,
-   relevant webhook/event handling,
-   payment failure information,
-   recovery action execution where the available API supports it,
-   and maintaining a local transaction/recovery record.

### Important

The application must clearly distinguish:

**Razorpay payment state**

from

**RecoverAI intelligence/decision state**.

RecoverAI does not replace the payment processor. It acts as the
intelligence/orchestration layer around the recovery workflow.

------------------------------------------------------------------------

## 11. Core Data Entities

### Transaction

``` text
id
paymentId
amount
currency
status
failureType
failureReason
paymentMethod
attempts
createdAt
updatedAt
```

### RecoveryOpportunity

``` text
transactionId
riskScore
recoveryProbability
expectedRecoveryValue
priorityScore
recommendedAction
status
reasoning
createdAt
updatedAt
```

### RecoveryPolicy

``` text
maxRisk
minRecoveryProbability
maxAutomaticRetries
maxAutomaticRecoveryAmount
dailyAutomaticRecoveryLimit
maxCustomerInterventions
minTransactionValue
safetyRules
version
updatedAt
```

### RecoveryAction

``` text
transactionId
actionType
status
approvedBy
executedAt
result
expectedRecoveryValue
actualRecoveredValue
```

### AuditEvent

``` text
transactionId
eventType
actor
timestamp
metadata
status
```

------------------------------------------------------------------------

## 12. Product Screens

The locked product design contains seven core screens.

### 1. Landing Page

Purpose:

Communicate the RecoverAI value proposition and visually demonstrate:

``` text
Payment Failed
→ AI Analysis
→ Recovery Decision
→ Recovered
```

### 2. Merchant Dashboard

Purpose:

Give merchants a command center for:

-   revenue intelligence,
-   recovery engine state,
-   recovery opportunities,
-   AI insights,
-   current queue.

### 3. Recovery Queue

Purpose:

Prioritize recovery opportunities by expected business value.

### 4. Transaction Investigation

Purpose:

Explain why RecoverAI recommends an action.

### 5. Analytics

Purpose:

Demonstrate recovered revenue and compare RecoverAI performance against
a fixed-retry baseline.

### 6. Recovery Policies

Purpose:

Give merchants control over AI autonomy and safety boundaries.

### 7. Audit Log

Purpose:

Provide complete decision and action traceability.

------------------------------------------------------------------------

## 13. Non-Functional Requirements

### Performance

-   Dashboard should load quickly for normal demo-sized datasets.
-   API responses should be predictable and reasonably fast.
-   Long-running AI calculations should not block the main application
    unnecessarily.

### Security

-   Secrets must never be committed.
-   Payment credentials and API keys must be stored in environment
    variables.
-   Sensitive payment information must not be exposed in logs.
-   Authorization must be enforced for merchant/admin operations.
-   Webhook authenticity should be validated where supported.

### Reliability

-   Recovery actions must be idempotent where applicable.
-   Duplicate webhook/event processing should not create duplicate
    recovery actions.
-   Failed recovery actions should be recorded.
-   Audit records should remain consistent with action state.

### Explainability

-   Every automatic decision must have structured reasons.
-   Policy checks must be visible.
-   Recovery actions must be traceable.

------------------------------------------------------------------------

## 14. Demo Dataset

The application will use a controlled synthetic/demo dataset for the
hackathon demonstration.

Important demo metrics currently represented in the locked designs
include:

``` text
Revenue at Risk: ₹12.4L
Recoverable: ₹8.7L
Recovered: ₹5.2L
Recovery Rate: 62%
```

Baseline comparison currently represented in the design:

``` text
Fixed Retry:
₹3.6L recovered
43% recovery rate
84 unnecessary attempts

RecoverAI:
₹5.2L recovered
62% recovery rate
31 unnecessary attempts
```

These numbers are **design/demo targets**, not claims of measured
production performance.

Before final submission, the implementation should replace any arbitrary
mock values with one internally consistent evaluation dataset.

------------------------------------------------------------------------

## 15. Success Metrics

The MVP should be evaluated using:

### Business

-   recovered revenue,
-   recovery rate,
-   expected vs actual recovery,
-   revenue recovered per intervention.

### Intelligence

-   recovery-probability quality,
-   failure classification quality,
-   recommendation quality,
-   priority ranking quality.

### Efficiency

-   unnecessary attempts,
-   successful recoveries per intervention,
-   automation rate,
-   manual-review rate.

### Trust

-   percentage of automatic actions with complete audit trail,
-   percentage of automatic actions passing all guardrails,
-   explainability completeness.

------------------------------------------------------------------------

## 16. Demo Scenario

The primary hackathon demonstration should follow one transaction from
failure to decision.

### Step 1 --- Payment fails

``` text
RX-28491
₹42,500
Temporary Failure
```

### Step 2 --- RecoverAI analyzes it

``` text
Risk: 18/100
Recovery Probability: 92%
Expected Recovery: ₹39,100
```

### Step 3 --- Policy engine checks guardrails

``` text
Risk threshold: PASS
Recovery probability: PASS
Retry limit: PASS
Amount limit: PASS
```

### Step 4 --- AI recommends

``` text
RETRY
Confidence: 92%
```

### Step 5 --- Merchant sees why

Structured decision factors are shown.

### Step 6 --- Recovery action

The permitted action is executed through the available payment
integration.

### Step 7 --- Result

The payment/recovery state updates.

### Step 8 --- Audit

The complete sequence appears in the audit trail.

### Step 9 --- Analytics

The recovered amount contributes to the overall recovery metrics.

This creates one continuous story across the application.

------------------------------------------------------------------------

## 17. MVP Scope

### Must Have

-   MERN-based web application
-   Merchant dashboard
-   Recovery queue
-   Transaction investigation
-   Recovery policies
-   Audit log
-   Analytics
-   Payment integration
-   Recovery decision engine
-   Failure classification
-   Risk scoring
-   Recovery probability
-   Expected recovery value
-   Guardrails
-   Explainable recommendations
-   Consistent demo dataset
-   Working end-to-end demo flow

### Should Have

-   Lightweight ML model
-   Webhook-driven state updates
-   Policy simulator
-   Recovery strategy performance
-   Baseline comparison
-   Live-looking AI processing state

### Could Have

-   More sophisticated ML models
-   Additional recovery channels
-   Advanced merchant segmentation
-   Adaptive policy suggestions
-   More payment methods
-   Historical model retraining

### Out of Scope for MVP

-   Chrome extension as a core product
-   Full autonomous agent with unrestricted authority
-   Large-scale production payment infrastructure
-   Complex multi-merchant enterprise administration
-   Unnecessary AI chatbot functionality
-   Features unrelated to revenue recovery

------------------------------------------------------------------------

## 18. Product Differentiation

RecoverAI is not positioned as:

> "AI that retries failed payments."

Instead:

> **RecoverAI is a bounded AI revenue recovery orchestrator that decides
> which revenue is worth recovering, predicts the probability and value
> of recovery, selects an appropriate intervention, operates within
> merchant-defined guardrails, and records why every action happened.**

Key differentiators:

1.  Recovery prioritization
2.  Expected recovery value
3.  Explainable AI decisions
4.  Merchant-controlled autonomy
5.  Guardrail-based execution
6.  Complete auditability
7.  Outcome-focused analytics
8.  Comparison against simplistic fixed retry

------------------------------------------------------------------------

## 19. UX / Product Principles

### Principle 1 --- Outcome over activity

Show recovered revenue, not just number of actions.

### Principle 2 --- Explainability over magic

Every important AI decision should answer:

> Why this action?

### Principle 3 --- Bounded autonomy

AI acts only within merchant-defined boundaries.

### Principle 4 --- Recovery value over transaction volume

Prioritize opportunities based on expected value.

### Principle 5 --- Trust through traceability

Every autonomous action should be auditable.

### Principle 6 --- Premium fintech UX

The application should feel like a serious financial operations product
rather than a generic admin dashboard.

------------------------------------------------------------------------

## 20. Non-Goals

RecoverAI is not intended to:

-   replace Razorpay or another payment processor,
-   guarantee successful recovery,
-   autonomously override merchant policies,
-   make unsupported claims about fraud or payment outcomes,
-   expose sensitive payment credentials,
-   or maximize retries regardless of customer/payment context.

------------------------------------------------------------------------

## 21. Final Product Statement

> **RecoverAI turns failed payments into intelligent recovery
> opportunities. It observes what happened, predicts what is worth
> recovering, checks whether it is safe and permitted to act, recommends
> the right intervention, and records the complete decision trail.**

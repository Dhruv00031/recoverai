# RecoverAI --- Technical Stack & Architecture Specification

**Version:** 1.0\
**Date:** August 23, 2026\
**Document Status:** Implementation source of truth\
**Related documents:** `PRD.md`, `DESIGN.md`

------------------------------------------------------------------------

# 1. Technical Objective

RecoverAI should be implemented as a practical, hackathon-ready web
application that:

-   matches the locked Stitch designs,
-   keeps the user's MERN-stack workflow central,
-   integrates with Razorpay using supported APIs/events,
-   separates payment infrastructure from intelligence,
-   provides explainable recovery decisions,
-   enforces merchant guardrails server-side,
-   records every important event,
-   and remains simple enough to build, test and demo reliably.

The architecture should avoid unnecessary enterprise complexity.

------------------------------------------------------------------------

# 2. Recommended Stack

## Frontend

``` text
React
Vite
JavaScript
Tailwind CSS
React Router
Axios
Recharts
```

### Responsibilities

-   Render the RecoverAI UI.
-   Handle navigation.
-   Fetch dashboard/queue/analytics data.
-   Display AI explanations and policy decisions.
-   Provide merchant policy controls.
-   Trigger permitted backend actions.
-   Show loading, success and error states.

------------------------------------------------------------------------

## Backend

``` text
Node.js
Express.js
JavaScript
```

### Responsibilities

-   REST API.
-   Authentication and authorization.
-   Transaction management.
-   Recovery queue.
-   Policy enforcement.
-   Recovery orchestration.
-   Razorpay API communication.
-   Razorpay webhook handling.
-   Audit logging.
-   Analytics aggregation.
-   Communication with the AI service.

------------------------------------------------------------------------

## Database

``` text
MongoDB Atlas
```

### Responsibilities

Store:

-   merchants/users,
-   transactions,
-   recovery opportunities,
-   policies,
-   recovery actions,
-   audit events,
-   model/decision metadata where useful.

MongoDB is chosen because:

-   it fits the MERN workflow,
-   transaction/recovery records are naturally document-oriented,
-   Atlas is straightforward for a hackathon,
-   and the user already works with MongoDB.

------------------------------------------------------------------------

## Intelligence Service

``` text
Python
FastAPI
scikit-learn
joblib
```

### Responsibilities

-   Failure classification where ML is used.
-   Recovery-probability prediction.
-   Risk scoring support.
-   Model inference.
-   Model metadata/version reporting.

The intelligence service should remain small.

It should NOT become a second full backend.

------------------------------------------------------------------------

## Payment Infrastructure

``` text
Razorpay Test Mode
Razorpay Orders API
Razorpay Payments APIs
Razorpay Webhooks
Razorpay Checkout where required
```

Razorpay remains the payment infrastructure.

RecoverAI is the intelligence/orchestration layer around it.

------------------------------------------------------------------------

## Deployment

Recommended hackathon setup:

``` text
Frontend
Vercel

Node/Express API
Render

Python/FastAPI AI Service
Render

MongoDB
MongoDB Atlas
```

A single backend host can also run both Node and Python services if the
deployment environment and time constraints make that simpler.

------------------------------------------------------------------------

# 3. High-Level Architecture

``` text
                         ┌──────────────────────┐
                         │      React UI        │
                         │   Vite + Tailwind    │
                         └──────────┬───────────┘
                                    │
                                  HTTPS
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Node + Express     │
                         │      API Server      │
                         └───────┬──────┬───────┘
                                 │      │
                 ┌───────────────┘      └────────────────┐
                 │                                        │
                 ▼                                        ▼
        ┌─────────────────┐                      ┌─────────────────┐
        │   MongoDB Atlas │                      │    Razorpay     │
        │  Application DB │                      │ APIs + Webhooks │
        └─────────────────┘                      └────────┬────────┘
                                                          │
                                                          │ webhook
                                                          ▼
                                                ┌──────────────────┐
                                                │ Express Webhook  │
                                                │     Handler      │
                                                └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ Recovery Engine  │
                                                │ + Policy Engine  │
                                                └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ FastAPI AI       │
                                                │ Intelligence     │
                                                └──────────────────┘
```

------------------------------------------------------------------------

# 4. Core Architectural Principle

RecoverAI must keep these responsibilities separate:

``` text
Razorpay
= payment infrastructure

RecoverAI Backend
= orchestration + business logic

Policy Engine
= merchant safety boundaries

AI Service
= prediction/intelligence

MongoDB
= application state + audit history

React
= merchant experience
```

No component should silently take over another component's
responsibility.

------------------------------------------------------------------------

# 5. Important Razorpay Integration Constraint

A critical implementation detail:

**Do not model "retry" as a magical Razorpay API that retries a failed
payment.**

Razorpay's Payments APIs are used for payment retrieval and for changing
an `authorized` payment to `captured`; they are not a generic API for
collecting a failed payment again.

Therefore, in RecoverAI:

``` text
AI Recommendation: RETRY
```

means:

> Initiate a new permitted payment attempt/recovery flow.

Depending on the available Razorpay integration, this can mean creating
a new Order and launching a new Checkout/payment attempt for the
customer.

Razorpay's Orders API supports creating orders and linking payments to
them.

This distinction must be reflected in the code and demo.

------------------------------------------------------------------------

# 6. Razorpay Event Flow

Razorpay webhooks should drive server-side payment state updates.

Razorpay documents `payment.failed` for failed payment notifications and
`payment.captured` / `order.paid` for successful payment states.
Webhooks are asynchronous server-to-server notifications and are
recommended for automation.

Recommended flow:

``` text
Customer Payment Attempt
        │
Razorpay
        │
payment.failed
        │
POST /api/webhooks/razorpay
        │
Verify Webhook Signature
        │
Store / update Transaction
        │
Create Recovery Opportunity
        │
Run Intelligence
        │
Calculate Expected Recovery
        │
Evaluate Merchant Policy
        │
Recommend Action
        │
Queue / Execute permitted action
```

Successful flow:

``` text
Customer completes recovery payment
        │
Razorpay
        │
payment.captured / order.paid
        │
Webhook
        │
Mark recovery successful
        │
Update recovered revenue
        │
Write Audit Event
        │
Update Analytics
```

Razorpay notes that `payment.failed` can be followed later by
`payment.captured`, including cases involving late authorization or a
subsequent retry. The implementation must therefore treat payment events
as state transitions rather than assuming a failed event is permanently
final.

------------------------------------------------------------------------

# 7. Webhook Security

The webhook endpoint must:

1.  Receive the raw request body.
2.  Verify Razorpay webhook signature using the configured webhook
    secret.
3.  Reject invalid signatures.
4.  Identify the event.
5.  Process it idempotently.
6.  Return a successful response only after safe processing/acceptance.

Razorpay specifically requires the raw webhook request body when
generating/verifying the signature.

Recommended endpoint:

``` text
POST /api/webhooks/razorpay
```

The Express webhook route should be configured so signature verification
can use the raw body before normal JSON parsing changes it.

------------------------------------------------------------------------

# 8. Backend Architecture

Recommended Express structure:

``` text
server/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── razorpay.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── RecoveryOpportunity.js
│   │   ├── RecoveryPolicy.js
│   │   ├── RecoveryAction.js
│   │   └── AuditEvent.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── transaction.routes.js
│   │   ├── recovery.routes.js
│   │   ├── policy.routes.js
│   │   ├── analytics.routes.js
│   │   ├── audit.routes.js
│   │   └── webhook.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── transaction.controller.js
│   │   ├── recovery.controller.js
│   │   ├── policy.controller.js
│   │   ├── analytics.controller.js
│   │   └── audit.controller.js
│   │
│   ├── services/
│   │   ├── razorpay.service.js
│   │   ├── recovery.service.js
│   │   ├── policy.service.js
│   │   ├── intelligence.service.js
│   │   ├── analytics.service.js
│   │   └── audit.service.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── webhook.middleware.js
│   │
│   ├── utils/
│   │   ├── scoring.js
│   │   ├── idempotency.js
│   │   └── logger.js
│   │
│   └── app.js
│
└── package.json
```

------------------------------------------------------------------------

# 9. Frontend Architecture

Recommended structure:

``` text
client/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── metrics/
│   │   ├── recovery/
│   │   ├── policies/
│   │   ├── audit/
│   │   ├── charts/
│   │   └── common/
│   │
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Dashboard.jsx
│   │   ├── RecoveryQueue.jsx
│   │   ├── TransactionInvestigation.jsx
│   │   ├── Analytics.jsx
│   │   ├── Policies.jsx
│   │   └── AuditLog.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── transactionApi.js
│   │   ├── recoveryApi.js
│   │   ├── policyApi.js
│   │   └── analyticsApi.js
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── data/
│   │   └── demoData.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

------------------------------------------------------------------------

# 10. API Design

Use REST APIs.

Base:

``` text
/api
```

## Authentication

``` text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Dashboard

``` text
GET /api/dashboard/summary
GET /api/dashboard/recent-recoveries
```

## Transactions

``` text
GET /api/transactions
GET /api/transactions/:id
GET /api/transactions/:id/audit
```

## Recovery

``` text
GET  /api/recovery/opportunities
GET  /api/recovery/opportunities/:id
POST /api/recovery/opportunities/:id/analyze
POST /api/recovery/opportunities/:id/approve
POST /api/recovery/opportunities/:id/manual-review
POST /api/recovery/opportunities/:id/stop
```

## Policies

``` text
GET  /api/policies
PUT  /api/policies
POST /api/policies/simulate
```

## Analytics

``` text
GET /api/analytics/summary
GET /api/analytics/trends
GET /api/analytics/strategies
GET /api/analytics/failure-types
GET /api/analytics/baseline
```

## Audit

``` text
GET /api/audit
GET /api/audit/:id
```

## Razorpay

``` text
POST /api/payments/create-order
GET  /api/payments/:paymentId
POST /api/webhooks/razorpay
```

------------------------------------------------------------------------

# 11. AI Architecture

## 11.1 Hybrid Intelligence

Do not build a huge AI system.

Use:

``` text
Transaction Features
       │
Rule-based Classification
       +
ML Probability Model
       │
Risk + Recovery Probability
       │
Expected Recovery
       │
Policy Engine
       │
Recommendation
```

This is easier to explain and safer to demo.

------------------------------------------------------------------------

# 12. AI Feature Set

The first model can use features such as:

``` text
transactionAmount
failureType
attemptCount
paymentMethod
timeOfDay
dayOfWeek
historicalSuccessRate
customerHistory
recentFailureCount
merchantPolicy
```

Only use fields that are actually available and legally/technically
appropriate in the integration.

Do not fabricate sensitive customer attributes.

------------------------------------------------------------------------

# 13. Model Strategy

## Stage 1 --- Baseline

Implement deterministic scoring first.

Example conceptual factors:

``` text
Temporary failure      + high recoverability
Network failure        + moderate/high recoverability
Hard decline           - low recoverability
Repeated attempts      - lower probability
Strong historical rate + higher probability
High risk              - lower probability
```

## Stage 2 --- ML

Train a small classifier/regressor using a controlled dataset.

Possible algorithms:

``` text
Logistic Regression
Random Forest
Gradient Boosting
```

Start with the simplest model that produces a useful probability.

Do not use a large language model to predict payment recovery
probability.

LLMs are not necessary for the core decision.

------------------------------------------------------------------------

# 14. AI Service API

FastAPI service:

``` text
POST /predict
POST /classify
GET  /health
GET  /model-info
```

Example request:

``` json
{
  "amount": 42500,
  "failureType": "temporary_failure",
  "attemptCount": 1,
  "paymentMethod": "card",
  "historicalSuccessRate": 0.87
}
```

Example response:

``` json
{
  "riskScore": 18,
  "recoveryProbability": 0.92,
  "confidence": 0.92,
  "modelVersion": "recovery-v1",
  "factors": [
    "temporary_failure",
    "low_risk",
    "high_historical_success"
  ]
}
```

The Node backend remains responsible for policy evaluation and final
authorization.

------------------------------------------------------------------------

# 15. Policy Engine

The Policy Engine should be deterministic.

``` javascript
function evaluatePolicy(transaction, prediction, policy) {

    if (prediction.riskScore > policy.maxRisk)
        return BLOCK_OR_REVIEW;

    if (prediction.recoveryProbability < policy.minRecoveryProbability)
        return BLOCK_OR_REVIEW;

    if (transaction.attempts >= policy.maxAutomaticRetries)
        return BLOCK_OR_REVIEW;

    if (transaction.amount > policy.maxAutomaticRecoveryAmount)
        return BLOCK_OR_REVIEW;

    return ALLOWED;
}
```

The AI service cannot override this result.

------------------------------------------------------------------------

# 16. Recommendation Engine

After prediction and policy evaluation:

``` text
if policy fails:
    Manual Review / Stop

else if failureType == temporary_failure:
    Retry

else if failureType == network_failure:
    Retry Later

else if failureType == authentication_failure:
    Re-engage

else if failureType == insufficient_funds:
    Re-engage

else if failureType == hard_decline:
    Manual Review
```

This should be implemented as explicit, testable business logic.

------------------------------------------------------------------------

# 17. Recovery Action Model

Important distinction:

``` text
Recommendation
≠
Permission
≠
Execution
```

Example:

``` text
AI recommends RETRY
        │
Policy Engine says ALLOWED
        │
Backend creates/initiates permitted recovery flow
        │
Razorpay processes the new payment attempt
        │
Webhook confirms outcome
```

This separation is essential.

------------------------------------------------------------------------

# 18. Expected Recovery Calculation

Initial formula:

``` text
expectedRecoveryValue
=
transactionAmount
*
recoveryProbability
```

Example:

``` text
₹42,500 * 0.92
=
₹39,100
```

For implementation, keep currency calculations in the smallest currency
unit where possible to reduce floating-point errors.

Display:

``` text
₹39,100
```

but store:

``` text
3910000 paise
```

for ₹39,100.

------------------------------------------------------------------------

# 19. MongoDB Data Models

## Transaction

``` js
{
  merchantId,
  razorpayOrderId,
  razorpayPaymentId,
  amount,
  currency,
  status,
  failureType,
  failureReason,
  paymentMethod,
  attempts,
  customerRef,
  createdAt,
  updatedAt
}
```

## RecoveryOpportunity

``` js
{
  merchantId,
  transactionId,
  riskScore,
  recoveryProbability,
  expectedRecoveryValue,
  priorityScore,
  recommendedAction,
  status,
  decisionFactors,
  modelVersion,
  createdAt,
  updatedAt
}
```

## RecoveryPolicy

``` js
{
  merchantId,
  maxRisk,
  minRecoveryProbability,
  maxAutomaticRetries,
  maxAutomaticRecoveryAmount,
  dailyAutomaticRecoveryLimit,
  maxCustomerInterventions,
  minTransactionValue,
  safetyRules,
  version,
  updatedAt
}
```

## RecoveryAction

``` js
{
  merchantId,
  transactionId,
  actionType,
  status,
  initiatedBy,
  expectedRecoveryValue,
  actualRecoveredValue,
  razorpayOrderId,
  razorpayPaymentId,
  result,
  createdAt,
  completedAt
}
```

## AuditEvent

``` js
{
  merchantId,
  transactionId,
  eventType,
  actor,
  timestamp,
  status,
  metadata
}
```

------------------------------------------------------------------------

# 20. Idempotency

This is mandatory for payment/recovery workflows.

A webhook can be delivered more than once.

The backend should maintain an event identifier or equivalent
deduplication key.

Conceptually:

``` text
Receive webhook
      │
Have we processed this event?
      │
YES → return safely
NO  → process + record event
```

Recovery actions should also prevent duplicate execution.

For example:

``` text
One recovery opportunity
+
One active recovery action
=
No duplicate automatic action
```

------------------------------------------------------------------------

# 21. Authentication

For the MVP:

``` text
JWT-based authentication
```

Use:

``` text
bcrypt
jsonwebtoken
HTTP-only cookie or secure token handling
```

The authenticated user should be associated with a merchant/account.

All merchant-specific queries must filter by:

``` text
merchantId
```

A user must never be able to fetch another merchant's transactions by
changing an ID in the URL.

------------------------------------------------------------------------

# 22. Environment Variables

## Backend

``` text
PORT=
MONGODB_URI=

JWT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

AI_SERVICE_URL=
CLIENT_URL=
```

## Frontend

``` text
VITE_API_BASE_URL=
VITE_RAZORPAY_KEY_ID=
```

Only public/client-safe values may use the `VITE_` prefix.

Never expose:

``` text
RAZORPAY_KEY_SECRET
JWT_SECRET
RAZORPAY_WEBHOOK_SECRET
```

to the frontend.

------------------------------------------------------------------------

# 23. `.gitignore`

Minimum:

``` text
node_modules/
.env
.env.local
.env.*.local
dist/
build/
__pycache__/
*.pyc
.venv/
```

Never commit payment secrets or model artifacts containing sensitive
data.

------------------------------------------------------------------------

# 24. Security Requirements

## API

-   Validate input.
-   Authenticate protected routes.
-   Authorize merchant ownership.
-   Rate-limit sensitive endpoints where practical.
-   Return safe error messages.

## Razorpay

-   Keep secret credentials server-side.
-   Verify webhook signatures.
-   Use Test Mode for development.
-   Do not expose raw secrets in logs.

## Database

-   Restrict Atlas network access appropriately.
-   Use strong credentials.
-   Avoid storing unnecessary sensitive payment data.

------------------------------------------------------------------------

# 25. Error Handling

Use a consistent API format:

``` json
{
  "success": false,
  "message": "Recovery action could not be completed.",
  "code": "RECOVERY_ACTION_FAILED"
}
```

Do not expose stack traces to users.

------------------------------------------------------------------------

# 26. Logging

Log important server-side events:

``` text
INFO
Webhook received

INFO
Transaction updated

INFO
Recovery analysis completed

INFO
Policy evaluation completed

WARN
Recovery blocked by policy

ERROR
Razorpay API request failed
```

Never log:

-   API secrets,
-   webhook secrets,
-   full card numbers,
-   sensitive credentials.

------------------------------------------------------------------------

# 27. Analytics Architecture

Do not calculate every dashboard number independently in every React
component.

Create backend analytics endpoints.

Example:

``` text
GET /api/analytics/summary
```

returns:

``` json
{
  "revenueAtRisk": 1240000,
  "recoverableRevenue": 870000,
  "recoveredRevenue": 520000,
  "recoveryRate": 62
}
```

Charts should consume API data.

Demo mode may use seeded data, but the data should still come through
the same API shape.

------------------------------------------------------------------------

# 28. Demo Mode

The application should support a controlled demo dataset.

Recommended:

``` text
NODE_ENV=development
DEMO_MODE=true
```

or a dedicated seed command:

``` text
npm run seed
```

The seed should create:

-   merchant,
-   policies,
-   representative transactions,
-   recovery opportunities,
-   audit events,
-   analytics data.

Important:

Do not hardcode separate fake numbers into individual React components.

Use one seeded source of truth.

------------------------------------------------------------------------

# 29. Canonical Demo Transaction

Use:

``` text
Transaction:
RX-28491

Amount:
₹42,500

Failure:
Temporary Failure

Risk:
18/100

Recovery Probability:
92%

Expected Recovery:
₹39,100

Attempts:
1/2

AI Decision:
RETRY
```

The transaction state should be consistent across:

-   Dashboard
-   Recovery Queue
-   Transaction Investigation
-   Policies simulator
-   Audit Log

------------------------------------------------------------------------

# 30. Baseline Evaluation

For the hackathon, create a simple baseline:

``` text
Fixed Retry Strategy
```

Compare it with:

``` text
RecoverAI Strategy
```

Measure:

-   recovered revenue,
-   recovery rate,
-   number of attempts,
-   unnecessary attempts,
-   successful recoveries.

The baseline should use the same evaluation dataset.

Do not present design mock values as measured production results.

------------------------------------------------------------------------

# 31. Testing Strategy

## Backend Unit Tests

Test:

-   risk scoring,
-   expected recovery calculation,
-   policy evaluation,
-   recommendation logic,
-   priority calculation,
-   idempotency,
-   authorization.

## AI Tests

Test:

-   valid feature input,
-   prediction output range,
-   probability bounds,
-   model loading,
-   model version.

## API Tests

Test:

-   authentication,
-   transaction retrieval,
-   policy update,
-   policy simulation,
-   recovery approval,
-   manual review,
-   audit retrieval.

## Razorpay Integration Tests

Use Test Mode.

Test:

-   order creation,
-   payment success,
-   payment failure,
-   webhook processing,
-   webhook signature validation,
-   duplicate webhook handling.

## Frontend Tests

At minimum manually verify:

-   navigation,
-   filters,
-   transaction drill-down,
-   policy simulator,
-   loading/error states,
-   responsive layout.

------------------------------------------------------------------------

# 32. Implementation Order

Build sequentially.

(Full implementation order detailed in implementation_plan.md)

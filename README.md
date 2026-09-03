# RecoverAI

RecoverAI is an AI-powered revenue recovery orchestrator designed to help merchants intelligently handle failed payments.

Instead of blindly retrying every failed transaction, RecoverAI analyzes payment failure signals, estimates recovery probability and risk, evaluates the decision against merchant-configured policy guardrails, and recommends or executes an appropriate recovery action.

## Problem

Failed payments can directly lead to lost revenue. However, automatically retrying every failed payment can also increase customer friction, unnecessary retries, and operational risk.

RecoverAI addresses this by introducing an intelligent recovery decision layer between a failed payment and the recovery action.

## How RecoverAI Works

The system follows this flow:

1. A payment failure is detected.
2. Transaction and failure information is sent to the AI intelligence service.
3. RecoverAI analyzes the failure and calculates:
   - Risk score
   - Recovery probability
   - Recommended recovery action
4. The recommendation is evaluated against merchant policy guardrails.
5. If the decision satisfies the configured guardrails, the recovery action can proceed.
6. If a guardrail is violated, the configured safety action is applied, such as manual review or stopping recovery.
7. The complete recovery decision and execution flow can be inspected through the audit and investigation interfaces.

## AI & Intelligence

RecoverAI uses a combination of rule-based payment analysis and machine learning.

### Rule-Based Intelligence

Payment failures are classified into categories such as:

- Temporary failure
- Network failure
- Authentication failure
- Insufficient funds
- Hard decline
- Unknown failure

Transaction information such as failure type, amount, and retry attempts is used during analysis.

### Machine Learning

The AI service contains a Logistic Regression recovery model.

The model receives encoded failure information together with transaction attempts and amount and produces:

- Recovery prediction
- Recovery probability

The resulting intelligence is then used by the recovery orchestration layer.

## Policy Guardrails

AI recommendations are not executed blindly.

RecoverAI validates recommendations against merchant-configured policies including:

- Maximum risk score
- Minimum recovery probability
- Maximum automatic retries
- Minimum transaction value
- Maximum automatic recovery amount
- Automatic recovery enable/disable setting
- Policy violation action

This provides a governance layer around AI-generated recovery decisions.

## Razorpay Integration

RecoverAI includes Razorpay Test Mode integration for demonstrating the payment recovery workflow.

The test flow supports:

- Razorpay Test Mode order creation
- Payment simulation
- Payment capture
- Signature verification using HMAC-SHA256
- Recovery execution testing

No real-money payment processing is required for the demonstration.

## Application Architecture

RecoverAI is divided into three main services:

### `/client`

React + Vite frontend application.

Provides the dashboard and interfaces for:

- Recovery Queue
- Recovery Analytics
- Transaction Investigation
- Audit Log
- Policy Management
- Payment testing

### `/server`

Node.js + Express.js orchestration/API service.

Responsible for:

- REST APIs
- Authentication
- Transaction management
- Recovery orchestration
- Policy guardrail evaluation
- Audit events
- Razorpay integration
- Database communication

### `/ai`

Python + FastAPI intelligence service.

Responsible for:

- Payment failure analysis
- Failure classification
- ML prediction
- Recovery probability estimation
- Model metadata

### `/docs`

Contains project specifications, design references, and technical documentation.

## Technology Stack

### Frontend
- React
- Vite
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication

### AI Service
- Python
- FastAPI
- scikit-learn
- Joblib

### Payment Integration
- Razorpay Test Mode

## Project Structure

```text
recoverai/
├── ai/
│   ├── app/
│   │   ├── main.py
│   │   ├── intelligence.py
│   │   ├── train_model.py
│   │   └── models/
│   │       └── recovery_model.joblib
│   └── requirements.txt
│
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── seed/
│   └── package.json
│
├── docs/
├── package.json
└── README.md

# RecoverAI

RecoverAI is an AI-powered revenue recovery orchestrator. It observes failed payments, calculates transaction risks and recovery probabilities, validates actions against merchant safety guardrails, and executes permitted recovery flows through Razorpay integration.

## Architecture Outline
- **/server**: Node.js & Express.js orchestrator API, database interface, and webhook listener.
- **/client**: React, Vite & Tailwind CSS premium dark UI dashboard.
- **/ai**: Python & FastAPI intelligence service containing the classification rules and ML models.
- **/docs**: Product specs, design targets, and tech specs.

## Running Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB Atlas database URI
- Razorpay Test Account credentials

### Setup Details
Refer to the respective subdirectory READMEs for installation and running commands.

import axios from 'axios';

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export async function getPrediction(transaction) {
  const response = await axios.post(
    `${AI_SERVICE_URL}/predict`,
    {
      failureReason: transaction.failureReason,
      attempts: transaction.attempts || 1,
      amount: transaction.amount || 0,
    },
    {
      timeout: 10000,
    }
  );

  return response.data.data || response.data;
}

export async function getModelMetadata() {
  const response = await axios.get(
    `${AI_SERVICE_URL}/model`,
    {
      timeout: 5000,
    }
  );

  return response.data;
}
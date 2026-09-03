import express from 'express';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.get('/protected', authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'You have access to this protected route',
    user: req.user,
  });
});

export default router;
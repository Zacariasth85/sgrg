const express = require('express');
const WebhookService = require('../services/webhook');

const router = express.Router();
const webhookService = new WebhookService();

// GitHub webhook endpoint
router.post('/github', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Verify webhook signature
    if (!webhookService.verifySignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse JSON payload
    const parsedPayload = JSON.parse(payload.toString());

    // Handle the webhook event
    await webhookService.handleWebhook(event, parsedPayload);

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


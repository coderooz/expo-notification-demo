const express = require('express');
const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
const router = express.Router();
const expo = new Expo();

router.post('/register', async (req, res) => {
  const { token } = req.body;
  if (!Expo.isExpoPushToken(token)) return res.status(400).json({ error: 'Invalid Expo push token' });

  try {
    const existing = await User.findOne({ token });
    if (!existing) await User.create({ token });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error saving token' });
  }
});

router.post('/send', async (req, res) => {
  const { token, title, message } = req.body;

  if (!Expo.isExpoPushToken(token)) return res.status(400).json({ error: 'Invalid token' });

  try {
    const messages = [
      {
        to: token,
        sound: 'default',
        title: title,
        body: message,
      },
    ];

    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    res.json({ success: true, tickets: ticketChunk });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;

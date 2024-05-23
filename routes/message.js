const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

router.post('/', async (req, res) => {
  const { sender, receiver, text } = req.body;
  const message = new Message({ sender, receiver, text });
  await message.save();
  res.status(201).json(message);
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
    .populate('sender', 'username')
    .populate('receiver', 'username');
  res.json(messages);
});

module.exports = router;

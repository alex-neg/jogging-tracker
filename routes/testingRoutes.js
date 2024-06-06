const express = require('express');
const router = express.Router();

// GET route for testing purposes
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Testing endpoint is working!' });
});

module.exports = router;
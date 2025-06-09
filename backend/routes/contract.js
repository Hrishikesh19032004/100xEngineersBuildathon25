const express = require('express');
const Contract = require('../models/Contract');
const Chatroom = require('../models/Chatroom');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { validateContract } = require('../middleware/validation');

const router = express.Router();

// Create contract
router.post('/create', auth, authorize('business'), validateContract, async (req, res) => {
  try {
    const { creatorId, product, rate, timeline } = req.body;
    
    // Verify creator exists
    const creator = await User.findById(creatorId);
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const contract = await Contract.create({
      brandId: req.user.id,
      creatorId,
      product,
      rate,
      timeline
    });

    // Create chatroom if it doesn't exist
    const chatroom = await Chatroom.create(req.user.id, creatorId);

    res.status(201).json({
      message: 'Contract created successfully',
      contract,
      chatroomId: chatroom.id
    });
  } catch (error) {
    console.error('Contract creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Sign contract as business
router.post('/sign-business/:id', auth, authorize('business'), async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    const contract = await Contract.signContract(id, req.user, signature);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found or already fully signed' });
    }

    // Log contract status for debugging
    if (contract.status === 'fully_signed') {
      console.log(`Contract ${contract.id} for ${contract.product} has been fully signed!`);
    }

    res.json({
      message: 'Contract signed successfully',
      contract
    });
  } catch (error) {
    console.error('Business signature error:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
});

// Sign contract as creator
router.post('/sign-creator/:id', auth, authorize('creator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    const contract = await Contract.signContract(id, req.user, signature);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found or already fully signed' });
    }

    // Log contract status for debugging
    if (contract.status === 'fully_signed') {
      console.log(`Contract ${contract.id} for ${contract.product} has been fully signed!`);
    }

    res.json({
      message: 'Contract signed successfully',
      contract
    });
  } catch (error) {
    console.error('Creator signature error:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
});

// Get contract by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if user has access to this contract
    if (contract.brand_id !== req.user.id && contract.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ contract });
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to retrieve contract' });
  }
});

// Get contracts for chatroom
router.get('/chatroom/:chatroomId/contracts', auth, async (req, res) => {
  try {
    const { chatroomId } = req.params;
    const contracts = await Contract.findByChatroomId(chatroomId);
    res.json({ contracts });
  } catch (error) {
    console.error('Error fetching contracts for chatroom:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

module.exports = router;
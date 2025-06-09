// Enhanced middleware/validation.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('role').isIn(['business', 'creator']).withMessage('Role must be business or creator'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateMessage = [
  body('content').notEmpty().withMessage('Message content is required'),
  body('chatroomId').isInt().withMessage('Valid chatroom ID is required'),
  handleValidationErrors
];

const validateCreatorProfile = [
  body('channelName').isLength({ min: 2 }).withMessage('Channel name must be at least 2 characters'),
  body('platforms').isArray({ min: 1 }).withMessage('At least one platform is required'),
  body('platforms.*.name').notEmpty().withMessage('Platform name is required'),
  body('platforms.*.url').optional().isURL().withMessage('Platform URL must be valid'),
  body('platforms.*.subscribers').isInt({ min: 0 }).withMessage('Subscribers must be a non-negative number'),
  body('totalSubscribers').isInt({ min: 0 }).withMessage('Total subscribers must be a non-negative number'),
  body('viewsLast30Days').isInt({ min: 0 }).withMessage('Views must be a non-negative number'),
  body('contentCategory').notEmpty().withMessage('Content category is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  handleValidationErrors
];
const validateQuotation = [
    body('deliverables').isArray({ min: 1 }).withMessage('At least one deliverable is required'),
    body('deliverables.*').notEmpty().withMessage('Deliverable cannot be empty'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('deadline').isISO8601().withMessage('Invalid deadline format'),
    body('notes').optional().isString(),
    handleValidationErrors
  ];
  const validateContract = [
    body('creatorId').isInt().withMessage('Valid creator ID is required'),
    body('product').notEmpty().withMessage('Product name is required'),
    body('rate').isFloat({ min: 0 }).withMessage('Valid rate is required'),
    body('timeline').notEmpty().withMessage('Timeline is required'),
    handleValidationErrors
  ];
module.exports = {
  validateSignup,
  validateLogin,
  validateMessage,
  validateCreatorProfile,
  handleValidationErrors,
  validateQuotation,
  validateContract
};

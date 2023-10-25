
var express = require('express');
const cors = require('cors');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { register, login, forgotPassword, changePassword, setNewPassword, updateGlobalSettings, TransferAmountToAgent, createAgents } = require('../controllers/adminController');
const multer = require('multer');
var forms = multer();
router.use(forms.array());

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/register', [
    body('name', "Fill this feild").notEmpty(),
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 })
], register);

router.post('/login', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], login);

router.post('/forgot-password', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
], forgotPassword);

router.post('/set-password', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('new_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], setNewPassword);

router.post('/change-password', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('old_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('new_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], changePassword);


router.put('/update-setting', [
    body('id', "ID is Required").notEmpty().escape().trim(),
    body('admin_charged')
        .isDecimal().withMessage('Admin Charge must be a decimal number')
        .isFloat({ gt: -1 }).withMessage('Admin Charge must be a non-negative number'),
    body('agent_charged')
        .isDecimal().withMessage('Agent Charge must be a decimal number')
        .isFloat({ gt: -1 }).withMessage('Agent Charge must be a non-negative number'),

], updateGlobalSettings);

router.post("/create-agent", [
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

    body('business_name', 'Business Name is required').trim().notEmpty().isString().withMessage('Business Name must be a string')
        .isLength({ min: 3 }).withMessage('Business Name must be at least 3 characters'),

    body('branch_name', 'Branch Name is required').trim().notEmpty().isString().withMessage('Branch Name must be a string')
        .isLength({ min: 3 }).withMessage('Branch Name must be at least 3 characters'),

    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),

    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),

    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),

    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),

    body('country').notEmpty().withMessage('Country is required').isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters'),
    body('role', "Role is required").notEmpty().escape().trim(),
], createAgents);

router.post('/transfer',
    [
        body('sender_id', "Sender ID is Required").notEmpty().escape().trim(),
        body('receiver_id', "ReceiverID is Required").notEmpty().escape().trim(),
        body('transaction_type', 'Invalid transaction type').notEmpty().escape().trim(),
        body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    ]
    , TransferAmountToAgent);



module.exports = router;
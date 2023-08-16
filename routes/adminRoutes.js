
var express = require('express');
const cors = require('cors');
var multer = require('multer');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { register, login, forgotPassword, changePassword, setNewPassword, updateGlobalSettings } = require('../controllers/adminController');

var forms = multer();

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(forms.array());


router.post('/register', [
    body('first_name', "Fill this feild").notEmpty(),
    body('last_name', "Fill this feild").notEmpty(),
    body('user_name', "The name must be of minimum 3 characters length").notEmpty().escape().trim().isLength({ min: 3 }),
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
    body('transaction_limits')
        .isDecimal().withMessage('Transaction limits must be a decimal number')
        .isFloat({ gt: 0 }).withMessage('Transaction limits must be a positive number'),
    body('funding_limits')
        .isDecimal().withMessage('Funding limits must be a decimal number')
        .isFloat({ gt: 0 }).withMessage('Funding limits must be a positive number'),
    body('fx_rates')
        .isDecimal().withMessage('FX rates must be a decimal number')
        .isFloat({ gt: 0 }).withMessage('FX rates must be a positive number'),
    body('transaction_fees')
        .isDecimal().withMessage('Transaction fees must be a decimal number')
        .isFloat({ gt: -1 }).withMessage('Transaction fees must be a non-negative number'),

], updateGlobalSettings)

module.exports = router;
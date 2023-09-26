var express = require('express');
const cors = require('cors');
var multer = require('multer');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { verifyEmail, checkOTP, changeCurrency, changeCountry } = require('../controllers/authController');
const { setNewPassword } = require('../controllers/adminController');

var forms = multer();

router.use(cors());

// Configuring body parser middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(forms.array());



router.post('/verify-email', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
], verifyEmail);

router.post('/check-otp', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('otp', "OTP is not valid").notEmpty().trim().isLength({ min: 6 })
], checkOTP);

router.post('/set-password', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('new_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], setNewPassword);


router.get('/currency-conversion', changeCurrency);

router.put('/change-country', [
    body('id', "ID is Required").notEmpty().escape().trim(),
    body('country').notEmpty().withMessage('Country is required').trim(),
], changeCountry);

module.exports = router;
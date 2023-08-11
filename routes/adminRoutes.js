
var express = require('express');
const cors = require('cors');
var multer = require('multer');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { register, login, forgotPassword, changePassword, setNewPassword } = require('../controllers/adminController');

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

module.exports = router;
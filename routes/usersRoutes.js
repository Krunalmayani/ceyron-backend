
var express = require('express');
const cors = require('cors');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { getAllUsers, getUserById, updateUsers, deleteUsers, usersRegister, usersLogin, setSecurityPin, changePassword, } = require('../controllers/usersController');

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/", getAllUsers);
router.get('/:id', getUserById);

router.post("/register", [
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('country').notEmpty().withMessage('Country is required').isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters'),
    body('role', "Role is Required").notEmpty().escape().trim(),
], usersRegister);

router.post('/login', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], usersLogin);

router.put("/:id", [
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
    body('country').notEmpty().withMessage('Country is required').isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters'),
], updateUsers);

router.delete("/:id", deleteUsers);

router.post("/set-pin", [
    body('id', "ID is Required").notEmpty().escape().trim(),
    body('security_pin', "Security Pin is Required").notEmpty().escape().trim()
        .isNumeric().withMessage('Security pin must be numeric').isLength({ min: 4, max: 4 }).withMessage('Security pin must be 4 digits'),
    body('confirm_security_pin', "Confirm Security Pin is Required").notEmpty().escape().trim()
        .isNumeric().withMessage('Security pin must be numeric').isLength({ min: 4, max: 4 }).withMessage('Security pin must be 4 digits'),
], setSecurityPin);

router.post("/change-password", [
    body('id', "ID is Required").notEmpty().escape().trim(),
    body('old_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('new_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], changePassword);

module.exports = router;

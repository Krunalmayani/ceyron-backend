
var express = require('express');
const cors = require('cors');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { setSecurityPin, changePassword, deleteUsers } = require('../controllers/usersController');
const { agentsLogin, agentsRegister, updateAgents, getAllAgents, getAgentById, getAgentByUserId } = require('../controllers/agentsController');

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', getAllAgents);

router.get('/:id', getAgentById);

router.get('/id/:users_id', getAgentByUserId);

router.post('/login', [
    body('agents_id', "Agents ID is Required").notEmpty().escape().trim(),
    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], agentsLogin);


router.post("/register", [
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('business_name', 'Business Name is required').trim().notEmpty().isString().withMessage('Business Name must be a string')
        .isLength({ min: 3 }).withMessage('Business Name must be at least 3 characters'),

    body('branch_name', 'Branch Name is required').trim().notEmpty().isString().withMessage('Branch Name must be a string')
        .isLength({ min: 3 }).withMessage('Branch Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Branch Name can only contain letters and spaces'),

    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),

    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),

    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),

    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),

    body('country').notEmpty().withMessage('Country is required').isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters'),
    body('role', "Role is required").notEmpty().escape().trim(),
], agentsRegister);

router.put("/:id", [

    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('business_name', 'Business Name is required').trim().notEmpty().isString().withMessage('Business Name must be a string')
        .isLength({ min: 3 }).withMessage('Business Name must be at least 3 characters'),

    body('branch_name', 'Branch Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),

    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),

    body('country').notEmpty().withMessage('Country is required').isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters'),
], updateAgents);

router.delete('/:id', deleteUsers);

router.post("/set-pin", [
    body('id', "Agents ID is Required").notEmpty().escape().trim(),
    body('security_pin', "Security Pin is Required").notEmpty().escape().trim()
        .isNumeric().withMessage('Security pin must be numeric').isLength({ min: 4, max: 4 }).withMessage('Security pin must be 4 digits'),
    body('confirm_security_pin', "Confirm Security Pin is Required").notEmpty().escape().trim()
        .isNumeric().withMessage('Security pin must be numeric').isLength({ min: 4, max: 4 }).withMessage('Security pin must be 4 digits'),
], setSecurityPin);

router.post("/change-password", [
    body('id', "Agents ID is Required").notEmpty().escape().trim(),
    body('old_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('new_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], changePassword);


module.exports = router;


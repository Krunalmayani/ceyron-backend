
var express = require('express');
const cors = require('cors');
var multer = require('multer');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { getAllAgents, agentsLogin, forgotPassword, changePassword, setNewPassword, addNewAgent, updateAgents, deleteAgents } = require('../controllers/agentsController');

var forms = multer();

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(forms.array());


router.get('/', getAllAgents);
router.delete('/:id', deleteAgents);

router.post("/", [
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('branch_name', 'Branch Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('phone_no', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
], addNewAgent);

router.put("/:id", [
    body('id', "Agents ID is Required").notEmpty().escape().trim(),
    body('agents_id', "Agents ID is Required").notEmpty().escape().trim(),
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('branch_name', 'Branch Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('phone_no', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
], updateAgents);

router.post('/login', [
    body('agents_id', "Agents ID is Required").notEmpty().escape().trim(),
    body('phone_no', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], agentsLogin);

router.post('/forgot-password', [
    body('phone_no', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
], forgotPassword);

router.post('/set-password', [
    body('agents_id', "Agents ID is Required").notEmpty().escape().trim(),
    body('new_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], setNewPassword);

router.post('/change-password', [
    body('agents_id', "Agents ID is Required").notEmpty().escape().trim(),
    body('old_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('new_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], changePassword);




module.exports = router;
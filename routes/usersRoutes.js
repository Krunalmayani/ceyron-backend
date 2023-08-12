
var express = require('express');
const cors = require('cors');
var multer = require('multer');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { getAllUsers, updateUsers, deleteUsers, usersRegister, usersLogin } = require('../controllers/usersController');


var forms = multer();

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(forms.array());

router.get("/all-users", getAllUsers)

router.post('/login', [
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),
], usersLogin);

router.post("/register", [
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),

    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),

    body('password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),

    body('confirm_password', "The Password must be of minimum 6 characters length").notEmpty().trim().isLength({ min: 6 }),

    body('country').notEmpty().withMessage('Country is required').isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters'),
], usersRegister);

router.put("/:id", [
    body('user_id', "Users ID is Required").notEmpty().escape().trim(),
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('phone_number', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
    body('country').notEmpty().withMessage('Country is required').isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters'),
], updateUsers);

router.delete("/:user_id", deleteUsers)


router.get('/', function (req, res) {
    res.send('Hello World!');
});



module.exports = router;

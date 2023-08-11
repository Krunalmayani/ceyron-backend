
var express = require('express');
const cors = require('cors');
var multer = require('multer');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { getAllUsers, updateUsers, deleteUsers } = require('../controllers/usersController');



var forms = multer();

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(forms.array());


router.get("/all-users", getAllUsers)

router.put("/:id", [

    body('user_id', "Users ID is Required").notEmpty().escape().trim(),
    body('name', 'Name is required').trim().notEmpty().isString().withMessage('Name must be a string')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
    body('email', "Invalid email address").notEmpty().escape().trim().isEmail(),
    body('phone_no', "Mobile Number are Required").notEmpty().escape().trim().isLength({ min: 10, max: 10 }),
    body('created_at', 'Date is required').notEmpty().isISO8601().withMessage('Invalid created_at format'),
], updateUsers);

router.delete("/:user_id", deleteUsers)


router.get('/', function (req, res) {
    res.send('Hello World!');
});



module.exports = router;

var express = require('express');
const cors = require('cors');
var router = express.Router();
const { body } = require('express-validator');
const bodyParser = require('body-parser');
const { TransferAmount } = require('../controllers/transactionsController');
const multer = require('multer');

var forms = multer();
router.use(forms.array());
router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/',
    [
        body('sender_id', "Sender ID is Required").notEmpty().escape().trim(),
        body('receiver_id', "ReceiverID is Required").notEmpty().escape().trim(),
        body('transaction_type', 'Invalid transaction type').notEmpty().escape().trim(),
        body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
        body('final_amount').isFloat({ min: 0 }).withMessage('Final amount must be a positive number'),
        body('amount_to_collect').isFloat({ min: 0 }).withMessage('Amount to collect must be a positive number'),
    ]
    , TransferAmount);




module.exports = router;
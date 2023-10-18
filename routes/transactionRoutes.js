
var express = require('express');
const cors = require('cors');
var router = express.Router();
const bodyParser = require('body-parser');
const { getAllTransactions, getTransactionsByID } = require('../controllers/transactionsController');
const multer = require('multer');

var forms = multer();
router.use(forms.array());
router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', getAllTransactions);

router.get('/:users_id', getTransactionsByID);




module.exports = router;
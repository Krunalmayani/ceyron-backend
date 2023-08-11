
var express = require('express');
const cors = require('cors');
var multer = require('multer');
var router = express.Router();
const bodyParser = require('body-parser');
const { body } = require('express-validator');
const { getAllTransactions } = require('../controllers/transactionsController');

var forms = multer();

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(forms.array());

router.get('/', getAllTransactions);




module.exports = router;
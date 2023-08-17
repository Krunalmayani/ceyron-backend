
var express = require('express');
const cors = require('cors');
var router = express.Router();
const bodyParser = require('body-parser');
const { getAllTransactions } = require('../controllers/transactionsController');


router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', getAllTransactions);




module.exports = router;
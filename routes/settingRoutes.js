
var express = require('express');
const cors = require('cors');
var router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const { globalSettings, UserAgentChargeSettings, } = require('../controllers/settingController');

var forms = multer();
router.use(forms.array());

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/setting', globalSettings);
router.get('/charge', UserAgentChargeSettings);

module.exports = router;
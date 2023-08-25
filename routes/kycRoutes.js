var express = require("express");
const app = express()
const multer = require('multer')
const path = require('path')
const cors = require("cors");
const { kycVerifyData, getKycData, getKycDataBYID } = require("../controllers/kycController");
const { body } = require('express-validator');



//use express static folder
app.use(cors());

app.use(express.static("uploads"))

//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        let folder = 'default'; // Default folder

        if (file.fieldname === 'Selfie_with_document') {
            folder = 'selfies_with_documents';
        } else if (file.fieldname === 'KYC_Front_Image') {
            folder = 'kyc_front_images';
        } else if (file.fieldname === 'KYC_Back_Image') {
            folder = 'kyc_back_images';
        }
        callBack(null, path.join(__dirname, `../uploads/${folder}`));

    },
    filename: (req, file, callBack) => {
        callBack(null, Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/",
    upload.fields([
        { name: 'Selfie_with_document', maxCount: 1 },
        { name: 'KYC_Front_Image', maxCount: 1 },
        { name: 'KYC_Back_Image', maxCount: 1 }
    ]), [
    body('agents_id').notEmpty().withMessage('ID is required'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('dob').isDate().withMessage('Invalid date format'),
    body('address').notEmpty().withMessage('Address is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('zip_code').isPostalCode('any').withMessage('Invalid zip code format'),
], kycVerifyData);

app.get('/', getKycData);
app.get('/:id', getKycDataBYID);


module.exports = app;
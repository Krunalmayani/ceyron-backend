var express = require("express");
const app = express()
const multer = require('multer')
const path = require('path')
const cors = require("cors");
const { kycVerifyData, getKycData, getKycDataBYID, deleteKYC, getAgentKycData, getUserKycData, canclledKYC, approvedKYC } = require("../controllers/kycController");
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
    body('dob').isDate().withMessage('Invalid date format').custom((value) => {
        const dateOfBirth = new Date(value);
        const currentDate = new Date();
        // Calculate the difference in years
        const ageDifferenceInYears = currentDate.getFullYear() - dateOfBirth.getFullYear();
        // Check if the age is at least 18
        if (ageDifferenceInYears < 18)
            throw new Error('You must be at least 18 years old.');

        return true; // Validation passed
    }),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('city is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('zip_code').isPostalCode('any').withMessage('Invalid zip code format'),
], kycVerifyData);

app.get('/', getKycData);
app.get('/agent', getAgentKycData);
app.get('/user', getUserKycData);
app.get('/:id', getKycDataBYID);
app.delete("/:id", deleteKYC);

app.post('/cancleKYC', [
    body('reason').notEmpty().withMessage('Reason is required'),
    body('agents_id').notEmpty().withMessage('Agent ID is required'),
    body('status', "Fill the Staus feild").notEmpty(),
], canclledKYC);

app.post('/approveKYC', [
    body('agents_id').notEmpty().withMessage('Agent ID is required'),
    body('status', "Fill the Staus feild").notEmpty(),
], approvedKYC)

module.exports = app;
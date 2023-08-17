require('dotenv').config();
const express = require('express');
const cors = require("cors");
var multer = require('multer');

const bodyParser = require('body-parser');

const adminRoutes = require('./routes/adminRoutes');
const agentsRoutes = require("./routes/agentsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const settingRoutes = require("./routes/settingRoutes");
const { TransferAmount } = require('./controllers/transactionsController');

var app = express();
var forms = multer();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(forms.array());


// Routes
app.use('/admin', adminRoutes);
app.use('/agents', agentsRoutes);
app.use('/users', usersRoutes);
app.use('/transactions', transactionRoutes);
app.use('/global', settingRoutes);
app.post('/transfer', TransferAmount);

app.get('/', function (req, res) {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
    console.log(`server is listening  on ${PORT} \n`);
});
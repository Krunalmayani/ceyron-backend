const express = require('express');
const cors = require("cors");

const bodyParser = require('body-parser');

const adminRoutes = require('./routes/adminRoutes');
const agentsRoutes = require("./routes/agentsRoutes")
const usersRoutes = require("./routes/usersRoutes")
const transactionRoutes = require("./routes/transactionRoutes")

var app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


// Routes
app.use('/admin', adminRoutes);
app.use('/agents', agentsRoutes);
app.use('/users', usersRoutes);
app.use('/transactions', transactionRoutes)

app.get('/', function (req, res) {
    res.send('Hello World!');
});


app.listen(5500, function () {
    console.log('Example app listening on port 5500!');
});
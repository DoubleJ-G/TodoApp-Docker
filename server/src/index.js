require('dotenv').config();

// Express App Setup
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
//const pgp = require('pg-promise')();

const item = require('./routes/item')
// Config
const config = require('./config');

// PostgresQL Database
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());//

app.use('/v1/items', item)

const port = config.expressPORT || 3000

app.listen(port, () => { 
    console.log("Server started on port: " + port);
});
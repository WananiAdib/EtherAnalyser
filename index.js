const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");


// Initialization of the API
const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`The API is up and running at ${port}`)
});


// Create connection to MySql
const con = mysql.createConnection({
    host: "mysql_server",
    user: "dan",
    password: "secret",
    database: "test_db"
});


// Connect

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

// Create a table
const sql = `
CREATE TABLE IF NOT EXISTS gastracker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blockNum INT,
    fast INT,
    average INT,
    low INT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;`;
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
});


// Receive data from Etherscan
const apiKeyToken = "ZWD4KRWG83DRYS8ENYUPUJZQP326KQRJNM";
const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKeyToken}`


// Storing the data on the database
setInterval(() => {
    axios.get(url).then(response => {
        let info = response.data.result;
        let sqlRow = `INSERT INTO gastracker (blockNum, fast, average, low) VALUES ('${info.LastBlock}','${info.FastGasPrice}','${info.ProposeGasPrice}','${info.SafeGasPrice}')`;
        con.query(sqlRow, function (err, result) {
            if (err) throw err;
            console.log(`Row inserted at ${Date.now()}`);
        });
    })
    .catch(error => {
        console.log(error);
    });
}, 500);

// API call for gas
app.get('/gas', (req, res) => {
    lastInput = "SELECT fast, average, low FROM gastracker ORDER BY id DESC LIMIT 1";
    con.query(lastInput, function (err, result) {
        if (err) throw err;
        res.json(result[0]);
    });
});

// API call for average
app.get('/average', (req, res) => {
    lastInput = "SELECT * FROM gastracker ORDER BY id DESC LIMIT 1";
    con.query(lastInput, function (err, result) {
        if (err) throw err;
        res.json(result[0]);
    });
});


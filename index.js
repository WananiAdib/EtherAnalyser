// Importing the modules I am using
const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");


// Initialization of the API
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`The API is up and running at ${port}`)
});


// Create connection to MySql server
const con = mysql.createConnection({
    host: "mysql_server",
    user: "dan",
    password: "secret",
    database: "test_db",
    multipleStatements: true
});

// Connecting to the database
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
    timestamp INT
) ENGINE=INNODB;`;
con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
});

// Receive data from Etherscan
const config = require('./config.js')
const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${config.apiKeyToken}`

// Storing the data on the database every 500ms
setInterval(() => {
    axios.get(url).then(response => {
        let info = response.data.result;
        let sqlRow = `INSERT INTO gastracker (blockNum, fast, average, low, timestamp) VALUES 
        ('${info.LastBlock}',
        '${info.FastGasPrice}',
        '${info.ProposeGasPrice}',
        '${info.SafeGasPrice}',
        UNIX_TIMESTAMP())`;
        con.query(sqlRow, function (err, result) {
            if (err) throw err;
            console.log(`Row inserted at ${Math.round(Date.now() / 1000)}`);
        });
    })
    .catch(error => {
        console.log(error);
    });
}, 500);

// API call for gas
app.get('/gas', (req, res) => {
    lastInput = "SELECT fast, average, low, blockNum FROM gastracker ORDER BY id DESC LIMIT 1";
    con.query(lastInput, function (err, result) {
        if (err) throw err;
        res.json({"error": false, "message":result[0]});
    });
});

// API call for average
app.get('/average', (req, res) => {
    averages = `SELECT AVG(fast) AS average FROM gastracker 
                    WHERE (timestamp > ${req.query.fromTime} AND  timestamp < ${req.query.toTime});
                    SELECT AVG(average) AS average FROM gastracker 
                    WHERE (timestamp > ${req.query.fromTime} AND  timestamp < ${req.query.toTime});
                    SELECT AVG(low) AS average FROM gastracker 
                    WHERE (timestamp > ${req.query.fromTime} AND  timestamp < ${req.query.toTime});`;
    // return error message if there was a wrong input
    if (!req.query.fromTime || !req.query.toTime) {
        res.json({"error": true, "message": "Wrong Input"})
    } else {
        // Quering the averages for every category
        con.query(averages, function (err, result) {
            if (err) throw err;
            res.json({error: false, message: {fast: result[0][0].average, average: result[1][0].average, low: result[2][0].average} });
        });
    }    
});


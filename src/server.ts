import express from "express";
const cors = require('cors')
const blink = require('./routes/api/index')
import path from 'path';
import fs from 'fs';
const app = express()

app.set('view engine', 'ejs')
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Serve actions.json file with appropriate CORS headers
app.get('/actions.json', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    fs.readFile(path.join(__dirname, 'actions.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading actions.json file');
        } else {
            res.type('json').send(data);
        }
    });
});

// Handle OPTIONS requests
app.options('/actions.json', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(204);
});



app.get('/', (req, res) => {
    return res.send('Hello World!');
});

const BaseUrl = '/api/v1';

app.use(`${BaseUrl}/blink`, blink);


const PORT = 3000

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });
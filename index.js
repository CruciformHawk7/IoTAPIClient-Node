const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.get('/Hello',(req, res) => {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Success"}');
});

writer

app.use(express.static('public'));

console.log('Listening on port 3000');
app.listen(3000);
var path = require('path');
var express = require('express');
var app = express();



var port = 8083;


app.use(express.static(path.join(__dirname, 'client')));



console.log('serving on port ' + port);
app.listen(port);
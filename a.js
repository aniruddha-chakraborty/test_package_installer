var http = require('http');

var fs = require('fs');

var server = http.createServer(function (req, res) {

 

    fs.writeFile('/var/www/html/message.txt', 'Just now, we have created this file', function (err) {

        if (err) throw err;

        console.log('It\'s saved! in same location.');

    });

});

server.listen(9090);

console.log('server running...');
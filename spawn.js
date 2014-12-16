#!/usr/bin/env node

var watchify = require('watchify/bin/args');

var fs = require('fs');
var args = process.argv.slice(2);
var SOCKET = __dirname + '/.watch-server';

var w = watchify(args);
w.setMaxListeners(Infinity);
w.on('update', function () {
    w.bundle();
});

var net = require('net');

//brute force kill existing server
if (fs.existsSync(SOCKET)) {
    fs.unlinkSync(SOCKET);
}

var server = net.createServer(function (c) {
    c.on('data', function (d) {
        d = d.toString().trim();

        if (d === 'bundle') {
            console.log('Bundling');
            w.bundle().pipe(c);
        }

        if (d === 'kill') {
            c.write('killed\n');
            console.log('Killed');
            w.close();
            server.close();
        }
    });

});

server.listen(SOCKET, function (err) {
    if (err) { process.stderr.write(err); }
    process.stdout.write('Watchify server spawned at ' + SOCKET + ' with args: "' + args.join(' ') + '"\n');
});

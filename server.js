#!/usr/bin/env node

var net = require('net');
var fs = require('fs');

var _browserify = require('watchify/node_modules/browserify/bin/args');
var _watchify = require('watchify');
var watchify = function(args) {
    return _watchify(_browserify(args, watchify.args));
};

var SOCKET = __dirname + '/.watch-server';

//brute force kill existing server
if (fs.existsSync(SOCKET)) {
    fs.unlinkSync(SOCKET);
}

var w, wArgs;

var server = net.createServer(function (c) {
    c.on('data', function (d) {
        var msg = JSON.parse(d.toString());

        if (msg.cmd === 'bundle') {
            if (!w) {
                w = watchify(msg.args);
                w.setMaxListeners(Infinity);
                w.on('update', function () {
                    w.bundle();
                });
                wArgs = JSON.stringify(msg.args);

            } else if (wArgs !== JSON.stringify(msg.args)) {
                c.write('error[incorrect args]');
                console.log('Incorrect args: called with', JSON.stringify(msg.args), 'but bundled with', wArgs, '\n');
                return;
            }

            w.bundle().pipe(c);
        }

        if (msg.cmd === 'kill') {
            c.write('killed\n');
            console.log('Killed');
            w.close();
            server.close();
        }
    });
});

server.listen(SOCKET, function (err) {
    if (err) { process.stderr.write(err); }
    console.log('Watchify server spawned at ' + SOCKET);
});

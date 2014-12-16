#!/usr/bin/env node
var net = require('net');
var fs = require('fs');

var browserify = require('browserify/bin/args');
var spawn = require('child_process').spawn;
var cwd = process.cwd();

var SOCKET = __dirname + '/.watch-server';
var args = process.argv.slice(2);
var client;

function spawnServer(done) {
    var out = fs.openSync(cwd + '/.watch-server.log', 'w');
    var err = fs.openSync(cwd + '/.watch-server.log', 'w');
    var child = spawn(__dirname + '/spawn.js', args.slice(1), {
        cwd: cwd,
        detached: true,
        stdio: ['ignore', out, err]
    });
    console.log('Spawned server ' + cwd);
    child.unref();
}

function killServer(done) {
    var client = net.createConnection(SOCKET, function () {
        client.write('kill\n');
        client.pipe(process.stdout);
    });
    client.on('error', function (e) {
        done(e);
    });
    client.on('data', function (d) {
        if (d.toString().trim() === 'killed') {
            done();
        }
    });
}


if (args[0] === '--spawn') {
    killServer(function () {
        spawnServer(function () {
            process.exit(0);
        });
    });
}

else if (args[0] === '--kill') {
    killServer(function (err) {
        if (err) { console.log('No server was running'); }
        process.exit(0);
    });
}

else {
    var client = net.createConnection(SOCKET, function () {
        client.write('bundle\n');
        client.pipe(process.stdout);
    });

    client.on('error', function (e) {
        process.stderr.write('No server, bundling\n\n');
        var b = browserify(args);
        var bundle = b.bundle();
        bundle.pipe(process.stdout);
    });
}

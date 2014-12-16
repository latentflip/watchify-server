I've just hacked together a little idea that I'd love to get thoughts/feedback on.

The make + browserify experience leads a little to be desired. The main issue is that browserify builds can get slow: on my machine, talky builds can be anywhere from 4 seconds to 16 seconds (pushing towards the latter as running multiple webrtc tabs just kills everything.

Watchify makes browserify builds better, by running a hot-process that rebuilds on demand and only rebuilds changed files; but it's not particularly compatible with make, and it only really suitable for development rather than production builds.

So I've written watchify-server (https://github.com/latentflip/watchify-server) as an attempt to combine the best of both worlds.

Out of the box, the watchify-server command is exactly the same as running browserify (it just forwards the args through to browserify):

However, run it like `watchify-server --spawn <browserify args>` and it will spin up a watchify process behind a unix socket, and future calls to `watchify-server` will communicate with that process to grab a live bundle, which will be much faster than starting from scratch.

I believe this gives us the best of both worlds. Production builds will work just as usual. But as a dev you can optionally spawn a watchify server and see ~5 times faster browserify builds.

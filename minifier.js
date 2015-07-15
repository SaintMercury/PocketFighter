var compressor = require('node-minify');
 
 //Build Client
new compressor.minify({
    type: 'uglifyjs',
    fileIn: './src/client/**/*.js',
    fileOut: 'build/PocketFighter-Client.js'
});

//Build Server
new compressor.minify({
    type: 'uglifyjs',
    fileIn: './src/server/**/*.js',
    fileOut: 'build/PocketFighter-Server.js'
});

//Build Client Tests
new compressor.minify({
    type: 'uglifyjs',
    fileIn: './src/test/server/**/*.js',
    fileOut: 'test/PocketFighter-ClientTEST.js'
});

//Build Server Tests
new compressor.minify({
    type: 'uglifyjs',
    fileIn: './src/test/server/**/*.js',
    fileOut: 'test/PocketFighter-ServerTEST.js'
});
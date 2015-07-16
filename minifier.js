var compressor = require('node-minify');
 
console.log('Real Build - Client');
//Build Client
new compressor.minify({
    type: 'uglifyjs',
    fileIn: './src/client/**/*.js',
    fileOut: 'build/PocketFighter-Client.js',
    callback: function() {
    	console.log('Test Build - Client');
    	//Build Client Tests
			new compressor.minify({
			    type: 'uglifyjs',
			    fileIn: './src/test/server/**/*.js',
			    fileOut: 'test/PocketFighter-ClientTEST.js',
			    callback: function() {
			    	console.log('Real Test Build - Client');
			    	new compressor.minify({
						    type: 'no-compress',
						    fileIn: ['build/PocketFighter-Client.js','test/PocketFighter-ClientTEST.js'],
						    fileOut: 'test/PocketFighter-ClientTEST.js'
						});
			    }
			});
    }
});


console.log('Real Build - Server');
//Build Server
new compressor.minify({
    type: 'uglifyjs',
    fileIn: './src/server/**/*.js',
    fileOut: './build/PocketFighter-Server.js',
    callback: function() {
    	console.log('Test Build - Server');
    	//Build Server Tests
			new compressor.minify({
			    type: 'uglifyjs',
			    fileIn: './src/test/server/**/*.js',
			    fileOut: './test/PocketFighter-ServerTEST.js',
			    callback: function() {
			    	console.log('Real Test Build - Server');
			    	new compressor.minify({
						    type: 'no-compress',
						    fileIn: ['./build/PocketFighter-Server.js','./test/PocketFighter-ServerTEST.js'],
						    fileOut: './test/PocketFighter-ServerTEST.js'
						});
			    }
			});
    }
});
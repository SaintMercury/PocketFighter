# PocketFighter

A small multiplayer game built using the Phaser javascript game engine and socket.io

==============================

Setting up dev environment
--------------------------
1. Clone the repo
2. npm install
2.1 npm install browserify -g
3. It's done stop reading

'Compiling'
--------------------------

browserify ./client/client.js > ./build/clientBuild.js

Running
--------------------------

node ./server/server.js
In your browser navigate to localhost:1337


Developing/Testing
--------------------------

Write code,
compile it,
write tests,
make sure tests pass and actually test,
commit
fanups
======

Social Mashups - Hackathon project

Node server
=====
* npm install -g redis
* npm install
* mkdir uploads # at the top level
* redis-server
* node server.js

Reset local env
===============
rm -rf ./uploads/* && redis-cli "flushall"

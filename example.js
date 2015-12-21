"use strict"
var MinecraftServer = require('./src/MinecraftServer')
var fs = require('fs')

var server = new MinecraftServer({
  motd: 'A Javascript server!',
  favicon: fs.readFileSync('./nodejs.png').toString('base64')
})

server.listen(25565)
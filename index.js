"use strict"
var MinecraftServer = require('./src/MinecraftServer')
var server = new MinecraftServer()

server.listen(25565)
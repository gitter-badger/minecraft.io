"use strict"
const EventEmitter = require('events').EventEmitter
const debug = require('debug')('mc:server')
const mcProtocol = require('minecraft-protocol')
const MinecraftClient = require('./MinecraftClient')
const MinecraftClientStore = require('./MinecraftClientStore')

class MinecraftServer extends EventEmitter {
  constructor() {
    super()
    this.server = null
    this.clients = new MinecraftClientStore()
  }
  listen(port = 25565, host = '0.0.0.0', callback = () => {}) {
    if(this.server !== null) throw new Error('server already running')
    var mc = this.server = mcProtocol.createServer({motd: 'Node.JS server', port: port, host: host})
    var store = this.clients

    mc.on('login', user => {
      var client = new MinecraftClient(user, mc)
      store.add(client.id, client)
      store.forEach(cl => cl.sendMessage({color: 'yellow', translate: 'multiplayer.player.joined', 'with': [client.userName]}))
      console.log('%s joined the game', client.userName)
    })
    store.on('chat', (client, message) => {
      console.log('<' + client.userName + '> ' + message.message)
      store.forEach(cl => cl.sendMessage({text: '<' + client.userName + '> ' + message.message}))
    })
    store.on('command', (client, command) => {
      if(command.command == 'gamemode') client.gameMode = command.args
    })
  }
}

module.exports = MinecraftServer

"use strict"
const EventEmitter = require('events').EventEmitter
const debug = require('debug')('mc:server')
const mcProtocol = require('minecraft-protocol')
const MinecraftClient = require('./MinecraftClient')
const MinecraftClientStore = require('./MinecraftClientStore')

class MinecraftServer extends EventEmitter {
  constructor(options) {
    super()
    this.server = null
    this.clients = new MinecraftClientStore()
    this.options = options
  }
  listen(port = 25565, host = '0.0.0.0', callback = () => {}) {
    if(this.server !== null) throw new Error('server already running')
    this.options.port = port
    this.options.host = host
    var mc = this.server = mcProtocol.createServer(this.options)
    var store = this.clients
    if(this.options.favicon) mc.favicon = this.options.favicon

    mc.on('login', user => {
      var client = new MinecraftClient(user, mc)
      if(store.find({uuid: client.uuid}).length !== 0) return client.kick({text: 'Clones not allowed'})
      client.doLogin()
      store.add(client.id, client)
      store.forEach(cl => cl.sendMessage({color: 'yellow', translate: 'multiplayer.player.joined', 'with': [client.userName]}))
      console.log('%s joined the game', client.userName)
      mc.playerCount = store.length
    })
    store.on('chat', (client, message) => {
      console.log('<' + client.userName + '> ' + message.message)
      store.forEach(cl => cl.sendMessage({text: '<' + client.userName + '> ' + message.message}))
    })
    store.on('command', (client, command) => {
      if(command.command == 'gamemode') client.gameMode = command.args
      else if(command.command == 'explode') client.explosion()
    })
    store.on('disconnected', (client) => {
      store.forEach(cl => cl.sendMessage({color: 'yellow', translate: 'multiplayer.player.left', 'with': [client.userName]}))
      console.log('%s left the game', client.userName)
      mc.playerCount = store.length
    })
  }
  get playerCount() {
    return this.server.playerCount
  }
}

module.exports = MinecraftServer

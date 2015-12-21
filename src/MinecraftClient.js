"use strict"
const EventEmitter = require('events').EventEmitter

class MinecraftClient extends EventEmitter {
  // Private
  constructor(rawClient, server) {
    super()
    var self = this
    this._client = rawClient
    this._server = server
    this.id = rawClient.id
    this.userName = this.displayName = rawClient.username
    this.uuid = rawClient.uuid
    this.ping = 1
    this._gameMode = 1
    this.pos = {x: 0, y: 0, z: 0}

    rawClient.on('chat', chatMessage => {
      if(chatMessage.message.startsWith('/')) {
        var command = {
          command: chatMessage.message.split(' ')[0].split('/')[1],
          args: (chatMessage.message.indexOf(' ') !== -1) ? chatMessage.message.replace(chatMessage.message.split(' ')[0] + ' ', '') : '',
          raw: chatMessage.message
        }
        self.emit('command', command)
      } else self.emit('chat', chatMessage)
    })
    rawClient.on('end', () => {
      self.emit('disconnected')
    })
    rawClient.on('error', err => console.log(err, err.stack))
    rawClient.on('position', (position) => {
      self.pos.x = position.x
      self.pos.y = position.y
      self.pos.z = position.z
    })
  }

  // Public
  doLogin() {
    var client = this._client
    var server = this._server
    client.write('login', {
      entityId: client.id,
      levelType: 'default',
      gameMode: 1,
      dimension: 0,
      difficulty: 2,
      maxPlayers: server.maxPlayers,
      reducedDebugInfo: false
    })
    client.write('position', {
      x: 0,
      z: 0,
      y: 60,
      yaw: 0,
      pitch: 0,
      flags: 0x00
    })
    this.pos.y = 60
    this.sendMessage({text: 'Welcome to the Node.JS test server, ' + client.username + '!'})
  }
  get gameMode() {
    return this._gameMode
  }
  set gameMode(gameModeId) {
    this._gameMode = gameModeId
    this._client.write('game_state_change', {
      reason: 3,
      gameMode: gameModeId
    })
    this.sendMessage({
      text: 'Your gamemode has been changed',
      italic: true,
      color: 'gray'
    })
  }
  kick(message) {
    console.log('kicking ', message.text)
    this._client.write('kick_disconnect', {reason: JSON.stringify(message)});
  }
  playerJoined(clientsJoining) {
    var data = [];
    if(!(clientsJoining instanceof Array)) clientsJoining = [clientsJoining]
    clientsJoining.forEach(cl => data.push({
      UUID: cl.uuid,
      name: cl.userName,
      properties: [],
      gamemode: cl.gameMode,
      ping: cl.ping,
      displayName: cl.displayName
    }))
    this._client.write('player_info', {
      action: 0,
      data: data
    })
  }
  playerLeft(clientsLeaving) {
    var data = [];
    if(!(clientsLeaving instanceof Array)) clientsLeaving = [clientsLeaving]
    clientsLeaving.forEach(cl => data.push({UUID: cl.uuid}))
    this._client.write('player_info', {
      action: 0,
      data: data
    })
  }

  // Test
  sendMessage(message) {
    this._client.write('chat', {message: JSON.stringify(message), position: 0})
  }
  explosion() {
    var pos = this.pos
    this._client.write('explosion', {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      affectedBlockOffsets: [],
      playerMotionX: 0,
      playerMotionY: 0,
      playerMotionZ: 0
    })
  }
}

module.exports = MinecraftClient
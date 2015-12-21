"use strict"
const EventEmitter = require('events').EventEmitter

class MinecraftClient extends EventEmitter {
  // Private
  constructor(client, server) {
    super()
    var self = this
    this._client = client
    this._server = server
    this.id = client.id
    this.userName = client.username
    this.uuid = client.uuid
    this._gameMode = 1

    client.on('chat', chatMessage => {
      if(chatMessage.message.startsWith('/')) {
        var command = {
          command: chatMessage.message.split(' ')[0].split('/')[1],
          args: (chatMessage.message.indexOf(' ') !== -1) ? chatMessage.message.replace(chatMessage.message.split(' ')[0] + ' ', '') : '',
          raw: chatMessage.message
        }
        self.emit('command', command)
      } else self.emit('chat', chatMessage)
    })
    client.on('end', () => {
      self.emit('disconnected')
    })
  }
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
    this.sendMessage({text: 'Welcome to the Node.JS test server, ' + client.username + '!'})
  }

  // Public
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

  // Test
  sendMessage(message) {
    this._client.write('chat', {message: JSON.stringify(message), position: 0})
  }
}

module.exports = MinecraftClient
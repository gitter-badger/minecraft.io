"use strict"

class MinecraftClientStore {
  constructor() {
    this._clients = {}
    this._listening = {}
  }
  find(query = {}) {
    var clients = this._clients
    var list = Object.keys(clients).map(k => clients[k])
    if(query.id !== undefined)
      list.forEach((client, key) => {if(client.id !== query.id) list.splice(key, 1)})
    if(query.uuid !== undefined)
      list.forEach((client, key) => {if(client.uuid !== query.uuid) list.splice(key, 1)})
    return list
  }
  add(id, client) {
    if(this._clients[id]) return false;
    if(this.find({uuid: client.uuid}))
    this._clients[id] = client
    var self = this
    client.on('disconnected', () => delete self._clients[id])
    for(var eventName in this._listening)
      if(this._listening.hasOwnProperty(eventName)) this._bindListener(client, eventName);
  }
  get all() {
    return this._clients
  }
  get array() {
    var clients = this._clients
    return Object.keys(clients).map(k => clients[k])
  }
  get length() {
    return Object.keys(this._clients).length
  }
  on(eventName, executer) {
    if(!this._listening[eventName]) this._listening[eventName] = [executer]
    else this._listening.push(executer)
  }
  forEach(callback) {
    for(var k in this._clients) {
      if(!this._clients.hasOwnProperty(k)) continue;
      callback(this._clients[k])
    }
  }

  _bindListener(client, event) {
    var listeners = this._listening[event]
    client.on(event, function() {
      var eventArgs = [].slice.apply(arguments)
      listeners.forEach(executer => {
        var args = [client]
        eventArgs.forEach(arg => args.push(arg))
        executer.apply(null, args)
      })
    })
  }
}

module.exports = MinecraftClientStore
"use strict"

class MinecraftClientStore {
  constructor() {
    this._clients = {}
    this._listening = {}
  }
  find(query = {}, callback = () => {}) {
    if(query.id !== undefined) return callback(null, this.clients[query.id])
    callback(null, [])
  }
  add(id, client) {
    if(this._clients[id]) return false;
    this._clients[id] = client
    for(var eventName in this._listening)
      if(this._listening.hasOwnProperty(eventName)) this._bindListener(client, eventName);
  }
  get all() {
    return this._clients
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
export class Websocket {
  constructor(uri) {
    this.uri = uri
    this.websocket = null
    this.established = false
    this.connected = false
    this.callbacks = {}
    this.connected_backlog = []
  }

  establish() {
    if (!this.established) {
      this.websocket = new WebSocket('ws://' + window.location.host + "/" + this.uri)
      this.websocket.onmessage = (e) => { this._message(e) }
      this.websocket.onopen = (e) => { this._open() }
      this.websocket.onclose = (e) => { this._close() }
      this.established = true
      this.register('ERR', (type, action, data) => {
        alert(data.join('\r\n'))
      })
    }
  }

  register(type, callback) {
    if (this.callbacks[type] == undefined) this.callbacks[type] = []
    this.callbacks[type].push(callback)
    this.send('types', 'identify', type)
  }

  nowOrOnConnect(func) {
    if (this.connected) {
      func()
    } else {
      this.connected_backlog.push(func)
    }
  }

  send(type, action, data) {
    var func = () => {
      var json = JSON.stringify({ type: type, action: action, data: data })
      this.websocket.send(json)
    }

    this.nowOrOnConnect(func)
  }

  _open() {
    this.connected = true
    console.log("Websocket Connected!")
    this.connected_backlog.forEach((e) => { e() })
    this.connected_backlog = []
  }

  _close() {
    this.connected = false
    console.log("Websocket Disconnected!")
  }

  _message(e) {
    var data = JSON.parse(e.data)
    if (this.callbacks[data.type] != undefined)
      Array.from(this.callbacks[data.type]).forEach((e) => {
        e(data.type, data.action, data.data)
      });
  }
}
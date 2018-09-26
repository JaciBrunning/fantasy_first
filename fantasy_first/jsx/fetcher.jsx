export class Fetcher {
  constructor(url) {
    this.url = url
    this.entries = {}
    this.callbacks = []
  }

  refresh() {
    fetch(this.url)
      .then(response => response.json())
      .then(data => this.onDataAvailable(data))
  }

  onDataAvailable(data) {
    this.entries = data
    this.callbacks.forEach((cb) => { cb(data) })
  }

  mount(callback) {
    this.callbacks.push(callback)
    this.refresh()
  }
}
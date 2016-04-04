module.exports.createAPI = function createAPI (host) {
  return {
    get: function (path) {
      return fetch(host + path).then(function (res) { return res.json() })
    },

    post: function (path, body) {
      return fetch(host, { method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (res) { return res.json() })
    }
  }
}

var HAR = module.exports.HAR = {
  _HAR: [],

  run: function (cb) {
    cb()
    HAR.reload(cb)
  },

  reload: function (run) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      var listener = new EventSource('http://localhost:3333')
      console.log('[HAR] Listening on http://localhost:3333')
      this._HAR.push(listener)

      var restart = function () {
        listener.onerror = null
        listener.onmessage = function (res) {
          listener.onmessage = null
          listener.onerror = restart
          console.log('[HAR] Processing update from http://localhost:3333')
          run(res)
        }
      }

      listener.onerror = restart
    }
  },

  disconnect: function () {
    this._HAR.forEach(function (l) { l.close() })
  }
}

module.exports.createServer = function createServer () {
  return require('http').createServer(function (req, res) {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/event-stream', 'Content-Length': '15' })
    res.write('data: reload!\n\n')
  }).listen(3333)
}

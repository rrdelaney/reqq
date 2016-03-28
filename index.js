'use strict'

module.exports.createAPI = function createAPI (host) {
  return {
    HAR: [],

    reload: function (name, run) {
      run()

      if (typeof window !== 'undefined') {
        var listener = new EventSource('http://localhost:3333')
        this.HAR.push(listener)

        var restart = function () {
          listener.onerror = null
          listener.onmessage = function (res) {
            listener.onmessage = null
            listener.onerror = restart
            run(res)
            console.info(`[HAR] reloading ${name}...`)
          }
        }

        listener.onerror = restart
      }
    },

    get: function (path, cb) {
      this.reload(`GET ${host}${path}`, function () {
        return fetch(`${host}${path}`)
          .then(function (res) { return res.json() })
          .then(function (x) { return cb(x) })
      })
    },

    post: function (path, body, cb) {
      return fetch(host, { method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (res) { return res.json() })
        .then(function (x) { return cb(x) })
    },

    disconnect: function () {
      this.HAR.forEach(function (l) { l.close() })
    }
  }
}

module.exports.createServer = function createServer () {
  return require('http').createServer(function (req, res) {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/event-stream', 'Content-Length': '15' })
    res.write('data: reload!\n\n')
  }).listen(3333)
}

'use strict'

module.exports.createAPI = function createAPI (host) {
  return {
    HAR: [],

    reload (name, run) {
      run()

      if (typeof window !== 'undefined') {
        let listener = new EventSource('http://localhost:3333')
        this.HAR.push(listener)

        let restart = () => {
          listener.onerror = null
          listener.onmessage = (res) => {
            listener.onmessage = null
            listener.onerror = restart
            run(res)
            console.info(`[HAR] reloading ${name}...`)
          }
        }

        listener.onerror = restart
      }
    },

    get (path, cb) {
      this.reload(`GET ${host}${path}`, () =>
        fetch(`${host}${path}`)
          .then((res) => res.json())
          .then((x) => cb(x))
      )
    },

    post (path, body, cb) {
      this.reload(`POST ${host}${path}`, () =>
        fetch(host, { method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          .then((res) => res.json())
          .then((x) => cb(x))
      )
    },

    disconnect () {
      this.HAR.forEach((l) => l.close())
    }
  }
}

module.exports.createServer = function createServer () {
  return require('http').createServer((req, res) => {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/event-stream', 'Content-Length': '15' })
    res.write('data: reload!\n\n')
  }).listen(3333)
}

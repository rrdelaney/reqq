'use strict'

let http = require('http')
let reqq = require('../')

reqq.createServer()

http.createServer((req, res) => {
  res.writeHead(200, { 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify({ date: new Date().toISOString() }))
}).listen(3000)

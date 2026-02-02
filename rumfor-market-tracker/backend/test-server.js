console.log('[DEBUG] Server starting...')
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/api/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', message: 'Backend is accessible' }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Route not found', url: req.url }))
})

server.listen(3001, () => {
  console.log('[DEBUG] Server listening on port 3001')
})

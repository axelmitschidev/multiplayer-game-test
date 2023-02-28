const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.use('/assets', express.static(path.join(__dirname, './public/assets/')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

let users = []

io.on('connection', (socket) => {
  socket.on('init', (user) => {
    users.push({ ...user, id: socket.id })
    socket.broadcast.emit('users positions', users)
    socket.emit('users positions', users)
  })

  socket.on('user move', (user) => {
    const index = users.findIndex((u) => u.id === socket.id)
    if (index !== -1) {
      users[index] = { ...user, id: socket.id }
    }

    socket.broadcast.emit('users positions', users)
  })

  socket.on('disconnect', () => {
    const index = users.findIndex((u) => u.id === socket.id)
    if (index !== -1) {
      users.splice(index, 1)
    }
    socket.broadcast.emit('users positions', users)
  })
})

server.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})

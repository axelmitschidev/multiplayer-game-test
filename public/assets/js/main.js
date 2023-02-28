socket = io()

let socket_id = null

let food = {
  x: -10,
  y: -10,
}

socket.on('connect', () => (socket_id = socket.id))

let speed = 1

const canvas_element = document.getElementById('canvas')
canvas_element.width = 800
canvas_element.height = 800

const ctx = canvas_element.getContext('2d')

const user = {
  username: prompt('Enter your user name :'),
  x: canvas_element.width / 2,
  y: canvas_element.height / 2,
  color: `rgb(${Math.random() * 256}, ${Math.random() * 256}, ${
    Math.random() * 256
  })`,
}

let users = []

socket.emit('init', user)

let user_move_top = false
let user_move_right = false
let user_move_bottom = false
let user_move_left = false

document.body.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    user_move_top = true
  }

  if (e.key === 'ArrowRight') {
    user_move_right = true
  }

  if (e.key === 'ArrowDown') {
    user_move_bottom = true
  }

  if (e.key === 'ArrowLeft') {
    user_move_left = true
  }
})

document.body.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') {
    user_move_top = false
  }

  if (e.key === 'ArrowRight') {
    user_move_right = false
  }

  if (e.key === 'ArrowDown') {
    user_move_bottom = false
  }

  if (e.key === 'ArrowLeft') {
    user_move_left = false
  }
})

socket.on('food position', (food_server) => {
  food = food_server
})

socket.on('users positions', (users_server) => {
  let new_users = [...users_server]

  const index = new_users.findIndex((u) => u.id === socket_id)
  if (index !== -1) {
    new_users.splice(index, 1)
  }

  users = new_users
})
;(function game_loop() {
  ctx.clearRect(0, 0, canvas_element.width, canvas_element.height)
  window.requestAnimationFrame(game_loop)

  if (user_move_top && user.y > 0) {
    user.y -= speed
    socket.emit('user move', user)
  }

  if (user_move_right && user.x < canvas_element.width - 10) {
    user.x += speed
    socket.emit('user move', user)
  }

  if (user_move_bottom && user.y < canvas_element.height - 10) {
    user.y += speed
    socket.emit('user move', user)
  }

  if (user_move_left && user.x > 0) {
    user.x -= speed
    socket.emit('user move', user)
  }

  users.forEach((u) => {
    ctx.fillStyle = u.color
    ctx.fillRect(u.x, u.y, 10, 10)
  })

  ctx.fillStyle = user.color
  ctx.fillRect(user.x, user.y, 10, 10)

  ctx.beginPath()
  ctx.arc(food.x, food.y, 10, 0, Math.PI * 2)
  ctx.fill()

  update_users_list()
})()

function update_users_list() {
  const users_list_element = document.getElementById('users_list')
  users_list_element.innerHTML = ''
  users.forEach((u) => {
    const li_element = document.createElement('li')
    li_element.style.color = u.color
    li_element.textContent = u.username
    users_list_element.appendChild(li_element)
  })
}

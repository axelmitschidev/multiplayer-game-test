socket = io()

let socket_id = null

let food = {
  x: -100,
  y: -100,
  eated: false,
}

socket.on('connect', () => (socket_id = socket.id))

const canvas_element = document.getElementById('canvas')
canvas_element.width = 800
canvas_element.height = 800

const ctx = canvas_element.getContext('2d')

const user = {
  username: prompt('Enter your user name :'),
  x: canvas_element.width / 2,
  y: canvas_element.height / 2,
  color: prompt('Enter your color (in HEX Example: `#F43215`) :'),
  score: 0,
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
  food.eated = false
})

socket.on('users positions', (users_server) => {
  let new_users = [...users_server]

  const index = new_users.findIndex((u) => u.id === socket_id)
  if (index !== -1) {
    new_users.splice(index, 1)
  }

  users = new_users
})

let last_timestamp = 0

function game_loop(timestamp) {
  frame_duration = timestamp - last_timestamp
  ctx.clearRect(0, 0, canvas_element.width, canvas_element.height)
  window.requestAnimationFrame(game_loop)

  if (user_move_top && user.y > 0) {
    user.y -= frame_duration / 5
    socket.emit('user move', user)
  }

  if (user_move_right && user.x < canvas_element.width - 10) {
    user.x += frame_duration / 5
    socket.emit('user move', user)
  }

  if (user_move_bottom && user.y < canvas_element.height - 10) {
    user.y += frame_duration / 5
    socket.emit('user move', user)
  }

  if (user_move_left && user.x > 0) {
    user.x -= frame_duration / 5
    socket.emit('user move', user)
  }

  users.forEach((u) => {
    ctx.fillStyle = u.color
    ctx.fillRect(u.x, u.y, 10, 10)
  })

  ctx.fillStyle = user.color
  ctx.fillRect(user.x, user.y, 10, 10)

  ctx.strokeStyle = '#000'
  ctx.beginPath()
  ctx.arc(food.x, food.y, 5, 0, Math.PI * 2)
  ctx.stroke()

  if (
    user.x + 10 > food.x - 5 &&
    user.x < food.x + 5 &&
    user.y + 10 > food.y - 5 &&
    user.y < food.y + 5 &&
    !food.eated
  ) {
    food.eated = true
    food.x = -10
    food.y = -10
    socket.emit('food eat', user)
    user.score++
    document.getElementById('my_score').textContent = user.score
  }

  update_users_list()
  last_timestamp = timestamp
}

game_loop()

function update_users_list() {
  const users_list_element = document.getElementById('users_list')
  users_list_element.innerHTML = ''
  users.forEach((u) => {
    const li_element = document.createElement('li')
    li_element.style.color = u.color
    li_element.textContent = u.username + ' | score: ' + u.score
    users_list_element.appendChild(li_element)
  })
}

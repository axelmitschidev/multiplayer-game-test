socket = io()

let socket_id = null

let food = {
  x: -100,
  y: -100,
}

const canvas_element = document.getElementById('canvas')
canvas_element.width = 800
canvas_element.height = 800

const ctx = canvas_element.getContext('2d')

let users = []

socket.on('food position', (food_server) => {
  food = food_server
})

setInterval(() => socket.emit('food position'), 1)

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
    user.y -= 2
    socket.emit('user move', user)
  }

  if (user_move_right && user.x < canvas_element.width - 10) {
    user.x += 2
    socket.emit('user move', user)
  }

  if (user_move_bottom && user.y < canvas_element.height - 10) {
    user.y += 2
    socket.emit('user move', user)
  }

  if (user_move_left && user.x > 0) {
    user.x -= 2
    socket.emit('user move', user)
  }

  users.forEach((u) => {
    ctx.fillStyle = u.color
    ctx.fillRect(u.x, u.y, 10, 10)
  })

  ctx.fillStyle = user.color
  ctx.fillRect(user.x, user.y, 10, 10)

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(food.x, food.y, 5, 0, Math.PI * 2)
  ctx.fill()

  update_users_list()
})()

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
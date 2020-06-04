import { SnapshotInterpolation, Vault } from '../../lib/index'
import geckos from '@geckos.io/client'
import { addLatencyAndPackagesLoss, collisionDetection } from '../common'

const channel = geckos()
const SI = new SnapshotInterpolation(15) // the server's fps is 15
const playerVault = new Vault()
const players = new Map()

const body = document.body
body.style.padding = 0
body.style.margin = 0
body.style.overflow = 'hidden'
body.style.background = '#21222c'

const canvas = document.createElement('canvas')
const width = 1280
const height = 720
canvas.width = width
canvas.height = height
let worldScale = 1

const resize = () => {
  const w = window.innerWidth
  const h = window.innerHeight
  const scaleX = w / canvas.width
  const scaleY = h / canvas.height
  const scale = (worldScale = Math.min(scaleX, scaleY))

  canvas.style.width = `${width * scale}px`
  canvas.style.height = `${height * scale}px`

  canvas.style.margin = ` ${h / 2 - (height * scale) / 2}px 0px 0px ${w / 2 -
    (width * scale) / 2}px`
}
resize()
window.addEventListener('resize', () => resize())

body.appendChild(canvas)
const ctx = canvas.getContext('2d')

// add bots button
window.isBot = false
const button = document.createElement('button')
button.innerHTML = 'Make Bot'
button.style.position = 'absolute'
button.style.top = '50px'
button.style.left = 'calc(50% - 50px)'
button.style.fontSize = '18px'
button.style.padding = '8px 12px'
button.addEventListener('click', () => {
  window.isBot = !window.isBot
  button.innerHTML = window.isBot ? 'Stop Bot' : 'Make Bot'
  keys = { left: false, up: false, right: false, down: false }
})
body.appendChild(button)

let connected = false

let tick = 0

let keys = {
  left: false,
  up: false,
  right: false,
  down: false,
}

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  } else {
    console.log('You are connected!')
  }

  connected = true

  channel.on('update', snapshot => {
    addLatencyAndPackagesLoss(() => {
      SI.snapshot.add(snapshot)
    })
  })

  channel.on('hit', entity => {
    addLatencyAndPackagesLoss(() => {
      const player = players.get(entity.id)
      if (player) {
        player.color = '#50fa7b'
        setTimeout(() => {
          player.color = '#87e9f0'
        }, 500)
      }
      console.log('You just hit ', entity.id)
    }, false)
  })

  channel.on('removePlayer', id => {
    if (players.has(id)) {
      setTimeout(() => {
        players.delete(id)
      }, 1000)
    }
  })
})

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#6070a1'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  players.forEach(p => {
    ctx.beginPath()
    ctx.fillStyle = p.color || '#87e9f0'
    ctx.rect(p.x, p.y, 40, 60)
    ctx.fill()
  })
}

const serverReconciliation = () => {
  const { left, up, right, down } = keys
  const player = players.get(channel.id)

  if (player) {
    // get the latest snapshot from the server
    const serverSnapshot = SI.vault.get()
    // get the closest player snapshot that matches the server snapshot time
    const playerSnapshot = playerVault.get(serverSnapshot.time, true)

    if (serverSnapshot && playerSnapshot) {
      // get the current player position on the server
      const serverPos = serverSnapshot.state.filter(s => s.id === channel.id)[0]

      // calculate the offset between server and client
      const offsetX = playerSnapshot.state[0].x - serverPos.x
      const offsetY = playerSnapshot.state[0].y - serverPos.y

      // check if the player is currently on the move
      const isMoving = left || up || right || down

      // we correct the position faster if the player moves
      const correction = isMoving ? 60 : 180

      // apply a step by step correction of the player's position
      player.x -= offsetX / correction
      player.y -= offsetY / correction
    }
  }
}

const clientPrediction = () => {
  const { left, up, right, down } = keys
  const speed = 3
  const player = players.get(channel.id)

  if (player) {
    if (left) player.x -= speed
    if (up) player.y -= speed
    if (right) player.x += speed
    if (down) player.y += speed
    playerVault.add(
      SI.snapshot.create([{ id: channel.id, x: player.x, y: player.y }])
    )
  }
}

const loop = () => {
  tick++
  if (connected) {
    if (window.isBot) {
      const player = players.get(channel.id)
      if (typeof player.direction === 'undefined') player.direction = 'right'
      if (player.x + 40 > canvas.width) player.direction = 'left'
      else if (player.x < 0) player.direction = 'right'

      if (player.direction === 'right')
        keys = { left: false, up: false, right: true, down: false }
      if (player.direction === 'left')
        keys = { left: true, up: false, right: false, down: false }
    }

    const update = [keys.left, keys.up, keys.right, keys.down]
    channel.emit('move', update)
  }

  clientPrediction()
  serverReconciliation()

  const snapshot = SI.calcInterpolation('x y') // interpolated
  // const snapshot = SI.vault.get() // latest
  if (snapshot) {
    const { state } = snapshot
    state.forEach(s => {
      const { id, x, y } = s
      // update player
      if (players.has(id)) {
        // do not update our own player (if we use clientPrediction and serverReconciliation)
        if (id === channel.id) return

        const player = players.get(id)
        player.x = x
        player.y = y
      } else {
        // add new player
        players.set(id, { id, x, y })
      }
    })
  }

  render()

  requestAnimationFrame(loop)
}

loop()

canvas.addEventListener('pointerdown', e => {
  let { clientX, clientY } = e
  const rect = canvas.getBoundingClientRect()

  clientX -= rect.left
  clientY -= rect.top
  clientX /= worldScale
  clientY /= worldScale

  let hit = false
  players.forEach(entity => {
    if (
      collisionDetection(
        { x: entity.x, y: entity.y, width: 40, height: 60 },
        // make the pointer 10px by 10px
        { x: clientX - 5, y: clientY - 5, width: 10, height: 10 }
      )
    ) {
      entity.color = '#ff79c6'
      hit = true
    }
  })

  if (connected && hit)
    channel.emit(
      'shoot',
      { x: clientX, y: clientY, time: SI.serverTime },
      { reliable: true }
    )
})

document.addEventListener('keydown', e => {
  const { keyCode } = e
  switch (keyCode) {
    case 37:
      keys.left = true
      break
    case 38:
      keys.up = true
      break
    case 39:
      keys.right = true
      break
    case 40:
      keys.down = true
      break
  }
})

document.addEventListener('keyup', e => {
  const { keyCode } = e
  switch (keyCode) {
    case 37:
      keys.left = false
      break
    case 38:
      keys.up = false
      break
    case 39:
      keys.right = false
      break
    case 40:
      keys.down = false
      break
  }
})

import { SnapshotInterpolation, Vault } from '../../lib/index'
import geckos from '@geckos.io/client'
import { addLatencyAndPackagesLoss } from '../common'

const channel = geckos()
const SI = new SnapshotInterpolation()
const playerVault = new Vault()
const players = new Map()

// set a interpolation buffer of 250ms
SI.interpolationBuffer.set(250)

const body = document.body
body.style.padding = 0
body.style.margin = 0
body.style.overflow = 'hidden'

const canvas = document.createElement('canvas')
canvas.style.width = `${window.innerWidth}px`
canvas.style.height = `${window.innerHeight}px`
canvas.width = window.innerWidth
canvas.height = window.innerHeight
body.appendChild(canvas)
const ctx = canvas.getContext('2d')

let connected = false

window.isBot = false
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
      console.log('You just hit ', entity)
    })
  })
})

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  players.forEach(p => {
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.rect(p.x, p.y, 25, 40)
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
    const tmp = playerVault.get(serverSnapshot.time, true)
    if (!tmp) return

    const playerSnapshot = tmp[0]

    if (serverSnapshot && playerSnapshot) {
      // get the current player position on the server
      const serverPos = serverSnapshot.state.filter(
        s => s.playerId === channel.id
      )[0]

      // calculate the offset between server and client
      const offsetX = playerSnapshot.state.x - serverPos.x
      const offsetY = playerSnapshot.state.y - serverPos.y

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
    playerVault.add(SI.snapshot.create([{ x: player.x, y: player.y }]))
  }
}

const loop = () => {
  tick++
  if (connected) {
    if (window.isBot) {
      if (Math.sin(tick / 40) > 0)
        keys = { left: false, up: false, right: true, down: false }
      else keys = { left: true, up: false, right: false, down: false }
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
      const { playerId, x, y } = s
      // update player
      if (players.has(playerId)) {
        // do not update our own player (if we use clientPrediction and serverReconciliation)
        if (playerId === channel.id) return

        const player = players.get(playerId)
        player.x = x
        player.y = y
      } else {
        // add new player
        players.set(playerId, { x, y })
      }
    })
  }

  render()

  requestAnimationFrame(loop)
}

loop()

canvas.addEventListener('pointerdown', e => {
  const { clientX, clientY } = e
  if (connected)
    channel.emit('shoot', { x: clientX, y: clientY, time: SI.serverTime })
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

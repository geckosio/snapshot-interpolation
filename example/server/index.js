const { SnapshotInterpolation } = require('../../lib/index')
const geckos = require('@geckos.io/server').default
const { addLatencyAndPackagesLoss } = require('../common')

const io = geckos()
const SI = new SnapshotInterpolation()
const players = new Map()
let tick = 0

io.listen()

// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
const collisionDetection = (rect1, rect2) => {
  if (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  ) {
    return true
  }
  return false
}

io.onConnection(channel => {
  players.set(channel.id, {
    id: SnapshotInterpolation.NewId(),
    x: Math.random() * 500,
    y: Math.random() * 500,
    r: 0,
  })

  channel.onDisconnect(() => {
    if (players.has(channel.id)) players.delete(channel.id)
  })

  channel.on('move', data => {
    addLatencyAndPackagesLoss(() => {
      const player = players.get(channel.id)
      if (player) {
        player.vx = data[2] - data[0]
        player.vy = data[3] - data[1]
      }
    })
  })

  channel.on('shoot', data => {
    addLatencyAndPackagesLoss(() => {
      const { x, y, time } = data

      // get the two closest snapshot to the date
      const shots = SI.vault.get(time)
      if (!shots) return

      // interpolate between both snapshots
      const shot = SI.interpolate(shots.older, shots.newer, time, 'x y')
      if (!shot) return

      // check for a collision
      shot.state.forEach(entity => {
        if (
          collisionDetection(
            { x: entity.x, y: entity.y, width: 25, height: 40 },
            // make the pointer 10px by 10px
            { x: x - 5, y: y - 5, width: 10, height: 10 }
          )
        ) {
          channel.emit('hit', entity)
        }
      })
    })
  })
})

const loop = () => {
  tick++

  // update world (physics etc.)
  const speed = 3
  players.forEach(player => {
    if (player.vx) player.x += player.vx * speed
    if (player.vy) player.y += player.vy * speed
    player.r += 1.268
    player.r = player.r % 360
  })

  // send state on every 4th frame
  if (tick % 4 === 0) {
    const worldState = []
    players.forEach((player, key) => {
      worldState.push({
        id: key,
        x: player.x,
        y: player.y,
        r: player.r,
      })
    })

    const snapshot = SI.snapshot.create(worldState)
    SI.vault.add(snapshot)
    io.emit('update', snapshot)
  }
}

// server calculates position at 60 fps
// but sends a snapshot at 15 fps (to save bandwidth)
setInterval(loop, 1000 / 60)

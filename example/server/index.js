const { SnapshotInterpolation } = require('../../lib/index')
const geckos = require('@geckos.io/server').default
const { addLatencyAndPackagesLoss, collisionDetection } = require('../common')

const io = geckos()
const SI = new SnapshotInterpolation()
const players = new Map()
let tick = 0

io.listen()

io.onConnection(channel => {
  players.set(channel.id, {
    x: Math.random() * 500,
    y: Math.random() * 500,
  })

  channel.onDisconnect(() => {
    io.emit('removePlayer', channel.id)
    if (players.has(channel.id)) {
      players.delete(channel.id)
    }
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
            { x: entity.x, y: entity.y, width: 40, height: 60 },
            // make the pointer 10px by 10px
            { x: x - 5, y: y - 5, width: 10, height: 10 }
          )
        ) {
          channel.emit('hit', entity, { reliable: true })
        }
      })
    }, false)
  })
})

const loop = () => {
  tick++

  // update world (physics etc.)
  const speed = 3
  players.forEach(player => {
    if (player.vx) player.x += player.vx * speed
    if (player.vy) player.y += player.vy * speed
  })

  // send state on every 4th frame
  if (tick % 4 === 0) {
    const worldState = []
    players.forEach((player, key) => {
      worldState.push({
        id: key,
        x: player.x,
        y: player.y,
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

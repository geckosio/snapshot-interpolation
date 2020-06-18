const { SnapshotInterpolation } = require('../lib/index')
const {
  BufferSchema,
  Model,
  uint8,
  int16,
  uint64,
  string8,
} = require('../node_modules/@geckos.io/typed-array-buffer-schema/lib/index')

const tick = 1000 / 20

const delay = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, tick)
  })
}

const SI = new SnapshotInterpolation()
SI.interpolationBuffer.set(30) // this is only that low for testing

const playerSchema = BufferSchema.schema('player', {
  id: uint8,
  x: { type: int16, digits: 1 },
  y: { type: int16, digits: 1 },
})

const snapshotSchema = BufferSchema.schema('snapshot', {
  id: { type: string8, length: 6 },
  time: uint64,
  state: { players: [playerSchema] },
})

const snapshotModel = new Model(snapshotSchema)

const buffer = new Array(2)

test('should add 2 shots', async done => {
  const snapshot0 = SI.snapshot.create({
    players: [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 0, y: 0 },
    ],
  })
  buffer[0] = snapshotModel.toBuffer(snapshot0)

  await delay()

  const snapshot1 = SI.snapshot.create({
    players: [
      { id: 0, x: 10, y: 5 },
      { id: 1, x: 20, y: 50 },
    ],
  })
  buffer[1] = snapshotModel.toBuffer(snapshot1)

  done()
})

test('should decompress buffer and add snapshots', async done => {
  const snapshot0 = snapshotModel.fromBuffer(buffer[0])
  const snapshot1 = snapshotModel.fromBuffer(buffer[1])
  SI.addSnapshot(snapshot0)
  SI.addSnapshot(snapshot1)

  await delay()

  expect(SI.vault.size).toBe(2)
  expect(snapshot0.state.players[0].x).toBe(0)
  done()
})

test('should interpolate the players array', () => {
  const snap = SI.calcInterpolation('x y', 'players')
  expect(snap.state[0].x > 0 && snap.state[0].x < 10).toBeTruthy()
  expect(snap.state[1].id).toBe(1)
})

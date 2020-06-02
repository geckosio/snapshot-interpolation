const { SnapshotInterpolation } = require('../lib/index')

const SI = new SnapshotInterpolation()
SI.interpolationBuffer.set(30) // this is only that low for testing
let snapshot
let id1
let id2
let interpolatedSnapshot

test('should be initialized', () => {
  expect(SI).not.toBeUndefined()
})

test('should create and add snapshot', done => {
  setTimeout(() => {
    snapshot = SI.snapshot.create([{ x: 0, y: 0 }])
    id1 = snapshot.id
    SI.snapshot.add(snapshot)
    expect(snapshot).not.toBeUndefined()
    done()
  }, 1000 / 20)
})

test('snapshot id should be 6 chars long', () => {
  expect(snapshot.id.length).toBe(6)
})

test('vault should have a size of one', () => {
  expect(SI.vault.size).toBe(1)
})

test('getting latest snapshot should have same id', () => {
  const s = SI.vault.get()
  expect(s.id).toBe(snapshot.id)
})

test('should create and add another snapshot', done => {
  setTimeout(() => {
    snapshot = SI.snapshot.create([{ x: 10, y: 10 }])
    id2 = snapshot.id
    SI.snapshot.add(snapshot)
    expect(SI.vault.size).toBe(2)
    done()
  }, 1000 / 20)
})

test('should get interpolated value', () => {
  interpolatedSnapshot = SI.calcInterpolation('x y')
  expect(interpolatedSnapshot).not.toBeNull()
})

test('should have same id as original snapshots', () => {
  const mergedId1 = interpolatedSnapshot.older + interpolatedSnapshot.newer
  const mergedId2 = id1 + id2
  expect(mergedId1).toBe(mergedId2)
})

test('values should be interpolated', () => {
  interpolatedSnapshot.state.forEach(entity => {
    expect(entity.x > 0 && entity.x < 10).toBeTruthy()
  })
})

const { Vault, SnapshotInterpolation } = require('../lib/index')

const vault = new Vault()
let snapshotId

test('empty vault size should be 0', () => {
  expect(vault.size).toBe(0)
})

test('max vault size should be 120', () => {
  expect(vault.getMaxSize()).toBe(120)
})

test('max vault size should be increased to 180', () => {
  vault.setMaxSize(180)
  expect(vault.getMaxSize()).toBe(180)
})

test('add a snapshot to the vault', () => {
  const snapshot = SnapshotInterpolation.CreateSnapshot([{ x: 10, y: 10 }])
  snapshotId = snapshot.id
  vault.add(snapshot)
  expect(vault.size).toBe(1)
})

test('decrease max vault size', () => {
  vault.setMaxSize(1)
  expect(vault.getMaxSize()).toBe(1)
})

test('get a snapshot by its id', () => {
  const snapshot = vault.getById(snapshotId)
  expect(snapshot.id).toBe(snapshotId)
})

test('add a second snapshot to the vault', () => {
  const snapshot = SnapshotInterpolation.CreateSnapshot([{ x: 20, y: 20 }])
  vault.add(snapshot)
  expect(vault.size).toBe(1)
})

const { Vault } = require('../lib/index')

const vault = new Vault()

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

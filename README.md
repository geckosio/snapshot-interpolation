<div align="center">

<img src="readme/logo.png" alt="logo" height="150">

# Snapshot Interpolation

## A Snapshot Interpolation library for Real-Time Multiplayer Games

#### Easily add Snapshot Interpolation (also called Entity Interpolation or Buffer Interpolation) to your Games.

[![NPM version](https://img.shields.io/npm/v/@geckos.io/snapshot-interpolation.svg?style=flat-square)](https://www.npmjs.com/package/@geckos.io/snapshot-interpolation)
[![Github Workflow](https://img.shields.io/github/workflow/status/geckosio/snapshot-interpolation/CI/master?label=github%20build&logo=github&style=flat-square)](https://github.com/geckosio/snapshot-interpolation/actions?query=workflow%3ACI)
[![GitHub last commit](https://img.shields.io/github/last-commit/geckosio/snapshot-interpolation?style=flat-square)](https://github.com/geckosio/snapshot-interpolation/commits/master)
[![Downloads](https://img.shields.io/npm/dm/@geckos.io/snapshot-interpolation.svg?style=flat-square)](https://www.npmjs.com/package/@geckos.io/snapshot-interpolation)
[![Codecov](https://img.shields.io/codecov/c/github/geckosio/snapshot-interpolation?logo=codecov&style=flat-square)](https://codecov.io/gh/geckosio/snapshot-interpolation)
[![build with TypeScript](https://img.shields.io/badge/built%20with-TypeScript-blue?style=flat-square)](https://www.typescriptlang.org/)

</div>

---

## About

The Interpolation Buffer is by default "latency + 3 serverFrames" long (Interpolation between 4 Snapshots).
So if the **latency is 30ms** and the **ServerFrame is 16ms**, the Interpolation Buffer would be 78ms long.

If you are interested to learn a bit about Snapshot Interpolation, watch [this video](https://youtu.be/Z9X4lysFr64?t=800).

- Easily add **Client-Side Prediction** and **Server Reconciliation**.
- Easily add **Lag Compensation**.
- Easily **compress/encode** your snapshots before sending/receiving.

## Game Example

The [github repository](https://github.com/geckosio/snapshot-interpolation) contains a nice example. Take a look!  
_I will create a video in the future that examples the example_

```bash
# clone the repo
$ git clone https://github.com/geckosio/snapshot-interpolation.git

# cd into it
$ cd snapshot-interpolation

# install all dependencies
$ npm install

# start the example
$ npm start
```

## How to use

### server.js

```js
// import @geckos.io/snapshot-interpolation
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'

// initialize the library (add your server's fps in milliseconds)
const SI = new SnapshotInterpolation(serverFPS)

// your server update loop
update() {
  // create a snapshot of the current world
  const snapshot = SI.snapshot.create(worldState)

  // add the snapshot to the vault in case you want to access it later (optional)
  SI.vault.add(snapshot)

  // send the snapshot to the client (using geckos.io or any other library)
  this.emit('update', snapshot)
}
```

### client.js

```js
// import @geckos.io/snapshot-interpolation
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'

// initialize the library
const SI = new SnapshotInterpolation()

// when receiving the snapshot on the client
this.on('update', (snapshot) => {
  // read the snapshot
  SI.snapshot.add(snapshot)
}

// your client update loop
update() {
  // calculate the interpolation for the parameters x and y and return the snapshot
  const snapshot = SI.calcInterpolation('x y')

  // access your state in snapshot.state.
  const { state } = snapshot

  // apply the interpolated values to you game objects
  const { id, x, y } = state[0]
  if (hero.id === id) {
    hero.x = x
    hero.y = y
  }
}
```

## World State

The World State has to be an Array with non nested Objects (expect for Quaternions). You can name you keys as you want. For degree, radian or quaternion values add (deg), (rad) or (quat).

### Linear Interpolation

```js
// the worldState on the server
const worldState = [
  { id: 'heroBlue', x: 23, y: 14, z: 47 },
  { id: 'heroRed', x: 23, y: 14, z: 47 },
  { id: 'heroGreen', x: 23, y: 14, z: 47 },
]

// calc interpolation on the client
SI.calcInterpolation('x y z')
```

### Degrees, Radians and Quaternions

```js
// the worldState on the server
const worldState = [
  {
    id: 'myHero',
    rad: Math.PI / 4,
    rotationInDeg: 90,
    q: { x: 0, y: 0.707, z: 0, w: 0.707 },
  },
]

// calc interpolation on the client
SI.calcInterpolation('rad(rad) rotationInDeg(deg) q(quat)')
```

## Vault

The Vault holds and secures all your Snapshots. Each SnapshotInterpolation instance holds one Vault, but you can easily create more if you need:

```js
import { Vault } from '@geckos.io/snapshot-interpolation'

const customVault = new Vault()
```

## Compression

You can compress the snapshots manually before sending them to the client, and decompress them when the client receives them. No, compression library is included. You have the freedom to do it however it suits your game best.

## API

This looks very TypeScriptisch, but you can of course use it in JavaScript as well.

```ts
// import
import { SnapshotInterpolation, Vault, Types } from '@geckos.io/snapshot-interpolation'

// types and interfaces
type Value = number | string | Quat | undefined
type ID = string
type Time = number
type State = Entity[]
type Quat = { x: number; y: number; z: number; w: number }

interface Entity {
  id: string
  [key: string]: Value
}
interface Snapshot {
  id: ID
  time: Time
  state: State
}
interface InterpolatedSnapshot extends Omit<Snapshot, 'id' | 'time'> {
  percentage: number
  older: ID
  newer: ID
}

// static methods
/** Create a new Snapshot */
SnapshotInterpolation.CreateSnapshot(state: State): Snapshot
/** Create a new ID */
SnapshotInterpolation.NewId(): string
/** Get the current time in milliseconds. */
SnapshotInterpolation.Now(): number

// class SnapshotInterpolation
const SI = new SnapshotInterpolation(serverFPS?: number)
/** Access the vault. */
SI.vault: Vault
/** Get the Interpolation Buffer time in milliseconds. */
SI.interpolationBuffer.get(): number
/** Set the Interpolation Buffer time in milliseconds. */
SI.interpolationBuffer.set(milliseconds: number): void
/** Create the snapshot on the server. */
SI.snapshot.create(state: State): Snapshot
/** Add the snapshot you received from the server to automatically calculate the interpolation with calcInterpolation() */
SI.snapshot.add(snapshot: Snapshot): void
/** Interpolate between two snapshots give the percentage or time. */
SI.interpolate(snapshotA: Snapshot, snapshotB: Snapshot, timeOrPercentage: number, parameters: string): InterpolatedSnapshot
/** Get the calculated interpolation on the client. */
SI.calcInterpolation(parameters: string): InterpolatedSnapshot | undefined

// class Vault
const vault = new Vault()
/** Get a Snapshot by its ID. */
vault.getById(id: ID): Snapshot
/** Get the latest snapshot */
vault.get(): Snapshot | undefined;
/** Get the two snapshots around a specific time */
vault.get(time: number): { older: Snapshot; newer: Snapshot; } | undefined
/** Get the closest snapshot to e specific time */
get(time: number, closest: boolean): Snapshot | undefined
/** Add a snapshot to the vault. */
vault.add(snapshot: Snapshot): void
/** Get the current capacity (size) of the vault. */
vault.size(): number
/** Set the max capacity (size) of the vault. */
vault.setMaxSize(size: number): void
/** Get the max capacity (size) of the vault. */
vault.getMaxSize(): number

```

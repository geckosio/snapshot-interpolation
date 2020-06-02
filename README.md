# Snapshot Interpolation

## A Snapshot Interpolation library for Real-Time Multiplayer Games

Also called Entity Interpolation.

The Interpolation Buffer is by default "latency + 3 serverFrames" long (Interpolation between 4 Snapshots).
So if the **latency is 30ms** and the **ServerFrame is 16ms**, the Interpolation Buffer would be 78ms long.
See [this video](https://youtu.be/Z9X4lysFr64?t=800).

Easily includes Client-Side Prediction and **Server Reconciliation** using the Snapshot vault.

Easily includes Lag Compensation

Does not compress/encode the data. But you can easily do it yourself.

## Example

The [github repository](https://github.com/geckosio/snapshot-interpolation) contains a nice example:

```bash
$ git clone https://github.com/geckosio/snapshot-interpolation.git

$ cd snapshot-interpolation

$ npm install

$ npm start
```

## Usage

#### server.js

```js
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

#### client.js

```js
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

The World State has to be an Array with non nested Objects.

```js
const worldState = [
  { id: 'heroBlue', x: 23, y: 14, z: 47 },
  { id: 'heroRed', x: 23, y: 14, z: 47 },
  { id: 'heroGreen', x: 23, y: 14, z: 47 },
]
```

## Compression

You can compress the snapshots manually before sending them to the client, and decompress them when when the client receives them.

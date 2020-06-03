import { Snapshot, InterpolatedSnapshot, Time, Value } from './types'
import { Vault } from './vault'
import { lerp, degreeLerp, quatSlerp, radianLerp } from './lerp'

/** A Snapshot Interpolation library. */
export class SnapshotInterpolation {
  /** Access the vault. */
  public vault = new Vault()
  private _interpolationBuffer = 100
  private _timeOffset = -1
  public serverTime = 0

  constructor(serverFPS?: number) {
    if (serverFPS) this._interpolationBuffer = (1000 / serverFPS) * 3
  }

  public get interpolationBuffer() {
    return {
      /** Get the Interpolation Buffer time in milliseconds. */
      get: () => this._interpolationBuffer,
      /** Set the Interpolation Buffer time in milliseconds. */
      set: (milliseconds: number) => {
        this._interpolationBuffer = milliseconds
      },
    }
  }

  /** Get the current time in milliseconds. */
  public static Now() {
    return Date.now() // - Date.parse('01 Jan 2020')
  }

  /** Get the time offset between client and server (inclusive latency). */
  public get timeOffset() {
    return this._timeOffset
  }

  public static NewId() {
    return Math.random()
      .toString(36)
      .substr(2, 6)
  }

  public get snapshot() {
    return {
      /** Create the snapshot on the server. */
      create: (state: any[]): Snapshot =>
        SnapshotInterpolation.CreateSnapshot(state),
      /** Add the snapshot you received from the server to automatically calculate the interpolation with calcInterpolation() */
      add: (snapshot: Snapshot): void => this.addSnapshot(snapshot),
    }
  }

  public static CreateSnapshot(state: any[]): Snapshot {
    if (!Array.isArray(state))
      throw new Error('You have to pass an Array to createSnapshot()')

    return {
      id: SnapshotInterpolation.NewId(),
      time: SnapshotInterpolation.Now(),
      state: state,
    }
  }

  private addSnapshot(snapshot: Snapshot): void {
    if (this._timeOffset === -1) {
      // the time offset between server and client is calculated,
      // by subtracting the current client date from the server time of the
      // first snapshot
      this._timeOffset = SnapshotInterpolation.Now() - snapshot.time
      // console.log('ServerTime offset is ', this._timeOffset)
    }

    this.vault.add(snapshot)
  }

  /** Interpolate between two snapshots give the percentage or time. */
  public interpolate(
    snapshotA: Snapshot,
    snapshotB: Snapshot,
    timeOrPercentage: number,
    parameters: string
  ): InterpolatedSnapshot {
    return this._interpolate(snapshotA, snapshotB, timeOrPercentage, parameters)
  }

  private _interpolate(
    snapshotA: Snapshot,
    snapshotB: Snapshot,
    timeOrPercentage: number,
    parameters: string
  ): InterpolatedSnapshot {
    const sorted = [snapshotA, snapshotB].sort((a, b) => b.time - a.time)
    const params = parameters
      .trim()
      .replace(/\W+/, ' ')
      .split(' ')

    const newer: Snapshot = sorted[0]
    const older: Snapshot = sorted[1]

    const t0: Time = newer.time
    const t1: Time = older.time
    /**
     * If <= it is in percentage
     * else it is the server time
     */
    const tn: number = timeOrPercentage // serverTime is between t0 and t1

    // THE TIMELINE
    // t = time (serverTime)
    // p = entity position
    // ------ t1 ------ tn --- t0 ----->> NOW
    // ------ p1 ------ pn --- p0 ----->> NOW
    // ------ 0% ------ x% --- 100% --->> NOW
    const zeroPercent = tn - t1
    const hundredPercent = t0 - t1
    const pPercent =
      timeOrPercentage <= 1 ? timeOrPercentage : zeroPercent / hundredPercent

    this.serverTime = lerp(t1, t0, pPercent)

    let tmpSnapshot: Snapshot = JSON.parse(JSON.stringify(newer))

    const lerpFnc = (method: string, start: Value, end: Value, t: number) => {
      if (typeof start === 'undefined' || typeof end === 'undefined') return

      if (typeof start === 'string' || typeof end === 'string') return

      if (typeof start === 'number' && typeof end === 'number') {
        if (method === 'linear') return lerp(start, end, t)
        else if (method === 'deg') return degreeLerp(start, end, t)
        else if (method === 'rad') return radianLerp(start, end, t)
      }

      if (typeof start === 'object' && typeof end === 'object') {
        if (method === 'quat') return quatSlerp(start, end, t)
      }

      throw new Error(`No lerp method "${method}" found!`)
    }

    newer.state.forEach((_d: any, i: number) => {
      params.forEach(p => {
        // TODO yandeu: improve this code
        const match = p.match(/\w\(([\w]+)\)/)
        const lerpMethod = match ? match?.[1] : 'linear'
        if (match) p = match?.[0].replace(/\([\S]+$/gm, '')

        const p0 = newer.state[i]?.[p]
        const p1 = older.state[i]?.[p]

        const pn = lerpFnc(lerpMethod, p1, p0, pPercent)
        tmpSnapshot.state[i][p] = pn
      })
    })

    const interpolatedSnapshot: InterpolatedSnapshot = {
      state: tmpSnapshot.state,
      percentage: pPercent,
      newer: newer.id,
      older: older.id,
    }

    return interpolatedSnapshot
  }

  /** Get the calculated interpolation on the client. */
  public calcInterpolation(
    parameters: string
  ): InterpolatedSnapshot | undefined {
    // get the snapshots [this._interpolationBuffer] ago
    const serverTime =
      SnapshotInterpolation.Now() - this._timeOffset - this._interpolationBuffer
    const shots = this.vault.get(serverTime)
    if (!shots) return

    const { older, newer } = shots
    if (!older || !newer) return

    return this._interpolate(newer, older, serverTime, parameters)
  }
}

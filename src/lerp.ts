import { Quat } from './types'

const PI = 3.14159265359
const PI_TIMES_TWO = 6.28318530718

export const lerp = (start: number, end: number, t: number) => {
  return start + (end - start) * t
}

// https://gist.github.com/itsmrpeck/be41d72e9d4c72d2236de687f6f53974
export const degreeLerp = (start: number, end: number, t: number) => {
  let result
  let diff = end - start
  if (diff < -180) {
    // lerp upwards past 360
    end += 360
    result = lerp(start, end, t)
    if (result >= 360) {
      result -= 360
    }
  } else if (diff > 180) {
    // lerp downwards past 0
    end -= 360
    result = lerp(start, end, t)
    if (result < 0) {
      result += 360
    }
  } else {
    // straight lerp
    result = lerp(start, end, t)
  }

  return result
}

// https://gist.github.com/itsmrpeck/be41d72e9d4c72d2236de687f6f53974
export const radianLerp = (start: number, end: number, t: number) => {
  let result
  let diff = end - start
  if (diff < -PI) {
    // lerp upwards past PI_TIMES_TWO
    end += PI_TIMES_TWO
    result = lerp(start, end, t)
    if (result >= PI_TIMES_TWO) {
      result -= PI_TIMES_TWO
    }
  } else if (diff > PI) {
    // lerp downwards past 0
    end -= PI_TIMES_TWO
    result = lerp(start, end, t)
    if (result < 0) {
      result += PI_TIMES_TWO
    }
  } else {
    // straight lerp
    result = lerp(start, end, t)
  }

  return result
}


// Adapted from: 
// https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js#L22
export const quatSlerp = (qa: Quat, qb: Quat, t: number) => {
  let x0 = qa.x
  let y0 = qa.y
  let z0 = qa.z
  let w0 = qa.w

  const x1 = qb.x
  const y1 = qb.y
  const z1 = qb.z
  const w1 = qb.w

  if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

    let s = 1 - t;
    const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1
    const dir = ( cos >= 0 ? 1 : - 1 )
    const sqrSin = 1 - cos * cos

    // Skip the Slerp for tiny steps to avoid numeric problems:
    if ( sqrSin > 0.001 ) {

      const sin = Math.sqrt( sqrSin )
      const len = Math.atan2( sin, cos * dir )

      s = Math.sin( s * len ) / sin
      t = Math.sin( t * len ) / sin
    }

    const tDir = t * dir

    x0 = x0 * s + x1 * tDir
    y0 = y0 * s + y1 * tDir
    z0 = z0 * s + z1 * tDir
    w0 = w0 * s + w1 * tDir

    // Normalize in case we just did a lerp:
    if ( s === 1 - t ) {
      const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 )
      x0 *= f
      y0 *= f
      z0 *= f
      w0 *= f
    }
  }

  return { x: x0, y: y0, z: z0, w: w0 }
}

// The MIT License

// Copyright © 2010-2021 three.js authors

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Adapted from: 
// https://github.com/mrdoob/three.js/blob/dev/src/math/Quaternion.js#L22

import { Quat } from './types'

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

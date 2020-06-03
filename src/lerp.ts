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

// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
export type Quat = { x: number; y: number; z: number; w: number }
export const quatSlerp = (qa: Quat, qb: Quat, t: number) => {
  // quaternion to return
  let qm: Quat = { x: 0, y: 0, z: 0, w: 1 }
  // Calculate angle between them.
  let cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z
  // if qa=qb or qa=-qb then theta = 0 and we can return qa
  if (Math.abs(cosHalfTheta) >= 1.0) {
    qm.w = qa.w
    qm.x = qa.x
    qm.y = qa.y
    qm.z = qa.z
    return qm
  }
  // Calculate temporary values.
  let halfTheta = Math.acos(cosHalfTheta)
  let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta)
  // if theta = 180 degrees then result is not fully defined
  // we could rotate around any axis normal to qa or qb
  if (Math.abs(sinHalfTheta) < 0.001) {
    qm.w = qa.w * 0.5 + qb.w * 0.5
    qm.x = qa.x * 0.5 + qb.x * 0.5
    qm.y = qa.y * 0.5 + qb.y * 0.5
    qm.z = qa.z * 0.5 + qb.z * 0.5
    return qm
  }
  let ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta
  let ratioB = Math.sin(t * halfTheta) / sinHalfTheta
  //calculate Quaternion.
  qm.w = qa.w * ratioA + qb.w * ratioB
  qm.x = qa.x * ratioA + qb.x * ratioB
  qm.y = qa.y * ratioA + qb.y * ratioB
  qm.z = qa.z * ratioA + qb.z * ratioB
  return qm
}

const addLatencyAndPackagesLoss = (fnc, loss = true) => {
  if (loss && Math.random() > 0.9) return // 10% package loss
  setTimeout(() => fnc(), 100 + Math.random() * 50) // random latency between 100 and 150
}

exports.addLatencyAndPackagesLoss = addLatencyAndPackagesLoss

// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
const collisionDetection = (rect1, rect2) => {
  if (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  ) {
    return true
  }
  return false
}

exports.collisionDetection = collisionDetection

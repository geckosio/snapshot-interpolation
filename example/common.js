const addLatencyAndPackagesLoss = fnc => {
  if (Math.random() > 0.9) return // 10% package loss
  setTimeout(() => fnc(), 100 + Math.random() * 50) // random latency between 100 and 150
}

exports.addLatencyAndPackagesLoss = addLatencyAndPackagesLoss

import route from './route'

export function distanceAlongRoute(position) {
  const nearestSegmentIndex = nearestSegment(position)

  return route[nearestSegmentIndex].distance
    + distanceAlongSegment(
      position.longitude, position.latitude,
      route[nearestSegmentIndex].longitude, route[nearestSegmentIndex].latitude,
      route[nearestSegmentIndex+1].longitude, route[nearestSegmentIndex+1].latitude
    )
}

export function nearestSegment(position) {
  let nearestSegmentIndex = 0
  let nearestDistance = Number.MAX_VALUE

  for (let i = 0; i < route.length - 1; i++) {
    const thisDistance = pDistance(
      position.longitude, position.latitude,
      route[i].longitude, route[i].latitude,
      route[i+1].longitude, route[i+1].latitude
    )

    if (thisDistance < nearestDistance) {
      nearestDistance = thisDistance
      nearestSegmentIndex = i
    }
  }

  return nearestSegmentIndex
}

export function distance(p1, p2) {
  // http://www.movable-type.co.uk/scripts/latlong.html

  const R = 6371e3 // metres
  const phi1 = toRad(p1.latitude)
  const phi2 = toRad(p2.latitude)
  const deltaPhi = toRad(p2.latitude-p1.latitude)
  const deltaLambda = toRad(p2.longitude-p1.longitude)

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

function toRad(degrees){
  return degrees * Math.PI / 180
}

export function pDistance(x, y, x1, y1, x2, y2) {
  // https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

  const A = x - x1
  const B = y - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const len_sq = C * C + D * D
  let param = -1
  if (len_sq !== 0) //in case of 0 length line
    param = dot / len_sq

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  }
  else if (param > 1) {
    xx = x2
    yy = y2
  }
  else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  return distance({ latitude: y, longitude: x }, {latitude: yy, longitude: xx })
}

export function distanceAlongSegment(x, y, x1, y1, x2, y2) {
  // Adapted from https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment

  const A = x - x1
  const B = y - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const len_sq = C * C + D * D
  let param = -1
  if (len_sq !== 0) //in case of 0 length line
    param = dot / len_sq

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  }
  else if (param > 1) {
    xx = x2
    yy = y2
  }
  else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  return distance({ latitude: y1, longitude: x1 }, {latitude: yy, longitude: xx })
}

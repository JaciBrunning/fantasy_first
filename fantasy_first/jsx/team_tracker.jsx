export class TeamTracker {
  constructor(history_fetcher, alliance_fetcher, pointsCfg) {
    this.teamHistory = []
    this.alliances = []
    this.targetIdx = -1
    this.pointsCfg = pointsCfg

    this.points = { }

    this.onHistoryData = this.onHistoryData.bind(this)
    this.onAllianceData = this.onAllianceData.bind(this)
    this.size = this.size.bind(this)
    this.matchName = this.matchName.bind(this)
    this.target = this.target.bind(this)
    this.recalc = this.recalc.bind(this)
    this.toPoints = this.toPoints.bind(this)
    this.callbacks = []

    history_fetcher.mount(this.onHistoryData)
    alliance_fetcher.mount(this.onAllianceData)
  }

  onHistoryData(history) {
    this.teamHistory = history
    this.target(this.size() - 1)
    this.recalc()
  }

  onAllianceData(alliance) {
    this.alliances = alliance
    this.recalc()
  }

  size() {
    return this.teamHistory.length
  }

  matchName(idx) {
    return this.teamHistory[idx]['m']
  }

  target(idx) {
    if (this.size() == 0) {
      this.targetIdx = -1
    } else {
      this.targetIdx = idx
    }
  }

  recalc() {
    this.points = { }
    if (this.targetIdx != -1) {
      let target = this.teamHistory[this.targetIdx]
      for (var i = 0; i < this.targetIdx; i++) {
        let cur = this.teamHistory[i]
        let teams = cur['t']
        let playoff = cur['p']

        for (var j in teams) {
          let team = teams[j][0]
          let wtl = teams[j][1] // 0 = W, 1 = T, 2 = L

          let teamNumber = team.substr(3)
          let pts = this.points[teamNumber]
          if (pts == undefined || pts == null) {
            pts = { 'q': [0, 0, 0], 'e': [0, 0, 0], 'd': 0, 'total': 0 }
          }
          pts[playoff ? 'e' : 'q'][wtl] += 1
          pts['total'] = this.toPoints(pts)
          this.points[teamNumber] = pts
        }
      }
      // let teams = target['t']

      // for (let team in teams) {
      //   if (!teams.hasOwnProperty(team)) continue

      //   let teamNumber = team.substr(3)
      //   this.points[teamNumber] = teams[team]
      //   this.points[teamNumber]['d'] = 0
      //   this.points[teamNumber]['total'] = this.toPoints(teams[team])
      // }

      if (target['p']) {
        // Playoff match - include draft points
        for (let team in this.alliances) {
          if (!this.alliances.hasOwnProperty(team)) continue

          let teamNumber = team.substr(3)
          let pts = this.points[teamNumber]
          if (pts == undefined || pts == null) {
            pts = { 'q': [0, 0, 0], 'e': [0, 0, 0], 'd': 0 }
          }
          pts['d'] += this.alliances[team]

          this.points[teamNumber] = pts
          this.points[teamNumber]['total'] = this.toPoints(pts)
        }
      }
    }

    this.callbacks.forEach((cb) => { cb(this.points) })
  }

  mount(callback) {
    this.callbacks.push(callback)
    this.recalc()
  }

  toPoints(pts) {
    return this.pointsFor(pts['q'], this.pointsCfg['qual']) + this.pointsFor(pts['e'], this.pointsCfg['elim']) + pts['d']
  }

  pointsFor(pts, cfg) {
    return pts[0]*cfg[0] + pts[1]*cfg[1] + pts[2]*cfg[2]
  }
}
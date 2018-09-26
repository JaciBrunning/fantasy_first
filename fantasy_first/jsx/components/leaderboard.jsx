export class LeaderboardView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { points: {}, picks: [] }

    props.tracker.mount((pts) => this.setState({ points: pts }))
    props.fetcher.mount((data) => this.setState({ picks: data }))
  }

  mapTeams() {
    return this.state.picks.map((pickTeam) => {
      let mapped = pickTeam.picks.map((picked) => {
        let pts = this.state.points[String(picked)]
        if (pts != undefined && pts != null)
          pts = pts.total
        return { team: picked, pts: pts }
      }).filter((val) => { return val.pts != undefined && val.pts != null })

      let total = 0
      let highest_earner = undefined
      if (mapped.length != 0)
        total = mapped.map(e => e.pts).reduce((tot, ent) => tot + ent)

      if (total > 0) {
        mapped.forEach((e) => {
          if (highest_earner == undefined || e.pts > highest_earner.pts)
            highest_earner = e
        })
      }

      return { team: pickTeam.name, picked: mapped, total: total, highest_earner: highest_earner }
    })
  }

  mapMedals() {
    let medals = ["gold", "silver", "bronze"]
    let mapped = this.mapTeams().sort((a, b) => b.total - a.total)
    let medalvals = [... new Set(mapped.map((entry) => entry.total))]
      .map((t, idx) => { return { total: t, medal: medals[idx] } })
      .filter((v) => { return v != undefined && v != null })
      .reduce((m, o) => { m[o.total] = o.medal; return m }, {})

    if (Object.keys(medalvals).length < 3) medalvals = {}

    return mapped.map((entry) => {
      entry.medal = medalvals[entry.total]
      return entry
    })
  }

  render() {
    return (
      <div style={{ width: "100%" }}>
        <div className="row">
          <div className="column">
            <table className="picks">
              <thead>
                <tr>
                  <th style={{width: '60%'}}> Team </th>
                  <th> Points </th>
                  <th> Highest Points Earner </th>
                </tr>
              </thead>
              <tbody>
                {
                  this.mapMedals()
                    .sort((a, b) => b.total - a.total)
                    .map((entry) => {
                      return <tr>
                        <td>
                          {
                            entry.medal != undefined ?
                              <i className={"fas fa-medal " + entry.medal}> </i> : ""
                          } &nbsp; {entry.team}
                        </td>
                        <td> {entry.total} </td>
                        <td> {
                          (entry.highest_earner == undefined ? "-" : (
                            "Team " + entry.highest_earner.team + " (" + entry.highest_earner.pts + ")"
                          ))
                        } </td>
                      </tr>
                    })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}
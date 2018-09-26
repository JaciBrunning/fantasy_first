import InputRange from 'react-input-range'
require('react-input-range/lib/css/index.css')

export class ControllerView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { refreshing: [], anyRefreshing: false, refresh_marked: false, maxTargetIdx: -1, targetIdx: 0 }

    for (let i in props.fetchers) {
      this.state.refreshing[i] = false
      props.fetchers[i].mount((data) => { this.refreshComplete(i) })
    }

    props.tracker.mount((pts) => {
      this.setState({ maxTargetIdx: props.tracker.size() - 1, targetIdx: props.tracker.targetIdx })
    })

    this.changeTarget = this.changeTarget.bind(this)
    this.doRefresh = this.doRefresh.bind(this)
    this.refreshLoop = this.refreshLoop.bind(this)

    setTimeout(this.refreshLoop, 1000*60*7)  // 7 Minutes
  }

  doRefresh() {
    if (!this.state.anyRefreshing) {
      this.state.anyRefreshing = true
      for (var i in this.props.fetchers) {
        this.state.refreshing[i] = true
        this.props.fetchers[i].refresh()
      }
    }
  }

  refreshComplete(i) {
    this.state.refreshing[i] = false
    if (this.state.refreshing.every((v) => { return !v })) {
      this.state.anyRefreshing = false
      this.state.refresh_marked = true
      setTimeout(() => { this.setState({ refresh_marked: false }) }, 2000)
    }
    this.setState(this.state)
  }

  refreshLoop() {
    this.doRefresh()
    setTimeout(this.refreshLoop, 1000*60*7)  // 7 Minutes
  }

  changeTarget(i) {
    this.setState({ targetIdx: i })
    this.props.tracker.target(i)
    this.props.tracker.recalc()
  }

  render() {
    return (
      <div className="row">
        <div className="column">
          {
            (this.state.maxTargetIdx <= 0) ? <div className="row" /> :
              <div className="row">
                <div className="column">
                  <InputRange
                    maxValue={this.state.maxTargetIdx}
                    minValue={0}
                    value={this.state.targetIdx}
                    onChange={this.changeTarget}
                    formatLabel={value => `${this.props.tracker.matchName(value)}`} />
                </div>
              </div>
          }
          <div className="row">
            <div className="column">
              <a className={("button button-clear " + (this.state.refresh_marked ? "green" : ""))}
                onClick={(e) => { this.doRefresh() }}>
                <i className={
                  ("fas " +
                    (this.state.refresh_marked ? "fa-check" : "fa-sync-alt") +
                    (this.state.anyRefreshing ? " fa-spin" : ""))
                }> </i> Refresh </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
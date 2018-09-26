import { Fetcher } from './fetcher.jsx';
import { TeamTracker } from './team_tracker.jsx';

import { MultiTab } from './components/multitab.jsx'
import { ControllerView } from './components/controller_view.jsx'
import { PicksView } from './components/picks_view.jsx'
import { LeaderboardView } from './components/leaderboard.jsx';
import { TeamsView } from './components/team_viewer.jsx'

let allianceFetcher = new Fetcher(EVENT_KEY + '/alliances')
let historyFetcher = new Fetcher(EVENT_KEY + '/history')

let pointsConfig = {
  'qual': [ 2, 1, 0 ],  // W T L
  'elim': [ 5, 0, 0 ]   // W T L
}
let teamTracker = new TeamTracker(historyFetcher, allianceFetcher, pointsConfig)

let picksFetchers = {
  'users': new Fetcher(EVENT_KEY + '/picks/users'),
  'hosts': new Fetcher(EVENT_KEY + '/picks/hosts')
}

let content = <MultiTab options={[
  { fa: "trophy", name: "Leaderboard", entry: <LeaderboardView fetcher={picksFetchers['users']} tracker={teamTracker}/> },
  { fa: "users", name: "Team Picks", entry: <PicksView fetcher={picksFetchers['users']} /> },
  { fa: "microphone", name: "Host Picks", entry: <PicksView fetcher={picksFetchers['hosts']} /> },
  { fa: 'gamepad', name: 'Robots', entry: <TeamsView tracker={teamTracker} /> }
]}/>

ReactDOM.render(content, document.getElementById("event_view"))
ReactDOM.render(<LeaderboardView fetcher={picksFetchers['hosts']} tracker={teamTracker}/>, document.getElementById("hosts_leaderboard"))
ReactDOM.render(<ControllerView fetchers={[
  allianceFetcher, historyFetcher, picksFetchers['users'], picksFetchers['hosts']
]} tracker={teamTracker}/>, document.getElementById("controller"))
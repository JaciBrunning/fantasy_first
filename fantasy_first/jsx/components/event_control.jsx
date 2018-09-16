class EventDraftRow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cost: this.props.cost,
      pickable: this.props.pickable
    };

    this.save = this.save.bind(this)
  }

  save(e) {
    this.props.save(this.props.number, this.state.cost, this.state.pickable)
    e.preventDefault()
  }

  render() {
    return <tr>
      <td> { this.props.number } </td>
      <td> 
        <input type="number" min="0" max="100" value={ this.state.cost } onChange={(e) => this.setState({cost: e.target.value})} onKeyDown={(e) => { if (e.keyCode == 13) this.save(e) }}></input>
      </td>
      <td> 
        <input type="checkbox" checked={ this.state.pickable} onChange={(e) => { this.setState({pickable: e.target.checked}); this.save(e) }}></input>
      </td>
      <td>
        <a href="" onClick={this.save}>
          <i className="fas fa-save"></i>
        </a>
      </td>
    </tr>
  }
}

export class EventDraftList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { teams: [] }

    this.onMessage = this.onMessage.bind(this)
    this.refresh = this.refresh.bind(this)
    this.save = this.save.bind(this)

    props.ws.register('draft_options', this.onMessage)
    props.ws.send('draft_options', 'list', this.props.event_key)
  }

  onMessage(type, action, data) {
    if (action == "list") {
      this.setState({ teams: JSON.parse(data) })
    }
  }

  refresh(e) {
    e.preventDefault()
    this.props.ws.send('draft_options', 'refetch', this.props.event_key)
  }

  save(number, cost, pickable) {
    this.props.ws.send('draft_options', 'mutate', { event: this.props.event_key, team: number, cost: cost, pickable: pickable });
    this.props.ws.send('draft_options', 'list', this.props.event_key)
  }

  render() {
    return (
      <div>
        <a className="button" onClick={this.refresh}> Refetch from TBA </a>
        <table>
          <thead>
            <tr>
              <th> Team Number </th>
              <th> Cost </th>
              <th> Pickable? </th>
              <th> Save </th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.teams.map((team) => {
                return <EventDraftRow number={team.team} cost={team.cost} pickable={team.pickable} save={this.save}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
}
class EventDraftOptionRow extends React.Component {
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
        <input type="number" min="0" max="200" value={ this.state.cost } onChange={(e) => this.setState({cost: e.target.value})} onKeyDown={(e) => { if (e.keyCode == 13) this.save(e) }}></input>
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

class EventDraftOptionList extends React.Component {
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
        <h3> Draft Configuration </h3>
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
                return <EventDraftOptionRow number={team.team} cost={team.cost} pickable={team.pickable} save={this.save}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
}

class EventAdminDraftList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { drafts: [] }

    this.onMessage = this.onMessage.bind(this)
    this.toggleHost = this.toggleHost.bind(this)

    props.ws.register('draft', this.onMessage)
    props.ws.send('draft', 'list', this.props.event_key)
  }

  onMessage(type, action, data) {
    if (action == "list") {
      this.setState({ drafts: JSON.parse(data) })
    }
  }

  delete(e, draft) {
    e.preventDefault()
    this.props.ws.send('draft', 'delete', { event: this.props.event_key, id: draft.id })
  }

  toggleHost(e, draft) {
    e.preventDefault()
    this.props.ws.send('draft', 'sethost', { event: this.props.event_key, id: draft.id, host: !draft.host })
  }

  render() {
    return (
      <div>
        <h3> Registered Draft Teams List </h3>
        <table>
          <thead>
            <tr>
              <th> Team Name </th>
              <th> Team Email </th>
              <th> Picks </th>
              <th> Delete? </th>
              <th> Mode </th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.drafts.map((draft) => {
                return <tr>
                  <td> {draft.team_name} </td>
                  <td> {draft.team_email} </td>
                  <td> {JSON.parse(draft.picks_json).join(", ")} </td>
                  <td> <a href="" className="red" onClick={(e) => { this.delete(e, draft) }}><i className="fas fa-times"></i></a> </td>
                  <td> <a href="" className="orange" onClick={(e) => { this.toggleHost(e, draft) }}>
                    <i className={ draft.host ? "fas fa-user" : "fas fa-microphone" }></i>
                    { draft.host ? "Make User" : "Make Host"}
                  </a></td>
                </tr>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
}

module.exports = {
  EventDraftOptionList: EventDraftOptionList,
  EventAdminDraftList: EventAdminDraftList
}
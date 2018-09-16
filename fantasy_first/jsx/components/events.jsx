class EventButton extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <a href="" className={this.props.enabled ? 'green' : 'red'} onClick={this.props.func}>
        {this.props.enabled ? this.props.enabled_text : this.props.disabled_text} &nbsp;
        <i className={'fas fa-exchange-alt'}></i>
      </a>
    )
  }
}

class AdminEventListView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { events: [] }

    this.onMessage = this.onMessage.bind(this)
    this.delete = this.delete.bind(this)

    props.ws.register('event', this.onMessage)
    props.ws.send('event', 'list', null)
  }

  onMessage(type, action, data) {
    if (action == "list") {
      this.setState({ events: JSON.parse(data) })
    }
  }

  toggleProperty(event, property, e) {
    e.preventDefault()
    event[property] = !event[property]
    this.props.ws.send('event', 'mutate', JSON.stringify(event))
  }

  delete(event, e) {
    e.preventDefault()
    this.props.ws.send('event', 'delete', event.key)
  }

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th> Event Key </th>
              <th> Event Name </th>
              <th> Drafting? </th>
              <th> Active? </th>
              <th> Live? </th>
              <th> Delete </th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.events.map((event) => {
                return <tr>
                  <td> {event.key} </td>
                  <td> <a href={"/admin/events/" + event.key}> {event.name} </a> </td>
                  <td>
                    <EventButton enabled={event.drafting} enabled_text="OPEN" disabled_text="closed" func={ (e) => {this.toggleProperty(event, "drafting", e)} } />
                  </td>
                  <td>
                    <EventButton enabled={event.active} enabled_text="ACTIVE" disabled_text="inactive" func={ (e) => {this.toggleProperty(event, "active", e)} } />
                  </td>
                  <td>
                    <EventButton enabled={event.live} enabled_text="LIVE" disabled_text="hidden" func={ (e) => {this.toggleProperty(event, "live", e)} } />
                  </td>
                  <td>
                  <a href="" className="red" onClick={ (e) => { this.delete(event, e) } }>
                    <i className={'fas fa-trash-alt'}></i>
                  </a>
                  </td>
                </tr>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
}

class AdminAddEventView extends React.Component {
  constructor(props) {
    super(props)

    this.addEvent = this.addEvent.bind(this)
  }

  addEvent(e) {
    e.preventDefault();
    this.props.ws.send("event", "add", this.state.event)
  }

  render() {
    return (
      <form>
        <input type="text" placeholder="Event ID (from The Blue Alliance)" name="tba_text" onChange={ (e) => { this.setState({ event: e.target.value }) } } />
        <a className="button" onClick={this.addEvent}> Add Event </a>
      </form>
    )
  }
}

module.exports = {
  AdminEventListView: AdminEventListView,
  AdminAddEventView: AdminAddEventView
}
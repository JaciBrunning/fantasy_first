import axios from 'axios'

export class DraftPicker extends React.Component {
  constructor(props) {
    super(props)
    this.state = { selected: [] }

    this.grouped = this.grouped.bind(this)
    this.remainingCost = this.remainingCost.bind(this)
    this.className = this.className.bind(this)
    this.selectable = this.selectable.bind(this)
    this.selected = this.selected.bind(this)

    this.submit = this.submit.bind(this)
  }

  grouped(arr, num) {
    var groups = [];
    var size = arr.length / num;
    for (var i = 0; i < arr.length; i += size) {
      groups.push(arr.slice(i, i + size))
    }
    return groups;
  }

  remainingCost(selected) {
    var remaining = 100;
    selected.forEach((v) => {
      remaining -= v.cost
    })
    return remaining
  }

  selectable(option) {
    return option.cost <= this.remainingCost(this.state.selected)
  }

  selected(option) {
    return this.state.selected.findIndex((a) => { return a.team === option.team })
  }

  className(option) {
    if (this.selected(option) != -1) {
      return "green bold"
    } else if (!this.selectable(option)) {
      return "gray italic"
    } else {
      return "orange"
    }
  }

  select(option, e) {
    var sel = this.selected(option)
    if (sel != -1) {
      this.state.selected.splice(sel, 1)
    } else if (this.selectable(option)) {
      this.state.selected.push(option)
    }
    this.setState({ selected: this.state.selected })
    e.preventDefault();
  }

  submit(e) {
    e.preventDefault();
    axios.post('/draft/' + this.props.event, {
        teams: this.state.selected.map((a) => { return a.team }),
        name: this.state.name,
        email: this.state.email
      }).then((response) => {
        console.log("Success!")
      }).catch((err) => {
        alert("Error! " + err.response.data)
      })
  }

  render() {
    return (
      <div className="row">
        <div className="column">
          <div className="row">
            <div className="column">
              <h3>Remaining: {this.remainingCost(this.state.selected)}₪</h3>
            </div>
          </div>
          <div className="row">
            {
              this.grouped(this.props.options, 4).map((arr) => {
                return <div className="column"> {
                  arr.map((option) => {
                    return <div className="row">
                      <a href="" className={this.className(option)} onClick={(e) => { this.select(option, e) }}> ({option.cost}₪) Team {option.team} </a>
                    </div>
                  })
                } </div>
              })
            }
          </div>
          <hr />
          <div className="row">
            <div className="column">
              Team Name: <input type="text" placeholder="Team Name" onChange={(e) => { this.setState({ name: e.target.value }) }}></input>
            </div>
            <div className="column">
              Team Email: <input type="text" placeholder="Team Email" onChange={(e) => { this.setState({ email: e.target.value }) }}></input>
            </div>
          </div>
          <div className="row">
            <div className="column">
              <a href="" className="button" onClick={this.submit}>Submit Draft!</a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
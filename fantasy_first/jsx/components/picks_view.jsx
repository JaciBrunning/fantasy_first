export class PicksView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { picks: [] }
    props.fetcher.mount((data) => this.setState({picks: data}))
  }

  render() {
    return (
      <table className="picks">
        <thead>
          <tr>
            <th> Team </th>
            <th> Picks </th>
          </tr>
        </thead>
        <tbody>
          {
            this.state.picks
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((team) => {
                return <tr>
                  <td> {team.name} </td>
                  <td> {
                    team.picks.join(", ")
                  } </td>
                </tr>
              })
          }
        </tbody>
      </table>
    )
  }
}
export class TeamsView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { points: {} }
    this.props.tracker.mount((pts) => this.setState({points: pts}))
  }

  render() {
    return (
      <table className="picks">
        <thead>
          <tr>
            <th> Team </th>
            <th> Points (Total) </th>
            <th> Wins (Qual + Elim) </th>
            <th> Ties (Qual only) </th>
            <th> Points (Draft) </th>
          </tr>
        </thead>
        <tbody>
          {
            Array.from(Object.entries(this.state.points))
              .sort((a, b) => { return b[1].total - a[1].total })
              .map((pair) => {
                return <tr>
                  <td> {pair[0]} </td>
                  <td> {pair[1].total} </td>
                  <td> {pair[1].q[0]} + {pair[1].e[0]} </td>
                  <td> {pair[1].q[1]} </td>
                  <td> {pair[1].d} </td>
                </tr>
              })
          }
        </tbody>
      </table>
    )
  }
}
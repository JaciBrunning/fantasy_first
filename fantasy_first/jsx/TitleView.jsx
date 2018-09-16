export class TitleView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { name: "...", year: "..." }
  }

  static renderDOM(id) {
    ReactDOM.render(<TitleView />, document.getElementById(id))
  }

  render() {
    return (
      <div>
          <h2> Fantasy FIRST - { this.state.year } { this.state.name } </h2>
          <h5> 
              Presented by FIRST Updates Now || Site by Jaci
          </h5>
      </div>
    )
  }
}
export class MultiTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = { selected: 0 }
  }

  render() {
    return (
      <div className="row">
        <div className="column">
          <div className="row">
            {
              this.props.options.map((option, idx) => {
                return <a className={
                  ("button " + (idx == this.state.selected ? "button-clear button-selected" : "button-outline"))
                } onClick={(e) => { this.setState({ selected: idx }); e.preventDefault() }}>
                  <i className={"fas fa-" + option.fa}> </i> &nbsp;
                                {option.name}
                </a>
              })
            }
          </div>
          <div className="row">
            {
              this.props.options.map((option, idx) => {
                return <div style={(idx == this.state.selected ? { width: "100%" } : { display: "none" })}>
                  {option.entry}
                </div>
              })
            }
          </div>
        </div>
      </div>
    )
  }
}
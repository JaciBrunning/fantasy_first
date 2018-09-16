import { DraftPicker } from './components/draft_picker.jsx'

ReactDOM.render(<DraftPicker options={TEAM_OPTIONS} event={EVENT_KEY} />, document.getElementById("draftSelector"))
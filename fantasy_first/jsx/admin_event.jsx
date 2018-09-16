import { Websocket } from './websocket.jsx';
import { EventDraftList } from './components/event_control.jsx'

let adminSocket = new Websocket("admin");
adminSocket.establish();

let content = <div>
  <EventDraftList ws={adminSocket} event_key={ EVENT_KEY } />
</div>

ReactDOM.render(content, document.getElementById("adminevent"));
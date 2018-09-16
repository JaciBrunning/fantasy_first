import { Websocket } from './websocket.jsx';
import { EventDraftOptionList, EventAdminDraftList } from './components/event_control.jsx'

let adminSocket = new Websocket("admin");
adminSocket.establish();

let content = <div>
  {
    EVENT_DRAFTING ? <EventAdminDraftList ws={adminSocket} event_key={EVENT_KEY} /> : <EventDraftOptionList ws={adminSocket} event_key={ EVENT_KEY } />
  }
  
</div>

ReactDOM.render(content, document.getElementById("adminevent"));
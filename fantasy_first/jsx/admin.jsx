import { Websocket } from './websocket.jsx';
import { AdminEventListView,AdminAddEventView } from './components/events.jsx'

let adminSocket = new Websocket("admin");
adminSocket.establish();

let eventListView = <AdminEventListView ws={adminSocket} />;
let addEventView = <AdminAddEventView ws={adminSocket} />;

let content = <div>
  <div className="row">
    <div className="column">
      { addEventView }
    </div>
  </div>
  <div className="row">
    <div className="column">
      { eventListView }
    </div>
  </div>
</div>

ReactDOM.render(content, document.getElementById("admin"));
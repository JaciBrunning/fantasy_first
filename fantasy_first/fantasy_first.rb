require 'pony'
require 'faye/websocket'
require 'webcore/websocket/driver'
require 'json'

require_relative 'constants.rb'
require_relative 'tba.rb'
require_relative 'db/events.rb'

class FantasyFirst < WebcoreApp()
  register CDNExtension
  register AuthExtension

  set :views, "#{File.dirname(__FILE__)}/views"
  services.register :admin_ws, Webcore::Websocket::Driver.new

  before do
    https!
  end

  get "/?" do
    @title = "Fantasy FIRST"
    erb :index
  end

  get "/admin" do
    auth_su!
    if !Faye::WebSocket.websocket?(env)
      @title = "Fantasy FIRST - Admin"
      erb :admin
    else
      ws = Faye::WebSocket.new(env, nil, ping: 15)
      services[:admin_ws].handle ws, request
      ws.rack_response
    end
  end

  get "/admin/events/:event" do |evt|
    auth_su!
    @event = FF::Events.event evt
    @title = "Fantasy FIRST - Admin (#{@event.name})"
    erb :admin_event
  end

  get "/logout/?" do
    redirect "/" unless auth?
    logout!
  end

  #### WEBSOCKET ####
  services[:admin_ws].listen :event do |type, action, data, sock|
    if action == :list
      sock.send(:event, :list, FF::Events.events.to_json)
    elsif action == :mutate
      FF::Events.update_event(JSON.parse(data))
      sock.send(:event, :list, FF::Events.events.to_json)
    elsif action == :add
      details = TBA.event_details(data)
      if TBA.exists?(details)
        FF::Events.create_event(details['key'], details['name'])
        sock.send(:event, :list, FF::Events.events.to_json)
      else
        sock.send(:ERR, :ERR, ["This event doesn't exist!"])
      end
    elsif action == :delete
      FF::Events.delete_event(data)
      sock.send(:event, :list, FF::Events.events.to_json)
    end
  end

  services[:admin_ws].listen :draft_options do |type, action, data, sock|
    if action == :list
      sock.send(:draft_options, :list, FF::Events.teams(data).to_json)
    elsif action == :refetch
      FF::Events.init_teams(data, TBA.event_teams(data))
      sock.send(:draft_options, :list, FF::Events.teams(data).to_json)
    elsif action == :mutate
      FF::Events.update_team(data)
      sock.send(:draft_options, :list, FF::Events.teams(data['event']).to_json)
    end
  end

  fantasy_css = FileResource.new :"fantasy.css", File.join(FantasyFirstConstants::CSS_DIR, "fantasy.min.css")
  fantasy_css.memcache = true
  services[:cdn].register fantasy_css

  ["admin", "admin_event"].each do |name|
    jsx = FileResource.new :"#{name}.js", File.join(FantasyFirstConstants::JS_DIR, "#{name}.js")
    jsx.memcache = true
    services[:cdn].register jsx
  end
end
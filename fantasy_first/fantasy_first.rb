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

  REFRESH_TIME = 60*3 # 3 Minutes

  thread = Thread.new do
    puts "[FANTASY] Starting Thread"
    while true
      update_events!
      sleep REFRESH_TIME 
    end
  end

  before do
    https!
  end

  get "/?" do
    @title = "Fantasy FIRST"
    @events = FF::Events.live
    erb :index
  end

  get "/event/:event/?" do |evt|
    begin
      @event = FF::Events.event evt
      redirect "/draft/#{evt}" if @event.drafting
      redirect "/" if !@event.live
      @title = "Fantasy FIRST - #{@event.name}"
      erb :event
    rescue => e
      redirect "/"
    end
  end

  get "/draft/:event/?" do |evt|
    begin
      @event = FF::Events.event evt
      @teams = FF::Events.teams_enabled evt
      redirect "/event/#{evt}" if !@event.drafting
      @title = "Fantasy FIRST - Draft for #{@event.name}"
      erb :event_draft
    rescue => e
      redirect "/"
    end
  end

  post "/draft/:event/?" do |evt|
    begin
      @event = FF::Events.event evt
      data = JSON.parse(request.body.read)
      FF::Events.submit_draft(evt, data)
    rescue => e
      [400, {}, "Unknown Error"]
    end
  end

  get "/history/:event/?" do |evt|
    @event = FF::Events.event evt
    return [400, {}, "Bad event key!"] if @event.nil?

    content_type "text/json"
    services[:memcache].cache("h/#{evt}", REFRESH_TIME / 2) do
      @event.history_json
    end
  end

  get "/alliance/:event/?" do |evt|
    @event = FF::Events.event evt
    return [400, {}, "Bad event key!"] if @event.nil?

    content_type "text/json"
    services[:memcache].cache("a/#{evt}", REFRESH_TIME / 2) do
      @event.alliance_json
    end
  end

  #### THREAD ####

  def self.update_events! 
    puts "[FANTASY] Triggering Update"
    FF::Events.with_transaction do
      FF::Events.active.each do |event|
        puts "[FANTASY]: Updating Event #{event.key}"
        begin
          event.history_json = JSON.generate(TBA.match_history(event.key))
          event.alliance_json = JSON.generate(TBA.alliance_points(event.key))
          event.save
        rescue => e
          puts "[FANTASY]: Uncaught: #{e}"
          puts e.backtrace
        end
      end
    end
  end

  #### ADMIN ####

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

  services[:admin_ws].listen :draft do |type, action, data, sock|
    if action == :list
      sock.send(:draft, :list, FF::Events.all_drafts(data).to_json)
    elsif action == :delete
      FF::Events.delete_draft(data['id'])
      sock.send(:draft, :list, FF::Events.all_drafts(data['event']).to_json)
    elsif action == :sethost
      FF::Events.set_draft_host(data)
      sock.send(:draft, :list, FF::Events.all_drafts(data['event']).to_json)
    end
  end

  fantasy_css = FileResource.new :"fantasy.css", File.join(FantasyFirstConstants::CSS_DIR, "fantasy.min.css")
  fantasy_css.memcache = true
  services[:cdn].register fantasy_css

  ["admin", "admin_event", "draft"].each do |name|
    jsx = FileResource.new :"#{name}.js", File.join(FantasyFirstConstants::JS_DIR, "#{name}.js")
    jsx.memcache = true
    services[:cdn].register jsx
  end
end
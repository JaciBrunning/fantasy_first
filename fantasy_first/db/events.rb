require 'webcore/db/db'

module FF
  class Events
    SCHEMA = Sequel[:fantasy_first]
    Sequel::Model.plugin :json_serializer

    class Event < Sequel::Model(Webcore::DB.db[SCHEMA[:events]])
      unrestrict_primary_key 
    end

    class EventDraftOptions < Sequel::Model(Webcore::DB.db[SCHEMA[:draft_options]])
      many_to_one :event
      unrestrict_primary_key
    end

    class EventDraftTeams < Sequel::Model(Webcore::DB.db[SCHEMA[:draft_teams]])
      many_to_one :event

      plugin :uuid, field: :id

      def validate
        super
        errors.add(:email, 'is not a valid email address') unless team_email =~ /\A([\w+\-].?)+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i
        errors.add(:email, 'is too long') if team_email.size > 90
        errors.add(:name, 'is too long') if team_name.size > 90
      end
    end

    class << self
      def event key
        Event.first(Sequel.ilike(:key, key))
      end

      def events
        Event.order(:key).all
      end

      def live
        Event.order(:key).where(live: true)
      end

      def active
        Event.order(:key).where(active: true)
      end

      def update_event opts
        ev = Event.first(Sequel.ilike(:key, opts['key']))
        ev.active = opts['active']
        ev.drafting = opts['drafting']
        ev.live = opts['live']
        ev.save
      end

      def create_event key, name
        Event.create(key: key, name: name)
      end

      def delete_event key
        Event.where { Sequel.ilike(:key, key) }.delete
      end

      def init_teams event, teams
        EventDraftOptions.db.transaction do 
          teams.each do |team|
            EventDraftOptions.find_or_create(event_key: event, team: team["team_number"].to_i)
          end
        end
      end

      def teams key
        EventDraftOptions.where(event_key: key).order(:team)
      end

      def teams_enabled key
        teams(key).where(pickable: true)
      end

      def update_team data
        edo = EventDraftOptions.first(event_key: data['event'], team: data['team'])
        edo.cost = [200, [0, data['cost'].to_i].max].min
        edo.pickable = data['pickable']
        edo.save
      end

      def submit_draft evt, data
        return [400, {}, "No Teams!"] if data["teams"].nil? || data["teams"].empty?
        begin
          allteams = teams(evt).all
          mapped = data["teams"].map { |x| allteams.select{ |t| t.team == x }.first }
          return [400, {}, "Not pickable!"] unless mapped.select(&:nil?).empty?
          return [400, {}, "Overcost!"] if mapped.map { |x| x.cost }.inject(:+) > 200
          EventDraftTeams.create(event_key: evt, team_name: data["name"], team_email: data["email"], picks_json: data["teams"].to_json)
          "Success"
        rescue Sequel::UniqueConstraintViolation => e
          [400, {}, "This team is already registered!"]
        rescue Sequel::ValidationFailed => e
          [400, {}, e.message]
        end
      end

      def all_drafts evt
        EventDraftTeams.where(event_key: evt)
      end

      def delete_draft id
        EventDraftTeams.where(id: id).delete
      end

      def set_draft_host data
        edt = EventDraftTeams.first(id: data['id'])
        edt.host = data['host']
        edt.save
      end

      def with_transaction
        Webcore::DB.db.transaction do
          yield
        end
      end
    end
  end
end
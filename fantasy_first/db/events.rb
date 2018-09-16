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

    class << self
      def event key
        Event.first(Sequel.ilike(:key, key))
      end

      def events
        Event.order(:key).all
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
        EventDraftOptions.where(event_key: key).order(:team).all
      end

      def update_team data
        edo = EventDraftOptions.first(event_key: data['event'], team: data['team'])
        edo.cost = [100, [0, data['cost'].to_i].max].min
        edo.pickable = data['pickable']
        edo.save
      end
    end
  end
end
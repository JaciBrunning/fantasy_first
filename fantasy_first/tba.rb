require 'json'
require 'open-uri'

class TBA
  class << self
    # The TBA devs are fine with me sharing this key. This is the default, you can override it with the
    # TBA_API_KEY environment variable.
    # This particular key may be killed at any time (or rate limited)
    DEFAULT_API_KEY = "19iOXH0VVxCvYQTlmIRpXyx2xoUQuZoWEPECGitvJcFxEY6itgqDP7A4awVL2CJn"

    def request path
      JSON.parse open("https://www.thebluealliance.com/api/v3/#{path}?X-TBA-Auth-Key=#{ENV['WEBCORE_TBA_KEY'] || DEFAULT_API_KEY}").read
    end

    def event_details event_key
      request("event/#{event_key}/simple")
    end

    def event_teams event_key
      request("event/#{event_key}/teams/simple")
    end

    def event_matches event_key
      request("event/#{event_key}/matches/simple")
    end

    def event_alliances event_key
      request("event/#{event_key}/teams/statuses")
    end

    def exists? event
      event["Errors"].nil?
    end

    def alliance_points event_key
      teams = event_alliances event_key
      points = {}

      teams.each do |team, status|
        unless status.nil? || status["alliance"].nil?
          alliance = status["alliance"]
          alliancenum = alliance["number"].to_i
          alliancepick = alliance["pick"].to_i 

          doa = [ alliancenum, alliancenum, 17 - alliancenum, 16 + alliancenum, 0 ][alliancepick]  # Serpentine
          if event_key.end_with? == "iri"
            doa = [ alliancenum, alliancenum, 8 + alliancenum, 25 - alliancenum, 0 ][alliancepick]
          end
          points[team] = [17 - doa, 0].max
        end
      end

      points
    end

    def match_history event_key
      matches = event_matches(event_key)
      
      history = []
      matches.sort_by{ |m| m['time'] }.each do |m|
        match_type = m["comp_level"] == "qm" ? :q : :e

        teams = []

        unless m["alliances"]["red"]["score"] == -1 # Not yet played
          ["red", "blue"].each do |alliance|
            r_key = -1
            if m["winning_alliance"] == alliance
              r_key = 0
            elsif m["winning_alliance"].empty?
              r_key = 1
            else
              r_key = 2
            end

            m["alliances"][alliance]["team_keys"].each do |team|
              teams << [team, r_key]
              # records[team] ||= {q: [0, 0, 0], e: [0, 0, 0]}   # W, T, L
              # records[team][match_type][r_key] += 1
            end
          end

          history << { 
            m: friendly_match_name(m),
            t: teams,
            p: match_type == :e
          }
        end
      end
      history
    end

    def friendly_match_name match
      name = match["comp_level"]
      case match["comp_level"]
      when "qm"
        name = "Qual"
      when "of"
        name = "Octo"
      when "qf"
        name = "Quarter"
      when "sf"
        name = "Semi"
      when "f"
        name = "Final"
      end
  
      if match["comp_level"] == "qm" || match["comp_level"] == "f"  # Finals doesn't have 'sets'
        return "#{name} #{match['match_number']}"
      else
        return "#{name} #{match['match_number']}-#{match['set_number']}"
      end
    end
  end
end
require 'json'
require 'open-uri'

class TBA
  class << self
    # The TBA devs are fine with me sharing this key. This is the default, you can override it with the
    # TBA_API_KEY environment variable.
    # This particular key may be killed at any time (or rate limited)
    DEFAULT_API_KEY = "19iOXH0VVxCvYQTlmIRpXyx2xoUQuZoWEPECGitvJcFxEY6itgqDP7A4awVL2CJn"

    def request path
      JSON.parse open("https://www.thebluealliance.com/api/v3/#{path}?X-TBA-Auth-Key=#{DEFAULT_API_KEY}").read
    end

    def event_details event_key
      request("event/#{event_key}/simple")
    end

    def event_teams event_key
      request("event/#{event_key}/teams/simple")
    end

    def exists? event
      event["Errors"].nil?
    end
  end
end
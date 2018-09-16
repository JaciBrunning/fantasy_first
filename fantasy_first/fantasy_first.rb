require 'pony'

require_relative 'constants.rb'

class FantasyFirst < WebcoreApp()
  register CDNExtension
  register AuthExtension

  set :views, "#{File.dirname(__FILE__)}/views"

  before do
    https!
  end

  get "/?" do
    @title = "Fantasy FIRST"
    erb :index
  end

  get "/admin" do
    auth_su!
    @title = "Fantasy FIRST - Admin"
    erb :admin
  end

  get "/logout/?" do
    redirect "/" unless auth?
    logout!
end

  fantasy_css = FileResource.new :"fantasy.css", File.join(FantasyFirstConstants::CSS_DIR, "fantasy.min.css")
  fantasy_css.memcache = true
  services[:cdn].register fantasy_css

  ["index"].each do |name|
    jsx = FileResource.new :"#{name}.js", File.join(FantasyFirstConstants::JS_DIR, "#{name}.js")
    jsx.memcache = true
    services[:cdn].register jsx
  end
end
configure! do |m|
  m.id = :fantasy_first
  m.host = /fantasy\.first\.*/
  m.module = 'fantasy_first.rb'
  m.gemfile = File.join(File.dirname(__FILE__), '../Gemfile')
end
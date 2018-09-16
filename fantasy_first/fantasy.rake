require 'fileutils'
require_relative 'constants.rb'

namespace :fantasy do
  desc "Build Fantasy FIRST"
  task :build => ["sass:build", "jsx:build"]

  namespace :jsx do
    desc "Build JSX"
    task :build do
      puts `cd #{FantasyFirstConstants::FANTASY_DIR}; npm run build`
    end
  end

  namespace :sass do
    desc "Build Sass"
    task :build do
      require 'sass'

      engine = Sass::Engine.for_file("#{FantasyFirstConstants::FANTASY_DIR}/css/sass/fantasy/fantasy.scss", { 
          style: :compressed,
      })
      FileUtils.mkdir_p "#{FantasyFirstConstants::CSS_DIR}"
      File.write("#{FantasyFirstConstants::CSS_DIR}/fantasy.min.css", engine.render)
    end
  end
end
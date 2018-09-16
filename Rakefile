require 'bundler/setup'
require 'fileutils'

Rake.add_rakelib 'fantasy_first'

task :build => ["fantasy:build"]

task :install => ["clean", "build", "db:migrate"]

namespace :db do
  desc "Run Migrations"
  task :migrate do
    require 'sequel'
    Sequel.extension :migration
    
    db = Sequel.connect(ENV["WEBCORE_DB_URL"] || 'postgres://web:web@localhost/web')
    Sequel::Migrator.run(db, "fantasy_first/db/migrations", table: :fantasyfirst_migrations)
  end
end
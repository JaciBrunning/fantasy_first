require 'bundler/setup'
require 'fileutils'

Rake.add_rakelib 'fantasy_first'

task :build => ["fantasy:build"]

task :install => ["clean", "build"]
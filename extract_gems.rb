lp = '/etc/www/webcore/loadpath'
if lp
  require 'fileutils'
  FileUtils.mkdir_p lp
  puts "Loading from #{lp}"
  `bundle show --paths`.split("\n").map { |x| File.join(x, "lib") }.each do |d|
    FileUtils.copy_entry(d, lp, false, true) if File.exist? d
  end
else
  puts "No loadpath!"
end
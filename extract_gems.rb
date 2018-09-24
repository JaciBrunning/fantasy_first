if ENV['WEBCORE_LOADPATH']
  require 'fileutils'
  FileUtils.mkdir_p ENV['WEBCORE_LOADPATH']
  `bundle show --paths`.split("\n").map { |x| File.join(x, "lib") }.each do |d|
    FileUtils.copy_entry(d, ENV['WEBCORE_LOADPATH'], false, true)
  end
end
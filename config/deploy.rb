set :application, 'imjac.in_ta'

set :repo_url, 'https://github.com/JacisNonsense/fantasy_first.git'
set :branch, 'master'

set :user, 'deploy'

namespace :deploy do
    desc "Run rake tasks"
    task :rake_install do
        on roles(:app) do
            within release_path do
                execute "rake", "install"
            end
        end
    end

    desc "Activate Module"
    task :activate do
        on roles(:app) do
            execute "mkdir -p /etc/www/webcore/modules"
            execute "ln -sfn #{release_path} /etc/www/webcore/modules/fantasy_first"
        end
    end

    after "bundler:install", "deploy:rake_install"
    after :deploy, "deploy:activate"
    after :deploy, "service:restart"
end

namespace :service do
    desc "Restart Webcore Service"
    task :restart do
        on roles(:app) do
            execute "sudo systemctl restart webcore.service"
        end
    end
    
    after :deploy, "service:restart"
end
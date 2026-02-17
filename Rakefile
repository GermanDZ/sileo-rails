# frozen_string_literal: true

require "bundler/gem_tasks"
require "rspec/core/rake_task"

RSpec::Core::RakeTask.new(:spec)

task default: :spec

namespace :release do
  desc "Run checks required before publishing the gem"
  task check: :spec do
    sh "gem build sileo-rails.gemspec"
  end
end

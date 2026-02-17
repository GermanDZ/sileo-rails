# frozen_string_literal: true

require_relative "lib/sileo/version"

Gem::Specification.new do |spec|
  spec.name = "sileo-rails"
  spec.version = Sileo::VERSION
  spec.authors = ["GermanDZ"]
  spec.email = ["german.delzotto@boopos.com"]

  spec.summary = "Beautiful toast notifications for Rails 8 using Stimulus and plain CSS"
  spec.description = <<~DESC
    Sileo Rails provides a dependency-light toast notification system for Rails 8.
    It ships with a Stimulus controller, plain CSS styles, server-side helper methods,
    and a JavaScript API for triggering notifications from anywhere in your app.
  DESC
  spec.homepage = "https://github.com/germandz/sileo-rails"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 3.2.0"

  spec.metadata["source_code_uri"] = spec.homepage
  spec.metadata["changelog_uri"] = "#{spec.homepage}/blob/main/CHANGELOG.md"

  gemspec = File.basename(__FILE__)
  git_files = IO.popen(%w[git ls-files -z], chdir: __dir__, err: IO::NULL) do |ls|
    ls.readlines("\x0", chomp: true)
  end

  fallback_files = Dir.glob("**/*", File::FNM_DOTMATCH, base: __dir__)
    .reject { |f| File.directory?(File.join(__dir__, f)) }
    .reject { |f| f.start_with?(".git/") }

  spec.files = (git_files.empty? ? fallback_files : git_files).reject do |f|
    (f == gemspec) ||
      f.end_with?(".gem") ||
      f.start_with?(*%w[bin/ Gemfile .gitignore .rspec spec/]) || f.start_with?("demo/")
  end

  spec.require_paths = ["lib"]

  spec.add_dependency "rails", ">= 8.0", "< 9.0"

  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rspec", "~> 3.0"
end

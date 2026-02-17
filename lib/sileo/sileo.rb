# frozen_string_literal: true

require_relative "version"
require_relative "configuration"
require_relative "helper"
require_relative "controller_methods"
require_relative "engine" if defined?(::Rails::Engine)

module Sileo
  class Error < StandardError; end

  class << self
    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration)
    end

    def reset_configuration!
      @configuration = Configuration.new
    end
  end
end

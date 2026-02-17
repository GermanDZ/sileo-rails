# frozen_string_literal: true

module Sileo
  class Configuration
    attr_accessor :default_position,
      :default_duration,
      :default_roundness,
      :default_offset,
      :enable_autopilot,
      :autopilot_expand_delay,
      :autopilot_collapse_delay

    def initialize
      @default_position = :top_right
      @default_duration = 6000
      @default_roundness = 18
      @default_offset = 16
      @enable_autopilot = true
      @autopilot_expand_delay = 150
      @autopilot_collapse_delay = 4000
    end
  end
end

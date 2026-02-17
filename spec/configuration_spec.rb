# frozen_string_literal: true

RSpec.describe Sileo::Configuration do
  it "has sensible defaults" do
    config = described_class.new

    expect(config.default_position).to eq(:top_right)
    expect(config.default_duration).to eq(6000)
    expect(config.default_roundness).to eq(18)
    expect(config.default_offset).to eq(16)
    expect(config.enable_autopilot).to eq(true)
    expect(config.autopilot_expand_delay).to eq(150)
    expect(config.autopilot_collapse_delay).to eq(4000)
  end

  it "supports global configuration and reset" do
    Sileo.configure do |config|
      config.default_position = :bottom_left
      config.default_duration = 3000
      config.enable_autopilot = false
    end

    expect(Sileo.configuration.default_position).to eq(:bottom_left)
    expect(Sileo.configuration.default_duration).to eq(3000)
    expect(Sileo.configuration.enable_autopilot).to eq(false)

    Sileo.reset_configuration!

    expect(Sileo.configuration.default_position).to eq(:top_right)
    expect(Sileo.configuration.default_duration).to eq(6000)
    expect(Sileo.configuration.enable_autopilot).to eq(true)
  end
end

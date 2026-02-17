# frozen_string_literal: true

RSpec.describe Sileo do
  it "has a version number" do
    expect(Sileo::VERSION).not_to be_nil
  end

  it "exposes configuration" do
    expect(described_class.configuration.default_position).to eq(:top_right)
  end
end

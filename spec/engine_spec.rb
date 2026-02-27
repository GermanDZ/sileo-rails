# frozen_string_literal: true

RSpec.describe "Engine integration files" do
  it "loads top-level require entrypoints" do
    expect { require "sileo-rails" }.not_to raise_error
    expect { require "sileo/rails" }.not_to raise_error
  end

  it "ships the engine file with expected initializers" do
    engine_file = File.expand_path("../lib/sileo/engine.rb", __dir__)
    content = File.read(engine_file)

    expect(content).to include('initializer "sileo.helpers"')
    expect(content).to include('initializer "sileo.assets"')
  end

  it "ships the stylesheet asset" do
    css_path = File.expand_path("../app/assets/stylesheets/sileo.css", __dir__)

    expect(File).to exist(css_path)
  end

  it "does not register the redundant app/assets parent path that causes Propshaft dedup collision" do
    engine_file = File.expand_path("../lib/sileo/engine.rb", __dir__)
    content = File.read(engine_file)

    expect(content).not_to include('root.join("app/assets")')
    expect(content).to include('root.join("app/assets/stylesheets")')
  end
end

# frozen_string_literal: true

require "action_view"

RSpec.describe Sileo::Helper do
  let(:host_class) do
    Class.new do
      include ActionView::Helpers::TagHelper
      include ActionView::Helpers::JavaScriptHelper
      include Sileo::Helper

      attr_reader :flash

      def initialize
        @flash = {}
      end
    end
  end

  subject(:helper_host) { host_class.new }

  before { Sileo.reset_configuration! }

  it "renders toaster markup with normalized data attributes" do
    helper_host.flash[:sileo_notifications] = [{ title: "Hello", state: "info" }]

    html = helper_host.sileo_toaster(position: :bottom_left, offset: { top: 10, left: 12 }, options: { duration: 5000 })

    expect(html).to include('data-controller="sileo--toaster"')
    expect(html).to include('data-sileo--toaster-position-value="bottom-left"')
    expect(html).to include('data-sileo--toaster-offset-value="{&quot;top&quot;:10,&quot;left&quot;:12}"')
    expect(html).to include('data-sileo--toaster-options-value="{&quot;duration&quot;:5000}"')
    expect(html).to include('data-sileo--toaster-initial-value="[{&quot;title&quot;:&quot;Hello&quot;,&quot;state&quot;:&quot;info&quot;}]"')
    expect(helper_host.flash[:sileo_notifications]).to eq([])
  end

  it "uses default offset when an invalid offset is given" do
    html = helper_host.sileo_toaster(offset: Object.new)

    expect(html).to include('data-sileo--toaster-offset-value="{&quot;all&quot;:16}"')
  end

  it "renders no script when there are no notifications" do
    helper_host.flash[:sileo_notifications] = []

    html = helper_host.sileo_render_notifications

    expect(html).to eq("")
    expect(helper_host.flash[:sileo_notifications]).to eq([])
  end

  it "renders a notification bootstrap script and clears flash" do
    helper_host.flash[:sileo_notifications] = [{ title: "Saved", state: "success" }]

    html = helper_host.sileo_render_notifications

    expect(html).to include("window.Sileo.show(notification)")
    expect(html).to include("sileo:ready")
    expect(html).to include("Saved")
    expect(helper_host.flash[:sileo_notifications]).to eq([])
  end
end

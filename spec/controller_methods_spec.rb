# frozen_string_literal: true

RSpec.describe Sileo::ControllerMethods do
  let(:controller_class) do
    Class.new do
      include Sileo::ControllerMethods

      attr_reader :flash

      def initialize
        @flash = {}
      end
    end
  end

  subject(:controller) { controller_class.new }

  before { Sileo.reset_configuration! }

  it "pushes a normalized notification with defaults" do
    controller.sileo_notify("Saved", type: :notice, description: "Done")

    expect(controller.flash[:sileo_notifications]).to contain_exactly(
      include(
        title: "Saved",
        state: "info",
        description: "Done",
        position: "top-right",
        duration: 6000,
        roundness: 18,
        autopilot: true,
        autopilotExpand: 150,
        autopilotCollapse: 4000
      )
    )
  end

  it "accepts snake_case and camelCase color options" do
    controller.sileo_notify("Title", type: :info, title_color: "#fff", iconColor: "#111")

    notification = controller.flash[:sileo_notifications].first
    expect(notification[:titleColor]).to eq("#fff")
    expect(notification[:iconColor]).to eq("#111")
  end

  it "supports convenience methods" do
    controller.sileo_success("OK")
    controller.sileo_error("No")
    controller.sileo_warning("Careful")
    controller.sileo_info("FYI")
    controller.sileo_action("Action")
    controller.sileo_loading("Loading")

    states = controller.flash[:sileo_notifications].map { |n| n[:state] }
    expect(states).to eq(%w[success error warning info action loading])
    expect(controller.flash[:sileo_notifications].last[:duration]).to be_nil
  end

  it "overrides defaults with explicit options" do
    controller.sileo_notify(
      "Custom",
      type: :alert,
      position: :bottom_center,
      duration: 1200,
      roundness: 8,
      autopilot: false,
      autopilot_expand: 10,
      autopilot_collapse: 20,
      icon: "!"
    )

    expect(controller.flash[:sileo_notifications]).to contain_exactly(
      include(
        state: "error",
        position: "bottom-center",
        duration: 1200,
        roundness: 8,
        autopilot: false,
        autopilotExpand: 10,
        autopilotCollapse: 20,
        icon: "!"
      )
    )
  end
end

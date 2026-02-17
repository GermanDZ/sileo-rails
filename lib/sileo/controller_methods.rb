# frozen_string_literal: true

require "active_support/concern"

module Sileo
  module ControllerMethods
    extend ActiveSupport::Concern

    def sileo_notify(title, type: :info, description: nil, **options)
      include_icon = options.key?(:icon)
      icon = options.delete(:icon) if include_icon
      include_duration = options.key?(:duration)
      duration = options.delete(:duration) if include_duration
      include_roundness = options.key?(:roundness)
      roundness = options.delete(:roundness) if include_roundness
      include_position = options.key?(:position)
      position = options.delete(:position) if include_position
      include_autopilot = options.key?(:autopilot)
      autopilot = options.delete(:autopilot) if include_autopilot
      include_autopilot_expand = options.key?(:autopilot_expand)
      autopilot_expand = options.delete(:autopilot_expand) if include_autopilot_expand
      include_autopilot_collapse = options.key?(:autopilot_collapse)
      autopilot_collapse = options.delete(:autopilot_collapse) if include_autopilot_collapse
      include_title_color = options.key?(:title_color) || options.key?(:titleColor)
      title_color = options.key?(:title_color) ? options.delete(:title_color) : options.delete(:titleColor)
      include_icon_color = options.key?(:icon_color) || options.key?(:iconColor)
      icon_color = options.key?(:icon_color) ? options.delete(:icon_color) : options.delete(:iconColor)

      notification = {
        title: title,
        state: normalize_sileo_state(type),
        description: description,
        position: normalize_sileo_position(include_position ? position : sileo_defaults.default_position),
        duration: include_duration ? duration : sileo_defaults.default_duration,
        roundness: include_roundness ? roundness : sileo_defaults.default_roundness,
        autopilot: include_autopilot ? autopilot : sileo_defaults.enable_autopilot,
        autopilotExpand: include_autopilot_expand ? autopilot_expand : sileo_defaults.autopilot_expand_delay,
        autopilotCollapse: include_autopilot_collapse ? autopilot_collapse : sileo_defaults.autopilot_collapse_delay,
        **options
      }
      notification[:icon] = icon if include_icon
      notification[:titleColor] = title_color if include_title_color
      notification[:iconColor] = icon_color if include_icon_color

      flash[:sileo_notifications] ||= []
      flash[:sileo_notifications] << notification
    end

    def sileo_success(title, **options)
      sileo_notify(title, type: :success, **options)
    end

    def sileo_error(title, **options)
      sileo_notify(title, type: :error, **options)
    end

    def sileo_warning(title, **options)
      sileo_notify(title, type: :warning, **options)
    end

    def sileo_info(title, **options)
      sileo_notify(title, type: :info, **options)
    end

    def sileo_action(title, **options)
      sileo_notify(title, type: :action, **options)
    end

    def sileo_loading(title, **options)
      sileo_notify(title, type: :loading, duration: nil, **options)
    end

    private

    def sileo_defaults
      Sileo.configuration
    end

    def normalize_sileo_state(state)
      return nil if state.nil?

      {
        success: "success",
        error: "error",
        warning: "warning",
        info: "info",
        action: "action",
        loading: "loading",
        notice: "info",
        alert: "error"
      }.fetch(state.to_sym, state.to_s)
    end

    def normalize_sileo_position(position)
      position.to_s.tr("_", "-")
    end
  end
end

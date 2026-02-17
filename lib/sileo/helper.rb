# frozen_string_literal: true

require "json"

module Sileo
  module Helper
    def sileo_toaster(position: nil, offset: nil, options: {}, **data_options)
      config = Sileo.configuration
      resolved_position = normalize_sileo_position(position || config.default_position)
      resolved_offset = normalize_sileo_offset(offset || config.default_offset)
      initial_toasts = Array(flash[:sileo_notifications])

      flash[:sileo_notifications] = []

      content_tag(
        :div,
        nil,
        data: {
          controller: "sileo--toaster",
          "sileo--toaster-position-value": resolved_position,
          "sileo--toaster-offset-value": JSON.generate(resolved_offset),
          "sileo--toaster-initial-value": JSON.generate(initial_toasts),
          "sileo--toaster-options-value": JSON.generate(options),
          **data_options.transform_keys { |key| "sileo--toaster-#{key.to_s.tr('_', '-')}" }
        },
        aria: { live: "polite", atomic: "true" }
      )
    end

    def sileo_render_notifications(notifications = nil)
      notifications = Array(notifications || flash[:sileo_notifications])
      flash[:sileo_notifications] = []
      return "".html_safe if notifications.empty?

      javascript_tag do
        <<~JS
          (function() {
            var notifications = #{JSON.generate(notifications)};
            if (!window.Sileo) {
              window.addEventListener("sileo:ready", function() {
                notifications.forEach(function(notification) { window.Sileo.show(notification); });
              }, { once: true });
              return;
            }
            notifications.forEach(function(notification) { window.Sileo.show(notification); });
          })();
        JS
      end
    end

    private

    def normalize_sileo_position(position)
      position.to_s.tr("_", "-")
    end

    def normalize_sileo_offset(offset)
      case offset
      when Numeric, String
        { all: offset }
      when Hash
        offset.slice(:all, :top, :right, :bottom, :left).transform_keys(&:to_s)
      else
        { all: 16 }
      end
    end
  end
end

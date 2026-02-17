# frozen_string_literal: true

module Sileo
  class Engine < ::Rails::Engine
    isolate_namespace Sileo

    initializer "sileo.helpers" do
      ActiveSupport.on_load(:action_controller_base) do
        include Sileo::ControllerMethods
        helper Sileo::Helper
      end

      ActiveSupport.on_load(:action_view) do
        include Sileo::Helper
      end
    end

    initializer "sileo.assets", before: "propshaft.append_assets_path" do |app|
      if app.config.respond_to?(:assets)
        app.config.assets.paths << root.join("app/assets")
        app.config.assets.paths << root.join("app/assets/stylesheets")
        app.config.assets.paths << root.join("app/javascript")
        app.config.assets.paths.uniq!

        if app.config.assets.respond_to?(:precompile)
          app.config.assets.precompile += %w[sileo.css]
        end
      end
    end
  end
end

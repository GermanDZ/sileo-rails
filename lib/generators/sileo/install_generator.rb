# frozen_string_literal: true

module Sileo
  module Generators
    class InstallGenerator < ::Rails::Generators::Base
      source_root File.expand_path("install/templates", __dir__)

      class_option :skip_initializer, type: :boolean, default: false, desc: "Skip generating config/initializers/sileo.rb"

      def ensure_importmap_pins
        return unless File.exist?("config/importmap.rb")
        importmap = File.read("config/importmap.rb")
        return if importmap.include?("pin \"sileo\"")

        append_to_file "config/importmap.rb" do
          <<~RUBY

            # Sileo Rails
            pin "sileo", to: "sileo/index.js"
            pin "sileo/install", to: "sileo/install.js"
            pin "sileo/store", to: "sileo/store.js"
            pin "sileo/controllers", to: "sileo/controllers/index.js"
            pin "sileo/controllers/toaster_controller", to: "sileo/controllers/toaster_controller.js"
          RUBY
        end
      end

      def include_stylesheet
        if File.exist?("app/assets/stylesheets/application.css")
          css = File.read("app/assets/stylesheets/application.css")
          return if css.include?("sileo.css")
          append_to_file "app/assets/stylesheets/application.css", "\n@import \"sileo.css\";\n"
        elsif File.exist?("app/assets/stylesheets/application.scss")
          scss = File.read("app/assets/stylesheets/application.scss")
          return if scss.include?("@import 'sileo'")
          append_to_file "app/assets/stylesheets/application.scss", "\n@import 'sileo';\n"
        else
          create_file "app/assets/stylesheets/sileo_import.css", "@import \"sileo.css\";\n"
        end
      end

      def add_javascript_bootstrap
        if File.exist?("app/javascript/controllers/application.js")
          bootstrap = File.read("app/javascript/controllers/application.js")
          unless bootstrap.include?("registerSileoControllers")
            append_to_file "app/javascript/controllers/application.js" do
              <<~JS

                import { registerSileoControllers } from "sileo/controllers"
                registerSileoControllers(application)
              JS
            end
          end
        end

        return unless File.exist?("app/javascript/application.js")
        app_js = File.read("app/javascript/application.js")
        return if app_js.include?("import \"sileo\"")

        append_to_file "app/javascript/application.js" do
          <<~JS

            import "sileo"
          JS
        end
      end

      def create_toaster_partial
        copy_file "_sileo_toaster.html.erb", "app/views/application/_sileo_toaster.html.erb"
      end

      def create_initializer
        return if options[:skip_initializer]

        copy_file "sileo.rb", "config/initializers/sileo.rb"
      end

      def print_next_steps
        say "\nSileo Rails installed.", :green
        say "Add <%= render 'application/sileo_toaster' %> to your application layout.", :yellow
      end
    end
  end
end

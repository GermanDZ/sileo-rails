# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

# Sileo toast notifications
pin "sileo", to: "sileo/index.js"
pin "sileo/install", to: "sileo/install.js"
pin "sileo/store", to: "sileo/store.js"
pin "sileo/controllers", to: "sileo/controllers/index.js"
pin "sileo/controllers/toaster_controller", to: "sileo/controllers/toaster_controller.js"

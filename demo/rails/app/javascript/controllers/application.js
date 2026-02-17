import { Application } from "@hotwired/stimulus"
import { registerSileoControllers } from "sileo/controllers"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

registerSileoControllers(application)

export { application }

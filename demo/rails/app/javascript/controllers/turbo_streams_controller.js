import { Controller } from "@hotwired/stimulus"

// Extends Turbo Streams with custom actions
export default class extends Controller {
  connect() {
    // Register custom Turbo Stream action for notifications
    if (!Turbo.StreamActions.notification) {
      Turbo.StreamActions.notification = function() {
        const data = JSON.parse(this.getAttribute("data"));
        if (window.Sileo) {
          window.Sileo.show(data);
        }
      }
    }
  }
}

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    title: String,
    state: String,
    description: String
  }

  connect() {
    if (window.Sileo) {
      window.Sileo.show({
        title: this.titleValue,
        state: this.stateValue,
        description: this.descriptionValue
      });
    }

    // Remove the element after triggering
    this.element.remove();
  }
}

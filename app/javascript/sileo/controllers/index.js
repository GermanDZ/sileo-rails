import ToasterController from "sileo/controllers/toaster_controller";

export function registerSileoControllers(application) {
  application.register("sileo--toaster", ToasterController);
}

export { ToasterController };

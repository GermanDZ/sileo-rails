class PagesController < ApplicationController
  def home
    flash.now[:sileo_notifications] = [{
      title: "Hello, today is #{Date.today.strftime('%B %d, %Y')}",
      state: "info",
      description: "This notification was generated on the server!"
    }]
  end

  def test_notification
    respond_to do |format|
      format.html do
        # Add notification to flash manually
        flash[:sileo_notifications] ||= []
        flash[:sileo_notifications] << {
          title: "Server notification!",
          state: "success",
          description: "This was triggered from Ruby!"
        }
        redirect_to root_path
      end
      format.turbo_stream do
        # Use a meta tag to trigger notification
        render turbo_stream: [
          turbo_stream.replace("sileo-notification-trigger",
            '<meta id="sileo-notification-trigger"
                   data-controller="sileo-trigger"
                   data-sileo-trigger-title-value="Server notification!"
                   data-sileo-trigger-state-value="success"
                   data-sileo-trigger-description-value="This was triggered from Ruby!" />')
        ]
      end
    end
  end
end

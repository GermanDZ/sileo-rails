# Sileo Rails

Beautiful toast notifications for Ruby on Rails 8 using Stimulus and plain CSS.

Sileo Rails is inspired by and adapts ideas from the original project by Aryan:
[hiaaryan/sileo](https://github.com/hiaaryan/sileo).

## Features

- Rails 8 engine with helper + controller methods
- Stimulus toaster controller
- Global JavaScript API (`window.Sileo`)
- API parity with Sileo docs: `show`, typed states, `promise`, `dismiss`, `clear`
- Toast options: `position`, `duration`, `fill`, `roundness`, `autopilot`, `styles`, `icon`, `button`
- `show()` generic toast mode (no state badge by default)
- No animation libraries and no frontend framework dependency
- Works from server-side and JavaScript

## Requirements

- Ruby `>= 3.2`
- Rails `>= 8.0`
- Propshaft + Importmap setup (default in new Rails 8 apps)

## Installation

Add the gem to your app:

```ruby
# Gemfile
gem "sileo-rails"
```

Install dependencies and run the installer:

```bash
bundle install
bin/rails g sileo:install
```

The installer does the following:

- Adds importmap pins for Sileo JS modules
- Imports Sileo in `app/javascript/application.js`
- Registers the Sileo Stimulus controller in `app/javascript/controllers/application.js`
- Creates `config/initializers/sileo.rb` (unless skipped)
- Adds `app/views/application/_sileo_toaster.html.erb`

In your layout (`app/views/layouts/application.html.erb`), render the toaster:

```erb
<body>
  <%= render "application/sileo_toaster" %>
  <%= yield %>
</body>
```

If you prefer linking CSS manually in the layout with Propshaft, use:

```erb
<%= stylesheet_link_tag "sileo", "data-turbo-track": "reload" %>
```

## Quick Start In Any Rails Project

1. Add `gem "sileo-rails"` to the app `Gemfile`
2. Run `bundle install`
3. Run `bin/rails g sileo:install`
4. Add `<%= render "application/sileo_toaster" %>` to the application layout body
5. Restart the Rails server
6. Trigger a toast from a controller or browser console

Controller example:

```ruby
class PostsController < ApplicationController
  def create
    if Post.create(post_params)
      sileo_success "Post created"
      redirect_to posts_path
    else
      sileo_error "Could not create post", description: "Please review the form"
      render :new, status: :unprocessable_entity
    end
  end
end
```

JavaScript example:

```js
window.Sileo.success("Saved")
window.Sileo.error({ title: "Error", description: "Try again" })
```

## Usage

### Server-side helper

```erb
<%= sileo_toaster position: :top_right, offset: 16 %>
```

With default options for all toasts in this toaster:

```erb
<%= sileo_toaster(
  position: :bottom_right,
  options: {
    duration: 7000,
    roundness: 20,
    autopilot: { expand: 120, collapse: 4500 }
  }
) %>
```

### JavaScript API

```js
window.Sileo.success("Saved")
window.Sileo.error({ title: "Error", description: "Try again" })
window.Sileo.show({ title: "Generic message", description: "No default state icon" })

window.Sileo.promise(fetch("/health"), {
  loading: { title: "Checking..." },
  success: { title: "Service is up" },
  action: (response) => ({ title: "Service is up", button: { title: "Open", action: "open_service" } }),
  error: { title: "Service unavailable" }
})
```

### Events API

```js
window.dispatchEvent(new CustomEvent("sileo:show", {
  detail: { title: "Event based toast", state: "info" }
}))
```

## Options

- `title` (`String`)
- `description` (`String`)
- `state` (`success`, `error`, `warning`, `info`, `loading`, `action`)
- `position` (`top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`)
- `duration` (`Integer` ms or `null`)
- `fill` (`String` color)
- `titleColor` (`String` color for title text)
- `iconColor` (`String` color for icon)
- `roundness` (`Integer` px)
- `button` (`{ title: String, action: String }`)
- `autopilot` (`Boolean` or `{ expand: Integer, collapse: Integer }`)

Ruby controller options also accept `title_color:` and `icon_color:`.

## Configuration

Create or edit `config/initializers/sileo.rb`:

```ruby
Sileo.configure do |config|
  config.default_position = :top_right
  config.default_duration = 6000
  config.default_roundness = 18
  config.default_offset = 16
  config.enable_autopilot = true
  config.autopilot_expand_delay = 150
  config.autopilot_collapse_delay = 4000
end
```

## Demo App

A full Rails demo app is included in this repository under `demo/rails`.

```bash
cd demo/rails
bundle install
bin/rails db:prepare
bin/dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

For additional troubleshooting and environment notes, see:
`demo/rails/README.md`.

## Development

```bash
bundle install
bundle exec rspec
```

For full contributor and release workflow details, see:
`DEVELOPMENT.md`.

## Contributing

1. Create a branch from `main`
2. Add or update specs for behavior changes
3. Run `bundle exec rspec`
4. Update docs/changelog when user-facing behavior changes
5. Open a pull request describing the change and verification steps

Please keep pull requests focused and include reproducible steps for bug fixes.

## License

This project is licensed under the MIT License. See `LICENSE.txt`.

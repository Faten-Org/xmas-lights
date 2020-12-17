# xmas-lights

Winterfest 2020 GitHub Actions demo.


## Self-hosted runners

This repository requires tow self-hosted runners to satisfy the required workflows;

* Raspberry Pi ARM hosted runner with Adafruit RGB LED Matrix attached
* Linux x64 hosted runner for interacting with Hue Bridge


### Rasberry Pi Runner

The Raspberry Pi runner needs to have direct access to the GPIO pins so that it can interact with the attached RGB LED Matrix. This runner needs to have the drivers and supporting libraries installed into the OS:

* [Raspberry Pi LED Matrix](https://github.com/hzeller/rpi-rgb-led-matrix)


## Software

### text
The [`text`](./text) directory is a simple Python application with a [`run.py`](./text/run.py) entry point that will display a scrolling text message on the RGB LED Matrix.

Application parameters:

* `--text` The text to display
* `--led-cols` The number of columns that the RGB Matrix supports
* `--led-rows` The number of columns that the RGB Matrix supports

The [GitHub Actions Workflow](.github/workflows/winterfest_welcome.yml) utilizes this application to display a Winterfest Welcome message.

### images
The [`images`](./images) directory is a simple Python application with a [`run.py`](./images/run.py) entry point.

Application parameters:

* `image` The image to display on the RGB LED Matrix

The [GitHub Actions Workflow](.github/workflows/winterfest_logo.yml) utilizes this application to a Winterfest image in the repo.


### hue-lights-action
The [`hue-lights-action`](./hue-lights-action) is a GitHub Action for interacting with Hue lights. This action uses the [node-hue-api](https://github.com/peter-murray/node-hue-api) library to interact with a hue bridge on a local network where the action is running.

The action will connect to a Hue bridge, obtain the lights in the bridge that match the provided names and then start a randomized Xmas light show for the spcified time.

The action has the following parameters:

* `bridge`: The IP address or hostname of the Hue bridge
* `username`: The username for the bridge
* `light_names`: A comma separated list of light names on the bridge
* `time_in_seconds`: The time in seconds to run the light show for

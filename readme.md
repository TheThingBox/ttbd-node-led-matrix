
Contains the Node-RED nodes used in TimeSquAir to use the LEDMatrix library.

These nodes can be installed on top of the ThingBox but with additional advanced installs as described in the hzeller page.

__TimeSquair__ ([http://TimeSquAir.io](http://TimeSquAir.io)) is an educational device built on top of __the Thingbox__  ([http://thethingbox.io](http://thethingbox.io)) that contains a LEDMatrix and a tag reader.

The __LEDMatrix lib__ is the software that allows the use of the matrix:

[http://www.raspberrypi-spy.co.uk/2014/09/32x32-led-matrix-on-the-raspberry-pi/](http://www.raspberrypi-spy.co.uk/2014/09/32x32-led-matrix-on-the-raspberry-pi/)

[https://github.com/hzeller/rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix)

This page is only destinated to advanced users.

# Use

Build a flow by wiring:

- a LEDBlank node at first
- add pictures by wiring LEDPicture nodes
- add texts by wiring LEDText nodes
- end with the LEDMatric node to display the concatened result.

Fill the support form on the [http://theThingbox.io](http://theThingbox.io) web page.

#!/usr/bin/env python
# Display a runtext with double-buffering.
from samplebase import SampleBase
from rgbmatrix import graphics
import time


class RunText(SampleBase):
    def __init__(self, *args, **kwargs):
        super(RunText, self).__init__(*args, **kwargs)
        self.parser.add_argument("-t", "--text", help="The text to scroll on the RGB LED panel", default="Welcome to GitHub Winterfest 2020!")

    def run(self):
        offscreen_canvas = self.matrix.CreateFrameCanvas()
        font = graphics.Font()
        font.LoadFont("./fonts/knxt.bdf")
        textColor = graphics.Color(255, 255, 0)
        pos = offscreen_canvas.width
        my_text = self.args.text

        # Run for 20 seconds
        end_time = time.time() + 20
        while time.time() < end_time:
            offscreen_canvas.Clear()
            len = graphics.DrawText(offscreen_canvas, font, pos, 40, textColor, my_text)
            pos -= 1
            if (pos + len < 0):
                pos = offscreen_canvas.width

            time.sleep(0.02)
            offscreen_canvas = self.matrix.SwapOnVSync(offscreen_canvas)


# Main function
if __name__ == "__main__":
    run_text = RunText()
    
    if (not run_text.process()):
        run_text.print_help()

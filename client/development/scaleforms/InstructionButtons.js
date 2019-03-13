class InstructionButtons {
    constructor() {
        this.handle = mp.game.graphics.requestScaleformMovie("instructional_buttons");
        this.ScIndex = 0;
        while (!mp.game.graphics.hasScaleformMovieLoaded(this.handle)) mp.game.wait(0);
    }
    InitButtons(x,y,z) {
        this.ScIndex = 0;
        mp.game.graphics.drawScaleformMovieFullscreen(this.handle, 255, 255, 255, 0, false);
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "CLEAR_ALL");
        mp.game.graphics.popScaleformMovieFunctionVoid();
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_CLEAR_SPACE");
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(200);
        mp.game.graphics.popScaleformMovieFunctionVoid();
    }
    AddButton(text, button) {
        if (typeof button == "number") {
            mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_DATA_SLOT");
            mp.game.graphics.pushScaleformMovieFunctionParameterInt(this.ScIndex);
            mp.game.graphics.pushScaleformMovieFunctionParameterInt(button);
            mp.game.graphics.pushScaleformMovieFunctionParameterString(text);
            mp.game.graphics.popScaleformMovieFunctionVoid();
            this.ScIndex++;
        } else {
            mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_DATA_SLOT");
            mp.game.graphics.pushScaleformMovieFunctionParameterInt(this.ScIndex);
            mp.game.graphics.pushScaleformMovieFunctionParameterString(button);
            mp.game.graphics.pushScaleformMovieFunctionParameterString(text);
            mp.game.graphics.popScaleformMovieFunctionVoid();
            this.ScIndex++;
        }
    }
    finalizeButtons(type = 1,r,g,b,a) {
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "DRAW_INSTRUCTIONAL_BUTTONS");
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(type);
        mp.game.graphics.popScaleformMovieFunctionVoid();
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_BACKGROUND_COLOUR");
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(r);
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(g);
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(b);
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(a);
        mp.game.graphics.popScaleformMovieFunctionVoid();
    }
}
module.exports = new InstructionButtons();
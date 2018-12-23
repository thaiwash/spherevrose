
class TextEditor extends CanvasObject {
    constructor() {
        super()
        var self = this
        this.chars = []
        this.mouseDown = false

        this.bgColor = '#282c34'
        this.textColor = '#f00'
        this.selectColor = '#ffffff'
        this.tildeColor = '#0000ff'
        this.textPlacement =  [10, 10]

        this.textHeight = 12
        this.ctx.font = this.textHeight+"pt Courier"
        this.tildeBlink = false
        this.selected = []
        this.from = 0
        this.to = 0
        this.tildeAt = 0
        this.controllerWrapper()

        this.dimensions =  [800, 600]
    }

    point(uv, rightOrleft) {
        var self = textEditor
    	if (typeof uv == "undefined") {
    		console.warn("uv is undefined")
    		return
    	}
    	if (typeof self.canvas == "undefined") {
    		console.warn("canvas is undefined")
    		return
    	}

        self.pointing = true
        clearTimeout(self.timer)
        self.timer = setTimeout(function() {
            self.pointing = false
        }, 1000)

    	uv.y = Math.abs(uv.y - 1)
    	// release all held buttons
    	self.canvasMouse[rightOrleft] = [
            self.canvas.width * uv.x, self.canvas.height * uv.y
        ]
    	self.mouseMove(self.canvasMouse[rightOrleft], rightOrleft)
    }

    spawnEditor() {

        this.editor = this.createObject(
            this.createObject(controller.controllerSphere[0].position)
        )
    	this.editor.name = "textEditor"
        this.editor.point = this.point
        this.created = true
        //console.log(this.keyboardImage.width / this.keyboardImage.height)
        this.editor.scale.y = 1 / (this.dimensions[0] / this.dimensions[1])
        this.drawText("text on line1\ntext on line2")
    }

    drawText(text) {
        this.chars = []
        this.ctx.fillStyle = this.bgColor
        this.ctx.fillRect(0,0,(800),(600))
    }


    controllerWrapper() {
        var self = this
        window.addEventListener('buttonpressed', function (e) {
            if (e.detail.button == "B") {
                if (controller.buttonPressed["R_TRIGGER"]) {
                    self.spawnEditor(controller.controllerSphere[0].position)
                }
            }

            if (!self.pointing) {
                return
            }

            if (e.detail.button == "A") {
                self.mouseDown(self.canvasMouse[0], 0)
            }

            if (e.detail.button == "X") {
                self.mouseDown(self.canvasMouse[1], 1)
            }
        })

        window.addEventListener('buttonreleased', function (e) {
            if (!self.pointing) {
                return
            }


            if (e.detail.button == "R_TRIGGER") {
                self.keyUp("AltGr")
            }

            if (e.detail.button == "L_TRIGGER") {
                self.keyUp("Shift")
            }

            if (e.detail.button == "A") {
                self.mouseUp(e.detail.button, 0)
            }

            if (e.detail.button == "X") {
                self.mouseUp(e.detail.button, 1)
            }
        })
    }

    // todo, optimize performance, so that you dont redraw every second
    // todo fix graphical bug
    mouseMove(crd, rightOrLeft) {
        var self = this
        console.log(crd)
    }
}

/*

class TextEditor {
    constructor() {
        var self = this
        this.chars = []
        this.mouseDown = false
        var canvas = document.getElementById("canvas")
        canvas.onmousedown = function(evt){
            console.log(evt)
            self.mousedown(evt.clientX, evt.clientY)
        }
        canvas.onmousemove = function(evt){
            self.mousemove(evt.clientX, evt.clientY)
        }
        canvas.onmouseup = function(evt){
            self.mouseup(evt.clientX, evt.clientY)
        }

        canvas.onkeydown = function(evt){
            console.log(evt)
        }


        document.addEventListener('keydown', function(event) {
            self.keypress(event.key)
        })

        this.ctx = canvas.getContext('2d')
        //var image = new Image();
        //image.src = "img/w00t.png";
        //image.onload = handleImageLoad;
        var base_image = new Image()
        //base_image.src = '/img/w00t.png';
        this.ctx.drawImage(base_image, 0, 0)

        this.bgColor = '#282c34'
        this.textColor = '#f00'
        this.selectColor = '#ffffff'
        this.tildeColor = '#0000ff'
        this.textPlacement =  [10, 10]

        this.textHeight = 12
        this.ctx.font = this.textHeight+"pt Courier"
        this.drawText("text on line1\ntext on line2")
        this.tildeBlink = false
        this.selected = []
        this.from = 0
        this.to = 0
        this.tildeAt = 0
    }

    drawText(text) {
        this.chars = []
        this.ctx.fillStyle = this.bgColor
        this.ctx.fillRect(0,0,(800),(600))

        var x = this.textPlacement[0]
        var y = this.textPlacement[1] + this.textHeight
        var col = 1
        var row = 1
        this.ctx.fillStyle = '#f00'
        var backgroundHeight = this.textHeight +
            Math.round(this.textHeight/2)
        for (var i = 0; i < text.length; i ++) {
            console.log(text.charAt(i))
            if (text.charAt(i) == "\n") {
                x = this.textPlacement[0]
                y += backgroundHeight

                this.chars.push({
                    "char": text.charAt(i),
                    "col": col,
                    "row": row
                })
                row ++
                col = 1
                continue
            }

            this.ctx.fillText(
                text.charAt(i),
                x,
                y + Math.round(this.textHeight/4)
            )
            //this.ctx.fillText(text.charAt(i), 10, 100)
            x += this.ctx.measureText(text.charAt(i)).width

            this.chars.push({
                "char": text.charAt(i),
                "x": x - this.ctx.measureText(text.charAt(i)).width,
                "y": y - this.textHeight,
                "w": this.ctx.measureText(text.charAt(i)).width,
                "h": backgroundHeight,
                "col": col,
                "row": row
            })
            col ++
        }


        this.text = text
    }

    select(from, to) {
        this.selected = []
        var backgroundHeight = this.textHeight +
            Math.round(this.textHeight/4)
        for (var i = 0; i < this.chars.length; i++) {
            if (i >= from && i <= to || i >= to && i <= from) {
                this.ctx.globalAlpha=1
                this.ctx.fillStyle = this.bgColor
                this.ctx.fillRect(
                    this.chars[i].x,
                    this.chars[i].y,
                    this.chars[i].w,
                    this.chars[i].h
                )
                this.ctx.globalAlpha=0.1
                this.ctx.fillStyle = this.selectColor
                this.ctx.fillRect(
                    this.chars[i].x,
                    this.chars[i].y,
                    this.chars[i].w,
                    this.chars[i].h
                )
                this.ctx.globalAlpha=1
                this.ctx.fillStyle = this.textColor
                this.ctx.fillText(
                    this.chars[i].char,
                    this.chars[i].x,
                    this.chars[i].y + backgroundHeight
                )
                this.selected.push(i)
            } else {
                this.normalize(i)
            }
        }
    }

    normalizeArray(arr) {
        for (var i = 0; i < arr.length; i ++){
            this.normalize(arr[i])
        }
    }

    normalize(i){
        var backgroundHeight = this.textHeight +
            Math.round(this.textHeight/4)
        this.ctx.globalAlpha=1
        this.ctx.fillStyle = this.bgColor
        this.ctx.fillRect(
            this.chars[i].x,
            this.chars[i].y,
            this.chars[i].w,
            this.chars[i].h
        )
        this.ctx.fillStyle = this.textColor
        this.ctx.fillText(
            this.chars[i].char,
            this.chars[i].x,
            this.chars[i].y + backgroundHeight
        )
    }

    mouseAction(x, y) {
        for (var i = 0; i < this.chars.length; i++) {
            if (this.within(
                [x, y],
                [this.chars[i].x, this.chars[i].y],
                [this.chars[i].w, this.chars[i].h]
            )) {
                return i
            }
        }
    }

    mousedown(x, y) {
        this.from = this.mouseAction(x, y)
        this.to = this.mouseAction(x, y)
        //this.select(this.from, this.to)
        this.tilde(this.mouseAction(x, y))
        this.mouseDown = true
    }

    mousemove(x, y) {
        if (this.mouseDown) {
            this.to = this.mouseAction(x, y)
            this.select(this.from, this.to)
            this.stopTilde()
        }
    }

    mouseup(x, y) {
        this.mouseDown = false
    }

    tilde(i) {
        if (typeof i === "undefined") {
            return
        }
        this.normalize(this.tildeAt)
        this.normalizeArray(this.selected)
        //this.normalize(this.tildeAt+1)
        var lineWidth = 2
        this.ctx.strokeStyle = this.tildeColor
        this.ctx.lineWidth = lineWidth
        this.ctx.beginPath()
        this.ctx.moveTo(
            this.chars[i].x - lineWidth + this.chars[i].w,
            this.chars[i].y
        )
        this.ctx.lineTo(
            this.chars[i].x - lineWidth + this.chars[i].w,
            this.chars[i].y + this.chars[i].h
        )
        this.ctx.stroke()
        this.showTilde = true
        this.tildeAt = i
        if (!this.tildeBlink) {
            this.startBlink()
        }
    }

    startBlink() {
        var self = this
        this.tildeBlink = setInterval(function() {
            self.showTilde = !self.showTilde
            if (self.showTilde) {
                self.tilde(self.tildeAt)
            } else {
                self.normalize(self.tildeAt)
                //self.normalize(self.tildeAt + 1)
            }
        }, 500)
    }

    stopTilde() {
        clearInterval(this.tildeBlink)
        this.tildeBlink = false
    }

    within(crd, pos, size) {
        if (crd[0] >= pos[0] && crd[0] <= pos[0]+size[0])
            if (crd[1] >= pos[1] && crd[1] <= pos[1]+size[1])
                return true
        return false
    }

    keypress(key) {
        var text = this.text.substring(0, this.tildeAt+1)
        text += key
        text += this.text.substring(this.tildeAt+1)
        this.tildeAt += 1
        this.drawText(text)
    }
}
*/

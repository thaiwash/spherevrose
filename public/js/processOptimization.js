
class PerformanceOptimization {
    constructor() {
        var self = this
        self.ic = 0
        self.fc = 0
        self.totalCost = 0
        self.tenSecHistory = []
        self.costlog = []
        self.codeBuffer = []
        self.status = {}

        self.IPS = setInterval(function(){
        	self.ic ++
        },0)

        self.measure = setInterval(function(){
            self.status = {
                "IPS": self.ic,
                "FPS": self.fc,
                "calls": self.costlog,
                "totalCost": self.totalCost
            }
            self.tenSecHistory.push(self.status)

            if (self.tenSecHistory.length > 10) {
                self.tenSecHistory.shift()
            }
        	self.ic = 0
        	self.fc = 0
            self.totalCost = 0
            self.costlog = []
            self.unBuffer()
        }, 1000)
    }

    status() {
        if (self.tenSecHistory.length > 9) {
            return self.tenSecHistory[9]
        }
    }
	
	stackTrace() {
		var err = new Error();
		return err.stack;
	}
	
    call(code) {
        // limit processing power to 100ms/s
        if (this.totalCost > this.tenSecHistory[0].IPS) {
            this.buffer(code)
            return
        }
        var ret, then, cost
        try {
            then = window.performance.now()
            ret = eval(code)
            cost = window.performance.now() - then
        } catch (e) {
            if (e) {
                console.warn(e.message);
				this.stackTrace()
                cost = 0
            }
        }
        //var self = this
        this.costlog.push([code, cost])
        this.totalCost += cost

        return ret
    }

    buffer(code) {
        this.codeBuffer.push(code)
    }

    unBuffer(code) {
        while (this.totalCost < this.tenSecHistory[0].IPS
            && this.codeBuffer.length) {
            this.call(this.codeBuffer.shift())
        }
    }

    frameUpdate() {
        var self = this
        self.fc ++
    }
}

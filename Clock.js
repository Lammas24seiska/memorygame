

class Clock {
    constructor(interval) {
        this.interval = interval; 
        this.subscribers = [];
    }

    start() {
        this.timer = setInterval(() => {
            this.tick();
        }, this.interval);
    }

    stop() {
        clearInterval(this.timer);
    }

    tick() {
        console.log("Tick");
        this.subscribers.sort((a, b) => b.priority - a.priority);
        this.subscribers.forEach(subscriber => subscriber.callback());
    }

    subscribe(callback, priority = 0) {
        this.subscribers.push({callback, priority});
    }

    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(subscriber => subscriber.callback !== callback);
    }

    unsubscribeAll() {
        this.subscribers = [];
    }

    changeInterval(newInterval) {
        this.interval = newInterval;
        this.stop();
        this.start();
    }

    
}

export default Clock;
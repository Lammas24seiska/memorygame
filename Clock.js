// Clock allows for synchronous execution of subscribed functions (animations) at a specified interval.
class Clock {
    constructor(interval) {
        this.interval = interval; 
        this.subscribers = [];
        this.on = false;
    }

    start() {
        this.on = true;
        this.timer = setInterval(() => {
            this.tick();
        }, this.interval);
    }

    stop() {
        this.on = false;
        clearInterval(this.timer);
    }

    tick() {
        // Call all subscribers in order of priority
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
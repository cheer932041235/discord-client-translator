export class AsyncQueue {
  constructor(concurrency = 6) {
    this.concurrency = Math.max(1, Number(concurrency) || 1);
    this.running = 0;
    this.queue = [];
  }

  run(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.next();
    });
  }

  next() {
    while (this.running < this.concurrency && this.queue.length) {
      const item = this.queue.shift();
      this.running += 1;
      Promise.resolve()
        .then(item.task)
        .then(item.resolve, item.reject)
        .finally(() => {
          this.running -= 1;
          this.next();
        });
    }
  }
}

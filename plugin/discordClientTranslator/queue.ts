const tasks: Array<() => void> = [];
let running = 0;

export function enqueue<T>(task: () => Promise<T>, getConcurrency: () => number) {
  return new Promise<T>((resolve, reject) => {
    tasks.push(() => {
      running += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          running -= 1;
          runNext(getConcurrency);
        });
    });
    runNext(getConcurrency);
  });
}

function runNext(getConcurrency: () => number) {
  const concurrency = Math.max(1, Number(getConcurrency()) || 1);
  while (running < concurrency && tasks.length) {
    const task = tasks.shift();
    task?.();
  }
}

export function runAtInterval(
    callback: () => void, 
    interval: number, 
    stopAfter?: number
  ): NodeJS.Timeout {
    if (typeof callback !== 'function') {
      throw new Error('First argument must be a function');
    }
  
    if (typeof interval !== 'number' || interval <= 0) {
      throw new Error('Interval must be a positive number');
    }
  
    const intervalId = setInterval(callback, interval);
  
    if (stopAfter && typeof stopAfter === 'number') {
      setTimeout(() => {
        clearInterval(intervalId);
      }, stopAfter);
    }
  
    return intervalId;
  }
  
function fibonacci(n) {
    let fib = [0, 1];
    if (n == 0) {
        return [0]
    }
    if (n == 1) {
        return [1]
    }
    for (let i = 2; i < n; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
    }
    return fib.slice(0, n);
}

console.log(fibonacci(8)); 

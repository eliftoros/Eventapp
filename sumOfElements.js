function sumOfElements(array) {
    let total = 0;

    for (let i = 0; i < array.length; i++) {
        total += array[i];
    }
    return total;
}

let array = [1, 2, 3, 4, -10];
const result = sumOfElements(array);
console.log("Sum of the elements in the array:", result);

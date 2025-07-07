function findDuplicates(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) !== i && !duplicates.includes(arr[i])) {
      duplicates.push(arr[i]);
    }
  }
  return duplicates;
}

// Örnek kullanım:
const numbers = [1, 2, 3, 4, 2, 3, 5, 1];
console.log(findDuplicates(numbers)); // [2, 3, 1]

let numbers = [1, 0, 50 ,-9];

function find_largest_num(numbers) {
   let largest = numbers[0];

   for (let i = 0; i < numbers.length; i++) {

      if (numbers[i] > largest)
         largest = numbers[i];
   }
   return largest;
}

const results = find_largest_num(numbers);

console.log("The largest number in the array:", results);

/* option + shift + F => kodu forma sokuyo */
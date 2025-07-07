function isPalindrome(word) {
  // Convert to lowercase and remove all whitespace characters
  const cleaned = word.toLowerCase().replace(/\s+/g, '');
  
  // Reverse the cleaned word
  const reversed = cleaned.split('').reverse().join('');
  
  // Check if the cleaned word and its reversed version are the same
  return cleaned === reversed;
}

// Example usage:
console.log(isPalindrome("Kayak"));         // true
console.log(isPalindrome("Nurses run"));    // true
console.log(isPalindrome("JavaScript"));    // false



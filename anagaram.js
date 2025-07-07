function isAnagram(str1, str2) {
    // Convert all letters to lower case, remove spaces and special characters
    const cleanStr1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanStr2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

    console.log("Cleaned first word:", cleanStr1);
    console.log("Cleaned second word:", cleanStr2);

    // If their lengths are different, it cannot be an anagram
    if (cleanStr1.length !== cleanStr2.length) {
        return false;
    }


    // Sort and compare letters
    const sortedStr1 = cleanStr1.split('').sort().join('');
    const sortedStr2 = cleanStr2.split('').sort().join('');

    return sortedStr1 === sortedStr2;
}

// Example 
console.log(isAnagram("E L İ F", "dff"));






let positiveKeyword = [];
let negativeKeyword = [];

itemTwo = '+google,-twitter,-bruh,+jeff'
linkKeyword = itemTwo.split(',');
for (i = 0; i < linkKeyword.length; i++) {
  if (linkKeyword[i].startsWith('+')) {
    positiveKeyword.push(linkKeyword[i].slice(1))
  } else if (linkKeyword[i].startsWith('-')) {
    negativeKeyword.push(linkKeyword[i].slice(1))
  } else {

  }
}
console.log(linkKeyword)
console.log(negativeKeyword)
console.log(positiveKeyword)
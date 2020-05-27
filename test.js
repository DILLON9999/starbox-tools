const fs = require('fs')

let rawdataThree = fs.readFileSync('./saved-info/link-token.json');
let storedLinkToken = JSON.parse(rawdataThree);
console.log(storedLinkToken.linkOpenToken)
const bcrypt = require("bcryptjs");
const hashed = bcrypt.hashSync("test123", 10);
console.log(hashed);
$2b$10$15nsy61ezsbPrrf7SQD1k.JcAx1p7fMyc5fUzsLTEd7kON.LZ2wdu
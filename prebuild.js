var fs = require('fs')
module.exports = function(){
  // Add the MIT license to the files
  return fs.readFileSync('LICENSE', 'utf-8')
}

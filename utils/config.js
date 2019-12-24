var k1 = 'api_url';

var miaotu = {
  [k1]: 'https://mt.dt5555.cn',
}
var titles = '喵途'
//  要引用这个文件的函数或者变量，除了在要引用的js文件中模块化之外（var utils=require('js地址')），
// 在被引用的的js中要通过 module.exports={a:a}作为面向对象的变量输出函数如下：
module.exports = {
  miaotu: miaotu  //要引用的函数 xx:xx
}
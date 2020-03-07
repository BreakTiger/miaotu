const WxParse = require('../../wxParse/wxParse.js')

Page({

  data: {

  },

  onLoad: function(options) {
    let that = this
    console.log(options.rules)
    let rules = JSON.parse(options.rules)
    WxParse.wxParse('rules', 'html', rules, that, 5);
  }

})
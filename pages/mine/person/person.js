const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({
  data: {
    data: {}
  },

  onLoad: function(options) {
    this.setData({
      data: JSON.parse(options.data)
    })
  },

  // 确定
  toSure: function() {

  }



})
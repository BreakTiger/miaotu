const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    // oid: '',
    // otype: '',
    // details: {},
    // order: {}
  },

  onLoad: function(options) {
    this.setData({
      oid: options.oid
    })
    this.getInfo(options.oid)
  },

  // 获取单个订单详情
  getInfo: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Order/info'
    let data = {
      order_id: e
    }
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
    })
  },



  delOrder: function() {
    let that = this
  },

  continuePay: function() {
    let that = this
  },
})
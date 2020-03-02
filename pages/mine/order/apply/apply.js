const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    id: ''
    // data: []
  },

  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    this.getInfo(options.id)
  },


  // 获取订单详情数据
  getInfo: function(e) {
    let that = this
    // let url = app.globalData.api + '/portal/Order/info'
    // request.sendRequest(url, 'post', {
    //   order_id: e
    // }, {
    //   'token': wx.getStorageSync('openid')
    // }).then(function(res) {
    //   console.log(res.data)
    // })
  },
})
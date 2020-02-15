const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    oid: '',
    otype: '',
    details: {},
    order: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let data = JSON.parse(options.data)
    console.log(data)
    this.setData({
      oid: data.oid,
      otype: data.newtype
    })
    console.log('订单ID：', data.oid)
    console.log('订单状态：', data.newtype)
    this.getItemDeatils(data.oid)
  },

  getItemDeatils: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Order/info'
    request.sendRequest(url, 'post', {
      order_id: e
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data.details)
      console.log(res.data.data.order)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            details: res.data.data.details,
            order: res.data.data.order
          })
        }
      }
    })
  },

  delOrder: function() {
    let that = this
  },

  continuePay: function() {
    let that = this
  },
})
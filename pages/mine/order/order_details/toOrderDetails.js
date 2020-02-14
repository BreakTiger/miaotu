const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    id: '',
    details:{},
    order:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.oid
    })
    this.getItemDeatils(options.oid)
  },

  getItemDeatils: function(e) {
    console.log('订单ID：', e)
    let that = this
    let url = app.globalData.api + '/portal/Order/info'
    request.sendRequest(url, 'post', {
      order_id: e
    }, {
        'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data.details)
      console.log(res.data.data.order)
      if (res.statusCode==200){
        if(res.data.status==1){
          that.setData({
            details: res.data.data.details,
            order: res.data.data.order
          })
        }
      }
    })
  },


  onShow: function() {

  },

  onPullDownRefresh: function() {

  },

  onReachBottom: function() {

  }
})
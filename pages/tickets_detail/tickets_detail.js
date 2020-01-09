const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    id: '',
    info: {},
    percent: '',
    day: '00',
    hour: '00',
    min: '00',
    list: [],
  },

  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.getGoods()
  },

  // 商品详情
  getGoods: function () {
    let that = this
    let url = app.globalData.api + '/portal/Kanjia/info'
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
        'content-type': 'application/json'
      }).then(function (res) {
        console.log(res.data.data.info);
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            that.setData({
              info: res.data.data.info,
              percent: parseFloat(res.data.data.info.do_price) / parseFloat(res.data.data.info.price) * 100
            })
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
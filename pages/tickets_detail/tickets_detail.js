const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    id: '',
    info: {},
    day: '00',
    hour: '00',
    min: '00',
    sec: '00',
    list: [],
  },

  onLoad: function(options) {
    this.setData({
      id: options.id,
    })
    this.getGoods()
  },

  // 商品详情
  getGoods: function() {
    let that = this
    let url = app.globalData.api + '/portal/Kanjia/info'
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res.data.data.info);
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            info: res.data.data.info
          })
          let now = Date.parse(new Date()) / 1000
          let end = that.data.info.end_time
          let currentstartTimer = end - now
          that.countDown(currentstartTimer)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 倒计时
  countDown: function(currentstartTimer) {
    let interval = setInterval(function() {
      // 秒数
      var second = currentstartTimer;
      // 天数位
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;
      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;
      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;
      // 秒位
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;
      this.setData({
        day: dayStr,
        hour: hrStr,
        min: minStr,
        sec: secStr
      })
      currentstartTimer--;
      if (currentstartTimer <= 0) {
        clearInterval(interval);
        this.setData({
          day: '00',
          hour: '00',
          min: '00',
          sec: '00'
        })
      }
    }.bind(this), 1000);
    this.getList()
  },

  // 砍价记录列表
  getList: function() {

  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
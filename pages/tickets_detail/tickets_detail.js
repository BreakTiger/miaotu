const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({


  data: {
    id: '',
    info: [],
    percent: 0,
    day: '0',
    hour: '0',
    min: '0',
    sec: '0',
    logList: [],
    judge: ''
  },

  onLoad: function(options) {
    this.setData({
      id: options.id
    })
  },

  onShow: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
    this.getGoods(this.data.id)
  },

  // 商品详情
  getGoods: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Kanjia/info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            info: res.data.data.info,
            percent: parseFloat(res.data.data.info.do_price) / parseFloat(res.data.data.info.price) * 100
          })
          let opneID = wx.getStorageSync('openid')
          console.log('当前登录的opneid：', opneID)
          let tokens = res.data.data.info.openid
          console.log('活动发起人的opneid：', tokens)
          if (opneID == tokens) {
            that.setData({
              judge: true
            })
          } else {
            that.setData({
              judge: false
            })
          }
          that.setTimeShow(res.data.data.info.end_time)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 倒计时
  setTimeShow: function(e) {
    let now = Date.parse(new Date()) / 1000
    if (e > now) {
      let currentstartTimer = e - now
      let interval = setInterval(function() {
        var second = currentstartTimer;
        var day = Math.floor(second / 3600 / 24);
        var dayStr = day.toString();
        if (dayStr.length == 1) dayStr = '0' + dayStr;
        var hr = Math.floor((second - day * 3600 * 24) / 3600);
        var hrStr = hr.toString();
        if (hrStr.length == 1) hrStr = '0' + hrStr;
        var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
        var minStr = min.toString();
        if (minStr.length == 1) minStr = '0' + minStr;
        var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
        var secStr = sec.toString();
        if (secStr.length == 1) secStr = '0' + secStr;
        this.setData({
          day: dayStr,
          hour: hrStr,
          min: minStr,
          sec: secStr,
        });
        currentstartTimer--;
        if (currentstartTimer <= 0) {
          clearInterval(interval);
          this.setData({
            day: '0',
            hour: '0',
            min: '0',
            sec: '0',
          });
        }
      }.bind(this), 1000);
    }
    this.getLog()
  },

  // 砍价记录
  getLog: function() {
    let that = this
    let id = that.data.id
    let url = app.globalData.api + '/portal/Kanjia/kanjia_info'
    request.sendRequest(url, 'post', {
      id: id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            logList: res.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },


  // 好友砍一刀
  cutOne: function() {
    let that = this
    let data = {
      id: that.data.info.id
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Kanjia/do_kanjia'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log('好友分享回调:', res.data)
      if(res.statusCode==200){
        if(res.data.status==1){
          modals.showToast(res.data.msg, 'none')
          that.getGoods(that.data.id)
        }else{
          modals.showToast(res.data.msg, 'none')
        }
      }else{
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  //分享给好友
  onShareAppMessage: function(options) {
    let that = this
    if (options.from === 'button') {
      console.log('参数：', that.data.id)
      console.log(that.data.info.title)
    }
    return {
      title: that.data.info.title,
      path: 'pages/tickets_detail/tickets_detail?id=' + that.data.id,
    }
  }
})
const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({


  data: {
    id: '',
    info: [],
    day: '0',
    hour: '0',
    min: '0',
    sec: '0',
    card: '',
    page: 1,
    leftlist: [],
    rightlist: [],
    judge: ''
  },


  onLoad: function(options) {
    // console.log(options.id)
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
    this.getGoodsInfo()
  },

  // 免单详情
  getGoodsInfo: function() {
    let that = this
    let url = app.globalData.api + '/portal/Miandan/info'
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res.data.data.info)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            info: res.data.data.info
          })
          let opneID = wx.getStorageSync('openid')
          // console.log('当前登录的openid', opneID)
          let tokens = res.data.data.info.openid
          // console.log('发起人的openids', tokens)
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
    this.getCard()
  },

  // 瀑布流小卡片
  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            card: res.data.data[0].image
          })
        }
        that.getList()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 瀑布流列表
  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: 7
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          let len = list.length
          if (len > 0) {
            let half = (len / 2).toFixed(0);
            that.setData({
              leftlist: list.slice(0, half),
              rightlist: list.slice(half, len)
            })
          }
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 立即领取
  toFinash: function() {
    let that = this
    let id = that.data.id
    wx.navigateTo({
      url: '/pages/buy_typefive/buy_typefive?id=' + id,
    })
  },

  //帮助好友助力
  toJoin: function() {
    let that = this
    let data = {
      id: that.data.id
    }
    let url = app.globalData.api + '/portal/Miandan/help'
    console.log('参数：', data)
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log('好友助力', res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'loading')
          setTimeout(function() {
            that.getGoodsInfo()
          }, 500)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  onPullDownRefresh: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
    this.getGoodsInfo()
  },



  onReachBottom: function() {
    let that = this
    let left = that.data.leftlist
    let right = that.data.rightlist
    let pages = that.data.page + 1
    let data = {
      page: pages,
      length: 10,
      type: 7
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          let len = list.length
          if (len > 0) {
            let half = len / 2
            let one = list.slice(0, half)
            let two = list.slice(half, len)
            that.setData({
              leftlist: left.concat(two),
              rightlist: right.concat(one),
              page: pages
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  },

  onShareAppMessage: function(options) {
    let that = this
    console.log('参数：', that.data.id)
    console.log(that.data.info.title)
    return {
      title: that.data.info.title,
      path: 'pages/free_detail/free_detail?id=' + that.data.id,
    }
    
  }
})
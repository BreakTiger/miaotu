const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const WxParse = require('../../wxParse/wxParse.js')
const app = getApp()

Page({

  data: {
    top: [{
        name: '商品'
      },
      {
        name: '详情'
      },
      {
        name: '须知'
      }
    ],
    id: '',
    details: {},
    shop: {},
    startTime: '',
    discuss: {},
    collecttype: false,
    countdown: ''
  },

  onLoad: function(options) {
    console.log(options)
    this.setData({
      id: options.oid
    })
    this.getShopInfo(options.oid)
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },

  getShopInfo: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Miaosha/info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let details = res.data.data.info
          that.setData({
            details: details,
            shop: res.data.data.shop
          })
          let introduce = details.introduce
          WxParse.wxParse('introduce', 'html', introduce, that, 5);
          let traffic = details.traffic
          WxParse.wxParse('traffic', 'html', traffic, that, 5);
          let buy = details.buy_notice
          WxParse.wxParse('buy', 'html', buy, that, 5);
          that.trailer(details.article_type)
        }
      }
    })
  },

  trailer: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/home/get_foreshow';
    request.sendRequest(url, 'post', {
      type: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            startTime: res.data.data
          })
          that.getReview()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取评论
  getReview: function() {
    let that = this
    let data = {
      page: 1,
      length: 1,
      details_id: that.data.details.id
    }
    let url = app.globalData.api + '/portal/home/comment'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            discuss: res.data.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
      that.setTimeShow()
    })
  },

  setTimeShow: function() {
    let that = this
    let time1 = that.data.details.ms_starttime
    time1 = time1.substring(0, 19);
    time1 = time1.replace(/-/g, '/');
    let start = new Date(time1).getTime();
    let time2 = that.data.details.ms_endtime
    time2 = time2.substring(0, 19);
    time2 = time2.replace(/-/g, '/');
    let end = new Date(time2).getTime();
    let now = Date.parse(new Date())
    if (now >= start || now <= end) {
      let currentstartTimer = (end - now) / 1000
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
          countdown: dayStr + ':' + hrStr + ':' + minStr + ':' + secStr
        });
        currentstartTimer--;
        if (currentstartTimer <= 0) {
          clearInterval(interval);
          this.setData({
            countdown: '00' + ':' + '00' + ':' + '00' + ':' + '00'
          });
        }
      }.bind(this), 1000);
    } else {
      that.setData({
        countdown: '活动即将开始'
      });
    }
  },

  toShop: function(e) {
    wx.navigateTo({
      url: '/pages/shop/shop?sid=' + e.currentTarget.dataset.sid,
    })
  },

  onShow: function() {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      that.collectType(openID)
    }
  },

  // 收藏状态
  collectType: function(openID) {
    let that = this
    let url = app.globalData.api + '/portal/Shop/collect'
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': openID
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          if (res.data.data == 0) {
            that.setData({
              collecttype: false
            })
          } else {
            that.setData({
              collecttype: true
            })
          }
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 收藏
  toCollect: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/set_collect'
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectType(wx.getStorageSync('openid'))
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 取消收藏
  toCanel: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/out_collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectType(wx.getStorageSync('openid'))
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  onShareAppMessage: function(options) {
    if (options.from === 'button') {}
    return {
      title: this.data.details.title,
      path: '/pages/seckill_detail/seckill_detail?id=' + this.data.id,
    }
  }
})
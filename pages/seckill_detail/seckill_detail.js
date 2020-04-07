const request = require('../../utils/http.js')
import modals from '../../utils/modal.js'
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
    tao: [],
    startTime: '',
    discuss: {},
    collecttype: false,
    countdown: '',
    floorstatus: false
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

  // 商品详情
  getShopInfo: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Miaosha/info'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let result = res.data.data
          console.log(result)
          that.setData({
            details: result.info,
            shop: result.shop,
            tao: result.setmeal
          })

          let introduce = result.info.introduce
          WxParse.wxParse('introduce', 'html', introduce, that, 5);
          let traffic = result.info.traffic
          WxParse.wxParse('traffic', 'html', traffic, that, 5);
          let buy = result.info.buy_notice
          WxParse.wxParse('buy', 'html', buy, that, 5);
          that.trailer(result.info.article_type)
        }
      }
    })
  },

  // 二次确认
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

  // 倒计时
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
    modals.loaded()
  },

  // 店铺
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

  //  下单
  toOrder: function() {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      console.log('秒杀活动ID：', that.data.id)
      let url = app.globalData.api + '/portal/Miaosha/do_miaoshao'
      modals.loading()
      request.sendRequest(url, 'post', {
        id: that.data.id
      }, {
        'token': openID
      }).then(function(res) {
        modals.loaded()
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            let data = {
              id: that.data.id,
              tao: that.data.tao,
              price: that.data.details.ms_price
            }
            wx.navigateTo({
              url: '/pages/buy_typethree/buy_typethree?data=' + JSON.stringify(data),
            })
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您需要授权后，才可进行此项操作',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    }
  },

  // 监听滚动
  onPageScroll: function(e) {
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },

  //回到顶部
  goTop: function() {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  onShareAppMessage: function(options) {
    return {
      title: this.data.details.title,
      path: '/pages/seckill_detail/seckill_detail?id=' + this.data.id,
    }
  }
})
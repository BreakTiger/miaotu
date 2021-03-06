const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
const app = getApp()

Page({

  data: {
    info: {},
    goodsnav: [{
        id: 5,
        name: '推荐'
      },
      {
        id: 6,
        name: '最新'
      },
      {
        id: 1,
        name: '本地'
      },
      {
        id: 2,
        name: '国外'
      },
      {
        id: 3,
        name: '小众'
      },
      {
        id: 4,
        name: '猎奇'
      }
    ],
    choice_one: 5,
    balance: '0.00',
    signType: true,
    page: 1,
    leftlist: [],
    rightlist: [],
    card: '',
    uopenid: '',
  },


  onLoad: function(options) {
    let uopenid = options.uopenid
    if (uopenid) {
      this.setData({
        uopenid: uopenid
      })
    }
  },

  onShow: function() {
    let openID = wx.getStorageSync('openid') || '';
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    } else {
      this.signning(openID)
    }
  },

  // 签到基本信息
  signning: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Sign/info'
    modals.loading()
    request.sendRequest(url, 'post', {}, {
      'token': e
    }).then(function(res) {
      console.log(res);
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            info: res.data.data,
            balance: res.data.data.user.balance
          })
          let data = new Date()
          let time = data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate()
          console.log(time)
          // 未签到：当前日期不等于上次签到日期
          if (res.data.data.user.end_time == '0-0-0') {
            that.setData({
              signType: true
            })
          } else if (res.data.data.user.end_time != time) {
            that.setData({
              signType: true
            })
          } else {
            that.setData({
              signType: false
            })
          }
        } else {
          modals.showToast(res.data.msg, 'none');
        }
        that.getList(that.data.choice_one)
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 分类列表
  getList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
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
            that.getCard()
          }
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 瀑布流，小卡片
  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    modals.loading()
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            card: res.data.data[0].image
          })
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 选择导航分类
  toGetKind: function(e) {
    let id = e.currentTarget.dataset.id
    let choice = this.data.choice_one
    if (choice != id) {
      this.setData({
        choice_one: id,
        page: 1
      })
      this.getList(id);
    }
  },

  // 提现
  toTake: function() {
    let price = this.data.balance
    console.log(price)
    if (price > 10) {
      wx.showModal({
        title: '提示',
        content: '提现功能暂未开通，敬请期待',
        showCancel: false
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '提现金额最低为10元',
        showCancel: false
      })
    }
  },

  // 查看商品详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  // 签到
  toSign: function() {
    let that = this
    let uid = that.data.uopenid
    if (uid) {
      console.log('先好友回调')
      that.share(uid)
    } else {
      console.log('直接签到')
      that.sgin()
    }
  },

  share: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Home/set_share'
    let data = {
      uopenid: e,
      type: 5,
      order_id: ''
    }
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.sgin()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 签到
  sgin: function() {
    let that = this
    let url = app.globalData.api + '/portal/Sign/do_sign'
    modals.loading()
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.signning(wx.getStorageSync('openid'))
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  toRulue: function() {
    let rules = this.data.info.rule
    console.log(rules)
    wx.navigateTo({
      url: '/pages/rules/rules?rules=' + JSON.stringify(rules),
    })
  },

  onReachBottom: function() {
    let that = this
    let left = that.data.leftlist
    let right = that.data.rightlist
    let pages = that.data.page + 1
    let choice = that.data.choice_one
    let data = {
      page: pages,
      length: 10,
      type: choice
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
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
    if (options.from === 'button') {
      console.log('分享参数：', wx.getStorageSync('openid'))
      return {
        title: '现金签到',
        path: 'pages/index/sign/sign?uopenid=' + wx.getStorageSync('openid'),
      }
    }

  }
})
// 此签到页，必须授权登陆
const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    uid: '',
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
    card: ''
  },

  onLoad: function(options) {
    console.log(options)
    this.setData({
      uid: options.uopenid || ''
    })
  },

  onShow: function() {
    // 判断是否授权
    let openID = wx.getStorageSync('openid') || '';
    if (openID) {
      if (this.data.uid) {
        this.shares();
      }
      this.signning(openID)
    } else {
      wx.showModal({
        title: '提示',
        content: '授权登录后才可以签到哦',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 2
            })
          }
        }
      })
    }
  },


  // 签到基本信息
  signning: function(openID) {
    let that = this
    let url = app.globalData.api + '/portal/Sign/info'
    modals.loading()
    request.sendRequest(url, 'post', {}, {
      'token': openID
    }).then(function(res) {
      console.log(res.data.data);
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            balance: res.data.data.user.balance
          })
          let data = new Date()
          let time = data.getFullYear() + '-' + '0' + (data.getMonth() + 1) + '-' + '0' + data.getDate()
          // 未签到：当前日期不等于上次签到日期
          if (res.data.data.user.end_time == '0000-00-00') {
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

  // 立即签到
  toSign: function() {
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


  // 查看商品详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/goods/goods?id=' + id,
    })
  },

  // 邀请好友签到
  shares: function() {
    let that = this
    let data = {
      uopenid: that.data.uid,
      type: 5
    }
    let url = app.globalData.api + '/portal/Home/set_share'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log('1111:', res);
    })
  },

  onPullDownRefresh: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
    this.onShow()
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
              leftlist: left.concat(one),
              rightlist: right.concat(two),
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
      console.log(111);
    }
    return {
      title: '现金签到',
      path: 'pages/index/sign/sign?uopenid=' + wx.getStorageSync('openid') + '',
    }
  }
})
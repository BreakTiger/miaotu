const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    login: 0,
    person: [],
    person_like: [],
    nav: [{
        icon: '../../icon/track.png',
        name: '足迹',
        path: '/pages/mine/track/track'
      },
      {
        icon: '../../icon/order.png',
        name: '订单',
        path: '/pages/mine/order/order'
      },
      {
        icon: '../../icon/certificates.png',
        name: '礼券',
        path: '/pages/mine/certificates/certificates'
      },
      {
        icon: '../../icon/wallet.png',
        name: '钱包',
        path: '/pages/mine/wallet/wallet'
      }
    ],
    travelList: [],
    card: '',
    page: 1,
    leftlist: [],
    rightlist: []
  },

  onLoad: function(options) {
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
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

  // 猜你喜欢列表
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

  // 猜你喜欢列表项详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  onShow: function() {
    let openid = wx.getStorageSync('openid') || ''
    if (openid) {
      this.setData({
        login: 1
      })
      this.getParson()
    } else {
      this.setData({
        login: 0
      })
    }
  },

  toLogin:function(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  toMembers:function(){
    wx.navigateTo({
      url: '/pages/mine/members/members',
    })
  },

  // 用户信息
  getParson: function() {
    let that = this
    let url = app.globalData.api + '/portal/Personal/user_info'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            person: res.data.data
          })
          that.getLike()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取用户的获赞+粉丝+关注等数据
  getLike: function() {
    let that = this
    let url = app.globalData.api + '/portal/Personal/get_like'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            person_like: res.data.data
          })
          that.getTravel()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取我的游记
  getTravel: function() {
    let that = this
    let url = app.globalData.api + '/portal/Personal/mytravels'
    request.sendRequest(url, 'post', {
      length: 5
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            travelList: res.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 编辑用户资料
  toEdutor: function() {
    let data = JSON.stringify(this.data.person)
    wx.navigateTo({
      url: '/pages/mine/person/person?data=' + data,
    })
  },

  // 导航
  toNav: function(e) {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let url = e.currentTarget.dataset.url
      wx.navigateTo({
        url: url,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您需要在授权登录后，才可进行此项操作',
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

  // 我的游记
  totravel: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let data = {
        person: this.data.person,
        person_like: this.data.person_like
      }
      console.log(data)
      wx.navigateTo({
        url: '/pages/mine/travel/travel?data='+JSON.stringify(data),
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您需要授权登录后，才可进行此项操作！',
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

  // 发布
  tosend: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      wx.navigateTo({
        url: '/pages/send/send',
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '授权登录后，才可以进行此项操作',
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

  onPullDownRefresh: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
    this.onLoad();
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
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
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
  }
})
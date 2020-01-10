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
    packages: [],
    startTime: '',
    discuss: {},
    page: 1,
    group: [],
    list_pelpel: [],
    list_time: [],
    all_list: [],
    len: '0',
    collecttype: false,
    shad: false,

  },

  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    let openID = wx.getStorageSync('openid') || ''
    // 判断是否登录
    if (openID) { //已经登录
      this.getShopInfo()
    } else { //未登录
      this.getShopInfo()
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 获取商品信息
  getShopInfo: function() {
    let that = this
    let url = app.globalData.api + '/portal/Pintuan/info'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res.data.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let details = res.data.data.info
          that.setData({
            details: details,
            shop: res.data.data.shop,
            packages: res.data.data.setmeal
          })
          // 绑定富文本:
          // 产品简介
          let introduce = details.introduce
          WxParse.wxParse('introduce', 'html', introduce, that, 5);
          // 交通信息
          let traffic = details.traffic
          WxParse.wxParse('traffic', 'html', traffic, that, 5);
          // 购买须知
          let buy = details.buy_notice
          WxParse.wxParse('buy', 'html', buy, that, 5);
          that.trailer(details.article_type)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 活动开始预告
  trailer: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/home/get_foreshow'
    modals.loading()
    request.sendRequest(url, 'post', {
      type: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      // console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            startTime: res.data.data
          })
          that.getReview()
        } else {
          modals.showToast(res.data.msg, 'none')
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
    // console.log(data);
    let url = app.globalData.api + '/portal/home/comment'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            discuss: res.data.data.data
          })
        }
        that.joinGroup()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 拼单情况 - 未登录下
  joinGroup: function() {
    let that = this
    let data = {
      id: that.data.id,
      page: that.data.page,
      length: 6
    }
    let url = app.globalData.api + '/portal/Pintuan/info_desc'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      // console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            group: res.data.data.data,
            len: res.data.data.count
          })
          that.reform_one(that.data.group)
        } else {
          modals.showToast(res.data.status, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 拼单数组重整 ,将数据分为俩组，一组，放置拼团人信息，另一组放置倒计时
  reform_one: function(list) {
    let one = []
    let two = []
    for (let i = 0; i < list.length; i++) {
      let differ = list[i].number - list[i].pt_number
      let ele = {
        id: list[i].id,
        header: list[i].img,
        name: list[i].name,
        nums: differ,
      }
      one.push(ele)
    }
    for (let j = 0; j < one.length; j++) {
      two.push(one.slice(j, j + 2));
    }
    this.setData({
      list_pelpel: two
    })
  },


  onShow: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.joinGroup_one()
      this.collectState()
    }
  },

  joinGroup_one: function() {
    let that = this
    let data = {
      id: that.data.id,
      page: that.data.page,
      length: 6
    }
    let url = app.globalData.api + '/portal/Pintuan/info_desc'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            group: res.data.data.data,
            len: res.data.data.count
          })
          that.reform_one(that.data.group)
        } else {
          modals.showToast(res.data.status, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 店铺
  toshop: function(e) {
    wx.navigateTo({
      url: '/pages/shop/shop?sid=' + e.currentTarget.dataset.id,
    })
  },

  // 查看所有评论
  toEvaluate: function(e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/evaluate/evaluate?id=' + e.currentTarget.dataset.id,
    })
  },

  // 产品收藏状态
  collectState: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res.data);
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          if (res.data.data == 0) { //未收藏
            that.setData({
              collecttype: false
            })
          } else { //收藏
            that.setData({
              collecttype: true
            })
          }
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
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectState()
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
      // console.log(res)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectState()
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 查看所有拼团
  allGroup: function() {
    let that = this
    let data = {
      id: that.data.id,
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Pintuan/info_desc'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data.data);
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            shad: true,
            all_list: res.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 关闭弹窗
  toClose: function() {
    this.setData({
      shad: false
    })
  },

  // 去到商铺
  toShop: function(e) {
    wx.navigateTo({
      url: '/pages/index/goods/shop/shop?sid=' + e.currentTarget.dataset.sid,
    })
  },

  // 立即预定
  toOrder: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let data = {
        id: this.data.details.id,
        tao: this.data.packages,
        uid: '',
        price: this.data.details.pt_price
      }
      console.log('参数：', data)
      wx.navigateTo({
        url: '/pages/buy_typetwo/buy_typetwo?data=' + JSON.stringify(data),
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 去拼团，下单
  togroup: function(e) {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let data = {
        id: this.data.details.id,
        tao: this.data.packages,
        uid: e.currentTarget.dataset.id,
        price: this.data.details.pt_price
      }
      console.log('参数：', data)
      wx.navigateTo({
        url: '/pages/buy_typetwo/buy_typetwo?data=' + JSON.stringify(data),
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 禁止手动滑动
  catchTouchMove: function(res) {
    return false
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

  onShareAppMessage: function(options) {
    if (options.from === 'button') {}
    return {
      title: this.data.details.title,
      path: '/pages/group_detail/group_detail?id=' + this.data.id,
    }
  }
})
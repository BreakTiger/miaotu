const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    navlist: [{
        id: 0,
        name: '全部',
      },
      {
        id: 1,
        name: '待付款',
      },
      {
        id: 2,
        name: '待分享',
      },
      {
        id: 3,
        name: '待出行',
      },
      {
        id: 4,
        name: '待评价',
      },
      {
        id: 5,
        name: '已完成',
      }
    ],
    choice_one: 0,
    page: 1,
    list: [],
    aid: ''
  },

  onShow: function() {
    this.getList(this.data.choice_one)
  },

  // 获取列表
  getList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e
    }
    let url = app.globalData.api + '/portal/Personal/my_order'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          // console.log(list)
          that.getPingID(list)

          // that.setData({
          //   list: res.data.data.data
          // })
        } else {
          that.setData({
            list: []
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  //获取活动ID
  getPingID: function(list) {
    // 循环数组
    for (let i = 0; i < list.length; i++) {
      if (list[i].type == 1 && list[i].new_status == 5) { //拼团
        // console.log('下标：', i)
        let data = {
          order_id: list[i].id,
          type: 1
        }
        let url = app.globalData.api + '/portal/Order/get_pintuan'
        request.sendRequest(url, 'post', data, {
          'token': wx.getStorageSync('openid')
        }).then(function(res) {
          // console.log(res.data.data)
          if (res.statusCode == 200) {
            if (res.data.status == 1) {
              let pid = res.data.data.p_id
              console.log(pid)
              list[i]['aid'] = pid
            }
          } else {
            modals.showToast('系统繁忙，请稍后重试', 'none')
          }
        })
      } else {
        list[i]['aid'] = ''
      }
    }
    console.log(list)
    this.setData({
      list: list
    })
  },


  // 选择分类
  toChoice: function(e) {
    let choice = e.currentTarget.dataset.id
    let id = this.data.choice_one
    if (choice != id) {
      this.setData({
        choice_one: choice,
        page: 1
      })
      this.getList(this.data.choice_one)
    }
  },

  // 取消订单 + 删除订单
  delOrder: function(e) {
    let that = this
    let oid = e.currentTarget.dataset.item.id
    let url = app.globalData.api + '/portal/order/delete'
    request.sendRequest(url, 'post', {
      id: oid
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast('取消成功', 'loading')
          setTimeout(function() {
            that.getList(that.data.choice_one)
          }, 1000)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 继续付款
  continuePay: function(e) {
    let that = this
    let oid = e.currentTarget.dataset.item.id
    let url = app.globalData.api + '/portal/Pay/do_pay'
    request.sendRequest(url, 'post', {
      order_id: oid
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let result = res.data.data
          wx.requestPayment({
            timeStamp: result.timeStamp,
            nonceStr: result.nonceStr,
            package: result.package,
            signType: result.signType,
            paySign: result.paySign,
            success: function(res) {
              modals.showToast('支付成功', 'loading')
              setTimeout(function() {
                that.getList(that.data.choice_one)
              }, 1000)
            },
            fail: function(res) {
              modals.showToast('支付失败', 'none')
            }
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 申请售后
  aftersales: function(e) {
    let that = this
    let id = e.currentTarget.dataset.item.id
    wx.navigateTo({
      url: '/pages/mine/order/apply/apply?id=' + id,
    })
  },

  // 再次购买
  buyAgain: function(e) {
    let that = this
    let id = e.currentTarget.dataset.item.detailsId
    console.log('ID：', id)
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  // 立即评价
  toReview: function(e) {
    let that = this
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/mine/order/comments/comments?item=' + JSON.stringify(item),
    })
  },


  // 跳转订单详情
  toOrderDetails: function(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    if (item.type != 5) {
      let oid = item.id
      console.log(oid)
      wx.navigateTo({
        url: '/pages/mine/order/order_details/toOrderDetails?oid=' + oid,
      })
    }
  },

  // 取消申请
  cancelApply: function(e) {
    let that = this
    let data = {
      id: e.currentTarget.dataset.item.id
    }
    let url = app.globalData.api + '/portal/order/delete'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast('取消成功', 'none')
          setTimeout(function() {
            that.getList(that.data.choice_one)
          }, 500)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
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
    this.getList(this.data.choice_one)
  },

  onReachBottom: function() {
    let that = this
    let old = that.data.list
    let pages = that.data.page + 1
    let data = {
      page: pages,
      length: 10,
      type: that.data.choice_one
    }
    console.log('参数:', data)
    let url = app.globalData.api + '/portal/Personal/my_order'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          if (list.length > 0) {
            that.setData({
              list: old.concat(list)
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 立即分享
  onShareAppMessage: function(options) {
    console.log(options.target.dataset.item)
    let order_type = options.target.dataset.item.type
    if (options.from === 'button') {
      if (order_type == 0) { //普通
        return {
          title: options.target.dataset.item.title,
          path: '/pages/goods_detail/goods_detail?id=' + options.target.dataset.item.detailsId,
        }
      } else if (order_type == 1) { //拼团
        return {
          title: options.target.dataset.item.title,
          path: '/pages/group_detail/group_detail?id=' + options.target.dataset.item.aid,
        }
      } else if (order_type == 2) { //门票
        return {
          title: '门票砍价',
          path: '/pages/index/tickets/tickets',
        }
      } else if (order_type == 3) { //秒杀
        let skill = wx.getStorageSync('skill')
        return {
          title: skill.title,
          path: '/pages/seckill_detail/seckill_detail?oid=' + skill.id,
        }
      } else if (order_type == 4) { //助力
        return {
          title: '助力免单',
          path: '//pages/index/free/free',
        }
      }
    }
  },


})
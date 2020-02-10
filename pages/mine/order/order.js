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
    list: []
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
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            list: res.data.data.data
          })
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
    console.log('订单ID：',oid)
    let url = app.globalData.api + '/portal/Pay/do_pay'
    request.sendRequest(url, 'post', {
      order_id: e
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
              modals.showToast('支付失败，请稍后重试', 'none')
            }
          })
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

  }
})
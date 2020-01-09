const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    nav: [{
        id: 1,
        name: '正在秒杀'
      },
      {
        id: 2,
        name: '即将开抢'
      },
      {
        id: 3,
        name: '抢购预告'
      }
    ],
    choice: 1,
    page: 1,
    goodslist: []
  },

  onLoad: function(options) {
    let choice = this.data.choice
    this.getlist(choice)
  },

  // 获取列表
  getlist: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e
    }
    modals.loading()
    let url = app.globalData.api + '/portal/Miaosha/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            goodslist: res.data.data.data
          })
        } else {
          that.setData({
            goodslist: []
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 切换分类
  selectNav: function(e) {
    let id = e.currentTarget.dataset.id
    let choice = this.data.choice
    if (choice != id) {
      this.setData({
        choice: id
      })
      this.getlist(this.data.choice)
    }
  },

  // 拼团详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/seckill_detail/seckill_detail?id=' + id,
    })
  },

  onShow: function() {

  },

  onPullDownRefresh: function() {

  },

  onReachBottom: function() {

  }
})
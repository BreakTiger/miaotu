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

  onLoad: function(options) {

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
      console.log(res.data.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            list: res.data.data.data
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



  onPullDownRefresh: function() {

  },

  onReachBottom: function() {

  }
})
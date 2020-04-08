const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
const app = getApp()


Page({

  data: {
    // 切换
    nav: [{
        text: '商品',
        type: 0
      },
      {
        text: '活动',
        type: 1
      }
    ],
    choice: 0,

    //商品
    page_one: 1,
    list_one: [],

    //活动
    page_two: 1,
    list_two: []
  },

  onLoad: function(options) {
    this.getList_one()
  },

  // 切换
  toSwitch: function(e) {
    let choice = this.data.choice
    let type = e.currentTarget.dataset.type
    if (choice != type) {
      this.setData({
        choice: type
      })
      this.judge()
    }
  },

  // 判断
  judge: function() {
    let choice = this.data.choice
    if (choice == 0) {
      this.getList_one()
    } else {
      this.getList_two()
    }
  },

  // 获取商品列表
  getList_one: function() {
    let that = this
    let data = {
      page: that.data.page_one,
      length: 10
    }
    let url = app.globalData.api + '/portal/Personal/collect_list'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      console.log(res.data.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            list_one: res.data.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取活动列表
  getList_two: function() {
    let that = this
    let data = {
      page: that.data.page_two,
      length: 10
    }
    let url = app.globalData.api + '/portal/Personal/collect_activity_list'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            list_two: res.data.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }

    })
  },

  // 前往详情 - 商品
  toDetail_one: function(e) {
    let id = e.currentTarget.dataset.item.id
    console.log(id)
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  // 前往详情 -活动
  toDetail_two: function(e) {
    console.log(e.currentTarget.dataset.item)
    let id = e.currentTarget.dataset.item.id
    console.log(id)
    let type = e.currentTarget.dataset.item.type
    console.log(type)
  },




  // 增加阅览次数
  addNum: function() {
    let that = this

  },
  // addNum: function(url,) {
  //   let that = this
  //   let data = {
  //     id: e
  //   }
  // },



  // onPullDownRefresh: function() {
  //   wx.showToast({
  //     title: '加载中',
  //     icon: 'loading',
  //     duration: 1000
  //   })
  //   setTimeout(() => {
  //     wx.stopPullDownRefresh()
  //   }, 1000);
  //   // this.setData({
  //   //   page: 1
  //   // })
  //   // this.getList()
  // },


  // onReachBottom: function() {
  //   let that = this
  //   let old = that.data.list
  //   let page = that.data.page + 1
  //   let data = {
  //     page: page,
  //     length: 10
  //   }
  //   let url = app.globalData.api + '/portal/Personal/collect_list'
  //   request.sendRequest(url, 'post', data, {
  //     'token': wx.getStorageSync('openid')
  //   }).then(function(res) {
  //     if (res.statusCode == 200) {
  //       if (res.data.status == 1) {
  //         let list = res.data.data.data
  //         console.log(list)
  //         if (list.length > 0) {
  //           that.setData({
  //             list: old.concat(list),
  //             page: page
  //           })
  //         }
  //       } else {
  //         modals.showToast('我也是有底线的', 'none')
  //       }
  //     } else {
  //       modals.showToast('系统繁忙，请稍后重试', 'none')
  //     }
  //   })
  // }
})
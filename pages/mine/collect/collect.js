const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
const app = getApp()


Page({

  data: {
    switchs: 0,
    //商品
    page: 1,
    list_one: [],
    //活动
    page: 1,
    list_two: []
  },

  onLoad: function(options) {
    this.getList()
  },

  // 获取列表
  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Personal/collect_list'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
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

  // // 进入详情 区分分类
  // toDetail: function(e) {
  //   let id = e.currentTarget.dataset.item.id
  //   console.log(id)
  //   let type = e.currentTarget.dataset.item.type
  //   console.log(e.currentTarget.dataset.item)
  //   if (type == 0) { //普通
  //     let path = '/pages/goods_detail/goods_detail'

  //   } else if (type == 1) { //拼团
  //     let path = '/pages/group_detail/group_detail'

  //   } else if (type == 3) { //秒杀
  //     let path = '/pages/seckill_detail/seckill_detail'

  //   }
  // },

  // // 增加阅览次数
  // addNum: function() {
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
  //   this.setData({
  //     page: 1
  //   })
  //   this.getList()
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
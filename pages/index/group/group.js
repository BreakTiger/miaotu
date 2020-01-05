const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sw_list: [],
    page: 1,
    list: [],
    lefts: 18
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.lunbo()

  },

  lunbo: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    modals.loading()
    request.sendRequest(url, 'post', {
      tags: 2
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log('轮播：',res);
      if (res.statusCode == 200) {
        that.setData({
          sw_list: res.data.data
        })
        that.getList()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Pintuan/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      console.log('列表', res.data.data.data);
      if (res.statusCode == 200) {
        that.setData({
          list: res.data.data.data
        })
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 拼团详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/group/group_detail/group_detail?id=' + id,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
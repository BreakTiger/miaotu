const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    word: '',
    page: 1,
    hislist: [],
    hotlist: [],
    searchlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // let list = wx.getStorageSync('hlist')
    // console.log('历史搜索', list);
    this.hotSearch()

  },

  // 热门搜索
  hotSearch: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/top_search'
    request.sendRequest(url, 'post', {
      length: 10
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res);
      if (res.statusCode == 200) {
        that.setData({
          hotlist: res.data.data
        })
      } else {
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  // 获取输入的内容、
  getInput: function(e) {
    this.setData({
      word: e.detail.value
    })
  },

  // 搜索
  searchs: function() {
    let that = this
    let data = {
      name: that.data.word,
      page: that.data.page,
      length: 10
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Home/do_search'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res);
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            searchlist: res.data.data
          })
          // let arr = []
          // let ele = {
          //   name: that.data.word
          // }
          // arr.push(ele)
          // that.setData({
          //   hislist: arr
          // })
          // wx.setStorageSync('history', arr)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      } else {
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })
  },


  // 删除历史搜索内容
  delHistory: function() {
    console.log('删除历史搜索')
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

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
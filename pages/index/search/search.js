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
    hislist: [], //历史
    hotlist: [], //热门
    searchlist: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 判断缓存中是否存在历史记录
    this.setData({
      hislist: wx.getStorageSync('history') || []
    })
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
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 点击历史/热门 标签 搜索
  laberSelect: function(e) {
    let word = e.currentTarget.dataset.name
    this.setData({
      word: word
    })
    this.searchs()
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
        } else {
          modals.showToast(res.data.msg, 'none')
        }
        //添加到历史记录
        that.addHistory()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 添加到历史记录
  addHistory: function() {
    let list = this.data.hislist
    console.log('历史列表：', list)
    let ele = {
      name: this.data.word
    }
    console.log('元素', ele);
    // 判断历史列表中是否已经存在搜索内容
    if (list.includes(ele)) {
      console.log('true')
    } else {
      list.push(ele)
      wx.setStorageSync('history', list)
    }
  },


  // 删除历史搜索内容
  delHistory: function() {
    wx.removeStorageSync('history')
    this.onLoad();
  },

  // 点击历史搜索标签

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
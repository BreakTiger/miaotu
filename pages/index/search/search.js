const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    word: '',
    history: [],
    page: 1,
    hotList: [],
    searchList: []
  },

  onLoad: function(options) {
    // 判断缓存中是否存在历史记录
    this.setData({
      history: wx.getStorageSync('history') || []
    })
    this.getHotList()
  },

  // 获取热门搜索
  getHotList: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/top_search'
    request.sendRequest(url, 'post', {
      length: 10
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            hotList: res.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取输入内容
  getInput: function(e) {
    this.setData({
      word: e.detail.value
    })
  },

  // 搜索
  searchs: function() {
    let that = this
    if (!that.data.word) {
      modals.showToast('搜索内容不能为空！', 'none');
    } else {
      let data = {
        name: that.data.word,
        page: that.data.page,
        length: 10
      }
      let url = app.globalData.api + '/portal/Home/do_search'
      request.sendRequest(url, 'post', data, {
        'content-type': 'application/json'
      }).then(function(res) {
        console.log(res.data.data);
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            that.setData({
              searchList: res.data.data.data
            })
            that.addHistory()
          } else {
            modals.showToast('搜索内容不存在', 'none')
            that.addHistory()
            that.onLoad()
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  // 添加到历史搜索记录
  addHistory: function() {
    let that = this
    let list = that.data.history
    list.push({
      name: that.data.word
    })
    wx.setStorageSync('history', list);
  },

  // 清空历史搜索记录
  delHistory: function() {
    wx.removeStorageSync('history')
    this.onLoad();
  },

  // 点击历史搜索标签,热门搜索
  laberSelect: function(e) {
    this.setData({
      word: e.currentTarget.dataset.name
    })
    this.search_two(this.data.word)
  },

  search_two: function(e) {
    let that = this
    let data = {
      name: e,
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Home/do_search'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            searchList: res.data.data.data
          })
        } else {
          modals.showToast('搜索内容不存在', 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 去到商品详情
  toGoodsDetail: function(e) {
    console.log(e.currentTarget.dataset.id)
  },

  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})
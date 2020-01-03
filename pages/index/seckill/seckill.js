const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
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
    goodslist: [1, 2, 3, 4, 1, 2]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let choice = this.data.choice
    this.getlist(choice)
  },


  getlist: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e
    }
    console.log('参数:', data);
    modals.loading()
    let url = app.globalData.api + '/portal/Miaosha/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      console.log(res);
    })
  },

  selectNav: function(e) {
    let id = e.currentTarget.dataset.id
    console.log(id);
    let choice = this.data.choice
    if (choice != id) {
      this.setData({
        choice: id
      })
      this.getlist(this.data.choice)
    }
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
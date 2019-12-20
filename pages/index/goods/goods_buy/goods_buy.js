var date = new Date();
var year = date.getFullYear()
var month = date.getMonth()
var day = date.getDate()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    depart: [{
        id: 1,
        name: '大理'
      },
      {
        id: 2,
        name: '广州'
      },
      {
        id: 3,
        name: '深圳'
      },
      {
        id: 4,
        name: '北京'
      },
      {
        id: 3,
        name: '越南'
      }
    ],
    choice_one: 1,
    types: [{
        id: 1,
        name: 'a.商务车环耳海存完'
      },
      {
        id: 2,
        name: 'b.吉普车跟拍（间修）'
      },
      {
        id: 3,
        name: 'c.商务车（游船+扎玩）'
      }
    ],
    choice_two: 1,
    todayTime: '',
    week: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getToday()
  },

  getToday: function() {
    var time = year + '年' + (month + 1) + '月' + day + '日'
    this.setData({
      todayTime: time
    })
  },

  lastMonth: function() {
    if (0 == month) {
      month = 11;
      --year
      var time = year + '年' + (month + 1) + '月' + 1 + '日'
      this.setData({
        todayTime: time
      })
    } else {
      --month;
      var time = year + '年' + (month + 1) + '月' + 1 + '日'
      this.setData({
        todayTime: time
      })
    }
  },

  nextMonth: function() {
    if (11 == month) {
      month = 0;
      ++year
      var time = year + '年' + (month + 1) + '月' + 1 + '日'
      this.setData({
        todayTime: time
      })
    } else {
      ++month;
      var time = year + '年' + (month + 1) + '月' + 1 + '日'
      this.setData({
        todayTime: time
      })
    }
  },

  // 判断当前是否为闰年


  // 获取当前月份的天数

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
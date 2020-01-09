const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const WxParse = require('../../wxParse/wxParse.js')
const app = getApp()

Page({

  data: {
    top: [{
      name: '商品'
    },
    {
      name: '详情'
    },
    {
      name: '须知'
    }
    ],
    id: '',
    details: {},
    shop: {},
    packages: [],
    startTime: '',
    discuss: {},
    page: 1,
    group: [],
    list_pelpel: [],
    list_time: [],
    allList: [],
    len: '0',
    collecttype: false,
    shad: false,

  },

  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    let openID = wx.getStorageSync('openid')
    // 判断是否登录
    if (openID) { //已经登录
      this.getShopInfo()
    } else { //未登录
      this.getShopInfo()
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 获取商品信息
  getShopInfo: function () {
    let that = this
    let url = app.globalData.api + '/portal/Pintuan/info'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
        'content-type': 'application/json'
      }).then(function (res) {
        // console.log(res.data.data)
        modals.loaded()
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            let details = res.data.data.info
            that.setData({
              details: details,
              shop: res.data.data.shop,
              packages: res.data.data.setmeal
            })
            // 绑定富文本:
            // 产品简介
            let introduce = details.introduce
            WxParse.wxParse('introduce', 'html', introduce, that, 5);
            // 交通信息
            let traffic = details.traffic
            WxParse.wxParse('traffic', 'html', traffic, that, 5);
            // 购买须知
            let buy = details.buy_notice
            WxParse.wxParse('buy', 'html', buy, that, 5);
            that.trailer(details.article_type)
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
  },

  // 活动开始预告
  trailer: function (e) {
    let that = this
    let url = app.globalData.api + '/portal/home/get_foreshow'
    modals.loading()
    request.sendRequest(url, 'post', {
      type: e
    }, {
        'content-type': 'application/json'
      }).then(function (res) {
        modals.loaded()
        // console.log(res.data)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            that.setData({
              startTime: res.data.data
            })
            that.getReview()
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
  },

  // 获取评论
  getReview: function () {
    let that = this
    let data = {
      page: 1,
      length: 1,
      details_id: that.data.details.id
    }
    // console.log(data);
    let url = app.globalData.api + '/portal/home/comment'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function (res) {
      // console.log(res.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            discuss: res.data.data.data
          })
        }
        that.joinGroup()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 拼单情况 - 未登录下
  joinGroup: function () {
    let that = this
    let data = {
      id: that.data.id,
      page: that.data.page,
      length: 6
    }
    let url = app.globalData.api + '/portal/Pintuan/info_desc'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function (res) {
      modals.loaded()
      // console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            group: res.data.data.data,
            len: res.data.data.count
          })
          that.reform_one(that.data.group)
        } else {
          modals.showToast(res.data.status, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 拼单数组重整 ,将数据分为俩组，一组，放置拼团人信息，另一组放置倒计时
  reform_one: function (list) {
    let one = []
    let two = []
    for (let i = 0; i < list.length; i++) {
      let differ = list[i].number - list[i].pt_number
      let ele = {
        id: list[i].id,
        header: list[i].img,
        name: list[i].name,
        nums: differ,
      }
      one.push(ele)
      // let now = Date.parse(new Date()) / 1000
      // let end = list[i].end_time
      // let ctimes = end - now
      // two.push({
      //   dat: ctimes,
      //   dats: ''
      // })
    }
    for (let j = 0; j < one.length; j++) {
      two.push(one.slice(j, j + 2));
    }
    this.setData({
      list_pelpel: two
    })
    // this.countDown()
  },

  // 重构二
  reform_two: function () {
    let that = this;
    let list = that.data.list_time
    let len = list.length; //时间数据长度
    // console.log(list)
    // console.log(len)
    function nowTime() {
      for (let i = 0; i < len; i++) {
        let item = list[i].dat
        if (item > 0) {
          // 天
          let day = Math.floor(item / 3600 / 24);
          let dayStr = day.toString();
          if (dayStr.length == 1) dayStr = '0' + dayStr;
          // 小时
          var hr = Math.floor((item - day * 3600 * 24) / 3600);
          var hrStr = hr.toString();
          if (hrStr.length == 1) hrStr = '0' + hrStr;
          // 分钟
          var min = Math.floor((item - day * 3600 * 24 - hr * 3600) / 60);
          var minStr = min.toString();
          if (minStr.length == 1) minStr = '0' + minStr;
          // 秒
          var sec = item - day * 3600 * 24 - hr * 3600 - min * 60;
          var secStr = sec.toString();
          if (secStr.length == 1) secStr = '0' + secStr;
          list[i].dat--;
          let ctimes = dayStr + ':' + hrStr + ':' + minStr + ':' + secStr
          // console.log(ctimes);
        } else {
          var ctimes = "已结束！";
          clearInterval(timer);
        }
        var index = "list_time[" + i + "].dats"; //这里必须这样拼接
        console.log(index)
        that.setData({ //异步刷新，就是渲染
          //这里进行赋值
          [index]: ctimes //修改值为0
        })
      }
    }
    nowTime();
    // var timer = setInterval(nowTime, 1000);
    console.log(that.data.list_time)

  },
  //列表中的倒计时
  countDown: function () {


  },

  onShow: function () {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.joinGroup_one()
      this.collectState()
    }
  },

  joinGroup_one: function () {
    let that = this
    let data = {
      id: that.data.id,
      page: that.data.page,
      length: 6
    }
    let url = app.globalData.api + '/portal/Pintuan/info_desc'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function (res) {
      modals.loaded()
      // console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            group: res.data.data.data,
            len: res.data.data.count
          })
          that.reform_one(that.data.group)
        } else {
          modals.showToast(res.data.status, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 产品收藏状态
  collectState: function () {
    let that = this
    let url = app.globalData.api + '/portal/Shop/collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
        'token': wx.getStorageSync('openid')
      }).then(function (res) {
        // console.log(res.data);
        modals.loaded()
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            if (res.data.data == 0) { //未收藏
              that.setData({
                collecttype: false
              })
            } else { //收藏
              that.setData({
                collecttype: true
              })
            }
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
  },

  // 收藏
  toCollect: function () {
    let that = this
    let url = app.globalData.api + '/portal/Shop/set_collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
        'token': wx.getStorageSync('openid')
      }).then(function (res) {
        // console.log(res)
        modals.loaded()
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
            that.collectState()
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
  },

  // 取消收藏
  toCanel: function () {
    let that = this
    let url = app.globalData.api + '/portal/Shop/out_collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
        'token': wx.getStorageSync('openid')
      }).then(function (res) {
        // console.log(res)
        modals.loaded()
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
            that.collectState()
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
  },

  // 查看所有拼团
  allGroup: function () {
    let that = this
    let data = {
      id: that.data.id,
      page: that.data.page,
      length: 10
    }
    console.log(data);

  },

  // 关闭弹窗
  toClose: function () {
    this.setData({
      shad: false
    })
  },

  // 去到商铺
  toShop: function (e) {
    wx.navigateTo({
      url: '/pages/index/goods/shop/shop?sid=' + e.currentTarget.dataset.sid,
    })
  },

  // 立即预定
  toOrder: function () {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let data = {
        id: this.data.details.id,
        tao: this.data.packages,
        uid: '',
        price: this.data.details.pt_price
      }
      console.log('参数：', data)
      wx.navigateTo({
        url: '/pages/buy_typetwo/buy_typetwo?data=' + JSON.stringify(data),
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },


  // 去拼团，下单
  togroup: function (e) {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let data = {
        id: this.data.details.id,
        tao: this.data.packages,
        uid: e.currentTarget.dataset.id,
        price: this.data.details.pt_price
      }
      console.log('参数：', data)
      wx.navigateTo({
        url: '/pages/buy_typetwo/buy_typetwo?data=' + JSON.stringify(data),
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 禁止手动滑动
  catchTouchMove: function (res) {
    return false
  },

  onPullDownRefresh: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
    this.onLoad();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (options.from === 'button') { }
    return {
      title: this.data.details.title,
      path: '/pages/group_detail/group_detail?id=' + this.data.id,
    }
  }
})
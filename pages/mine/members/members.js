const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()
const WxParse = require('../../../wxParse/wxParse.js')

Page({

  data: {
    person: [],
    cardlist: [],
  },

  onLoad: function(options) {
    let person = JSON.parse(options.data)
    this.setData({
      person: person
    })
    this.getAllCard()
  },

  // 所有会员卡
  getAllCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Level/index'
    request.sendRequest(url, 'post', {}, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data
          // 循环解析富文本
          let arr = []
          for (let i = 0; i < list.length; i++) {
            WxParse.wxParse('member_introduce' + i, 'html', list[i].member_introduce, that);
            if (i === list.length - 1) {
              WxParse.wxParseTemArray("WxParseListArr", 'member_introduce', list.length, that);
            }
          }
          let listArr = that.data.WxParseListArr;
          listArr.forEach((item, index) => {
            list[index].contentCopy = item;
            arr.push(list[index])
          })
          that.setData({
            cardlist: list
          })
        }
      }
    })
  },

  // 会员卡购买,续费
  toBuy: function(e) {
    let that = this
    let level = e.currentTarget.dataset.level
    console.log('选择的卡片等级：', level)
    let m_level = that.data.person.level
    console.log('当前的会员等级:', m_level)
    if (level >= m_level) {
      console.log(111)
      let url = app.globalData.api + '/portal/Level/level_upgrade'
      request.sendRequest(url, 'post', {
        level: e.currentTarget.dataset.level
      }, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        console.log(res.data)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            let oid = res.data.data
            that.pay_memont(oid)
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    } else {
      modals.showToast('请选择高于或等于您当前等级的会员卡', 'none')
    }
  },

  // 支付
  pay_memont: function(e) {
    console.log('订单ID：', e)
    let that = this
    let url = app.globalData.api + '/portal/Pay/do_pay'
    request.sendRequest(url, 'post', {
      order_id: e
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let result = res.data.data
          console.log(result)
          wx.requestPayment({
            timeStamp: result.timeStamp,
            nonceStr: result.nonceStr,
            package: result.package,
            signType: result.signType,
            paySign: result.paySign,
            success: function(res) {
              modals.showToast('支付成功', 'success')
            },
            fail: function(res) {
              modals.showToast('支付失败', 'loading')
            }
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 积分签到
  toIntegral: function() {
    wx.navigateTo({
      url: '/pages/mine/sign_in/sign_in',
    })
  },

  // 积分抽奖
  toDraw: function() {
    wx.navigateTo({
      url: '/pages/mine/draw/draw',
    })
  }

})
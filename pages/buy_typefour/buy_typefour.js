// 门票下单
const request = require('../../utils/http.js')
import modals from '../../utils/modal.js'
const app = getApp()

Page({


  data: {
    id: '',
    //出发地
    startPlace: [],
    region: '请选择出发地址',

    name: '',
    mobile: '',
    identity: '',

    total: '0.00'
  },

  onLoad: function(options) {
    this.setData({
      id: options.id
    })

    // 判断缓存中是否存在infos
    let infos = wx.getStorageSync('putInfo') || ''
    if (infos) {
      this.setData({
        name: infos.name,
        mobile: infos.mobile,
        identity: infos.identity
      })
    }

  },

  // 选择出发地
  bindRegionChange: function(e) {
    let address = e.detail.value
    this.setData({
      region: address[0] + '-' + address[1] + '-' + address[2]
    })
  },

  // 获取姓名
  toGetName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 获取手机号
  toGetPhone: function(e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  // 获取身份证
  toGetIdentity: function(e) {
    this.setData({
      identity: e.detail.value
    })
  },

  // 下单
  toOrder: function() {
    let that = this
    let place = that.data.region
    let name = that.data.name
    let phone = that.data.mobile
    let identity = that.data.identity
    // 验证
    if (place == "请选择出发地址") {
      modals.showToast('请选择您的出发地', 'none')
    } else if (!name) {
      modals.showToast('请输入您的姓名', 'none')
    } else if (!phone) {
      modals.showToast('请输入您的手机号码', 'none')
    } else if (!(/^1[34578]\d{9}$/.test(phone))) {
      modals.showToast('手机号码有误，请重新输入', 'none')
    } else if (!identity) {
      modals.showToast('请输入身份证号码', 'none')
    } else if (!identity || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(identity)) {
      modals.showToast('身份证号码有误，请重新输入', 'none')
    } else {
      let data = {
        id: that.data.id,
        name: name,
        mobile: phone,
        identity: identity,
        starting: place
      }
      let url = app.globalData.api + '/portal/Kanjia/get_kanjia'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        console.log(res.data)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast('下单完成', 'loading')
            setTimeout(function() {
              wx.redirectTo({
                url: '/pages/tickets_detail/tickets_detail?id=' + res.data.data,
              })
            }, 500)
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  }
})
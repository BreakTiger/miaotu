const request = require('../../utils/http.js')
import modals from '../../utils/modal.js'
const app = getApp()

Page({

  data: {
    id: '',

    name: '',
    code: '',
    phone: ''
  },

  onLoad: function(options) {
    let data = app.globalData.item
    console.log(data)
    if (data.id) {
      this.setData({
        id: data.id,
        name: data.name,
        code: data.identity,
        phone: data.tel
      })
    }
  },

  // 姓名
  getname: function(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 证件号码
  getcode: function(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 手机号
  getphone: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 操作
  toControl: function() {
    let that = this
    let id = that.data.id
    if (id) {
      that.change()
    } else {
      that.add()
    }
  },

  // 添加
  add: function() {
    let that = this
    let name = that.data.name
    let code = that.data.code
    let phone = that.data.phone
    if (!name) {
      modals.showToast('请输入您的姓名', 'none')
    } else if (!phone) {
      modals.showToast('请输入您的手机号码', 'none')
    } else if (!(/^1[34578]\d{9}$/.test(phone))) {
      modals.showToast('手机号码有误，请重新输入', 'none')
    } else if (!code) {
      modals.showToast('请输入身份证号码', 'none')
    } else if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
      modals.showToast('身份证号码有误，请重新输入', 'none')
    } else {
      let data = {
        name: name,
        tel: phone,
        identity: code
      }
      console.log(data)
      let url = app.globalData.api + '/portal/contacts/add'
      modals.loading()
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        modals.loaded()
        console.log(res)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            console.log(res.data)
            modals.showToast(res.data.msg, 'success');
            setTimeout(function() {
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          } else {
            modals.showToast(res.data.msg, 'none');
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })

    }
  },

  // 修改
  change: function() {
    let that = this
    let id = that.data.id
    let name = that.data.name
    let code = that.data.code
    let phone = that.data.phone
    if (!name) {
      modals.showToast('请输入您的姓名', 'none')
    } else if (!phone) {
      modals.showToast('请输入您的手机号码', 'none')
    } else if (!(/^1[34578]\d{9}$/.test(phone))) {
      modals.showToast('手机号码有误，请重新输入', 'none')
    } else if (!code) {
      modals.showToast('请输入身份证号码', 'none')
    } else if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
      modals.showToast('身份证号码有误，请重新输入', 'none')
    } else {
      let data = {
        id: that.data.id,
        name: name,
        tel: phone,
        identity: code
      }
      console.log(data)
      let url = app.globalData.api + '/portal/contacts/edit'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'success');
            setTimeout(function() {
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          } else {
            modals.showToast(res.data.msg, 'none');
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  // 删除
  toDel: function() {
    let that = this
    let data = {
      id: that.data.id
    }
    let url = app.globalData.api + '/portal/contacts/delete'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'success');
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })

  },


})
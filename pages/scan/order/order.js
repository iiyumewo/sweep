const util = require('../../../utils/util.js')
const app = getApp();
var orderId;
var gtotalPrice = ""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyes: null,
    isLoad: true,
    scrollHeight:750,
    totalPrice:""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    orderId = app.globalData.tableMe.orderId;
    var that = this;
    // 查询订单
    util.wxRequest(app.globalData.domain + '/sweep/get_order/', { orderId: orderId}, data => {
      console.log(data)
      if (data.status == 200) {
        var dshlist = data.orders
        gtotalPrice = data.altogether
        that.setData({
          classifyes: dshlist,
          totalPrice: gtotalPrice
        })
      } else {
        wx.showToast({
          title: '拉去购物车出现错误',
        })
      }
    }, data => { }, data => { });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindPay: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + '/sweep/wxpay/pay/',
      method: "POST",
      data: {
        openid: app.globalData.openid,
        orderPrice: gtotalPrice,
        orderId: orderId
      },
      success: function (res) {
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: res.data.data.package,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          'success': function (res) {
            wx.request({
              url: app.globalData.domain + '/sweep/wxpay/notify/',
              method: "POST",
              data: {
                openid: app.globalData.openid,
                orderId: orderId,
                room: app.globalData.gsellId + app.globalData.gtableNum,
                totalPrice: gtotalPrice
              },
              success: function (res) {
                wx.showToast({
                  title: '支付成功',
                })
                app.globalData.tableMe.isOrder = 0
                app.globalData.tableMe.orderId = null
                console.log("socket",app.globalData.socket)
                if (app.globalData.socket) {
                  app.globalData.socket.emit('payment', { openid: app.globalData.openid })
                  wx.redirectTo({
                    url: '/pages/scan/payment/payment',
                  })
                }
              }
            })
          },
          'fail': function (res) {
            wx.showToast({
              title: '支付失败',
            })
          }
        })
      }
    })
  }
})
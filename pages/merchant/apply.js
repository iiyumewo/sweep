const util = require('../../utils/util.js')
const config = require('../../config.js')
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isdisabled : false
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.src = '/audio/warning.mp3';
    innerAudioContext.onPlay(() => { });//播放音效
    innerAudioContext.onError((res) => {
      console.log(res.errMsg);//错误信息
      console.log(res.errCode);//错误码
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 跳转商家界面
  consent: function (e) {
    this.setData({
      isdisabled: true
    })
    var sellName = e.detail.value.input
    if (sellName === "" || sellName == null){
      wx.showToast({
        title: '请输入商家名',
      })
      this.setData({
        isdisabled: false
      })
      return;
    }
    util.wxRequest(app.globalData.domain + '/merchant/change_behalf/', { openid: app.globalData.openid, behalf: 1, sellName: sellName}, 
    data => {
      console.log(data)
      if (data.status == 200){
        // 成为商家后 重新获取一下用户数据
        wx.login({
          success: res => {
            if (res.code) {
              var params = {
                code: res.code,
                openid: app.globalData.openid
              }
              util.wxRequest(app.globalData.domain + '/sweep/get_user/', params, data => {
                if (data.status == 200) {
                  app.globalData.userInfo = data.user
                  app.globalData.sellInfo = data.sell_info
                  app.globalData.login = true
                  config.login = true
                  config.openid = app.globalData.openid
                  wx.redirectTo({
                    url: '/pages/merchant/homepage/homepage',
                  })
                }
              }, data => { }, data => { });
            }
          }
        })
      }else{
        wx.showToast({
          title: '创建失败',
        })
      }
    }, data => { }, data => { })
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

  }
})
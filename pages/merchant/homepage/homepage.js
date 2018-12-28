const util = require('../../../utils/util.js')
const config = require('../../../config.js')
const app = getApp();
var gsellInfo = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sellName:"",
    sellImgUrlOne:""
  },
  commodity:function(){
    util.navigateTo('/pages/merchant/commodity/commodity', data => {

    }, data => { }, data => { })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gsellInfo = app.globalData.sellInfo;
    this.setData({
      sellName: gsellInfo.sellName,
      sellImgUrlOne: gsellInfo.sellImgUrlOne
    })
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

  }
})
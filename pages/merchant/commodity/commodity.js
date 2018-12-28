const util = require('../../../utils/util.js')
const config = require('../../../config.js')
const app = getApp();
var gsellId = null;
/**
 * 方法注释
 * redact：商品编辑按钮，跳转编辑界面
 * addition：添加商品，跳转添加商品界面
 * addClassify：添加分类，跳转添加分类界面
 */
Page({
  /**
   * 页面的初始数据
   * scrollHeight:适配用的，可滑动高度
   * sellInfo:商家所有信息
   */
  data: {
    toView:"b0",
    scrollHeight: 1084,
    sellInfo:null,
    index:0
  },

  // 跳转编辑商品界面
  redactCuisine:function(e){
    var cuisinesId = e.currentTarget.dataset.cuisinesId
    var cuisinesIndex = e.currentTarget.dataset.cuisinesIndex
    var classifyId = e.currentTarget.dataset.classifyId
    wx.navigateTo({
      url: '/pages/merchant/commodity/redact/redact?cuisinesId=' + cuisinesId + "&classifyId=" + classifyId + "&cuisinesIndex=" + cuisinesIndex,
    })
  },
  addition: function () {
    wx.navigateTo({
      url: '/pages/merchant/commodity/addition/addition',
    })
  },
  addClassify: function () {
    wx.navigateTo({
      url: '/pages/merchant/commodity/classify/classify',
    })
  },
  // 点击切换分类，并且显示菜品
  pitchCuisine: function (e) {
    var classifyIndex = e.target.dataset.classifyIndex
    var id = e.target.dataset.id
    this.setData({
      index: classifyIndex,
      toView: "b" + id
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gsellId = app.globalData.sellInfo.id
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
    var that = this;
    var height = (wx.getSystemInfoSync().windowHeight * 2) - 180;
    this.setData({
      scrollHeight: height >= 994 ? 1084 : height
    })
    util.wxRequest(app.globalData.domain + '/merchant/get_sell_cuisine/', { sellId: gsellId }, data => {
      var classifyes = data.classify
      app.globalData.classifyes = classifyes
      that.setData({
        sellInfo: classifyes
      })
    }, data => { }, data => { });
  },
  // 浏览菜品大图
  browseCuisine: function (e) {
    wx.previewImage({
      urls: [e.target.dataset.urlImage],
    })
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
const util = require('../../../../utils/util.js')
const config = require('../../../../config.js')
const app = getApp();
var gsellId = null;
var gcuisinesId = null;
var gclassifyMg = null;
Page({
  /**
   * 页面的初始数据
   * sava:保存是否显示
   */
  data: {
    classifyes: [],
    classifyMg: null,
    index: 0,
    savaHide:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gcuisinesId = options.cuisinesId
    gsellId = app.globalData.sellInfo.id

    util.wxRequest(app.globalData.domain + '/merchant/get_classify/', { sellId: gsellId }, data => {
      var classifye = app.globalData.classifyes[options.classifyId]
      gclassifyMg = classifye.cuisines[options.cuisinesIndex]
      console.log(gclassifyMg)
      this.setData({
        classifyes: data.classify,
        classifyMg: gclassifyMg,
        index: classifye.id
      })
    }, data => { }, data => { });
  },
  // 选择分类
  cutClassify: function (e) {
    var classifyIndex = e.currentTarget.dataset.classifyIndex
    console.log(classifyIndex)
    this.setData({
      index: classifyIndex,
      savaHide:true
    })
  },
  // 下架
  soldOut:function(e){
    var that = this;
    util.wxRequest(app.globalData.domain + '/merchant/soldout_cuisine/', { cuisineId: gcuisinesId, operation:0}, data => {
      console.log(data)
      if (data.status == 200){
        gclassifyMg.cuisineStatus = 1
        that.setData({
          classifyMg: gclassifyMg
        })
        wx.showToast({
          title: '下架成功',
        })
      }
    }, data => { }, data => { });
  },
  // 上架
  putaway:function(e){
    var that = this;
    util.wxRequest(app.globalData.domain + '/merchant/soldout_cuisine/', { cuisineId: gcuisinesId, operation: 2 }, data => {
      console.log(data)
      if (data.status == 200) {
        gclassifyMg.cuisineStatus = 0
        that.setData({
          classifyMg: gclassifyMg
        })
        wx.showToast({
          title: '上架成功',
        })
      }
    }, data => { }, data => { });
  },
  // 删除
  remove:function(e){
    util.wxRequest(app.globalData.domain + '/merchant/soldout_cuisine/', { cuisineId: gcuisinesId, operation: 1 }, data => {
      console.log(data)
      if (data.status == 200) {
        wx.navigateBack({
          delta: 1
        })
        wx.showToast({
          title: '删除成功',
        })
      } else if (data.status == 400){
        wx.showToast({
          title: '用户正在购买，暂不能删除',
        })
      }
    }, data => { }, data => { });
  },
  // 保存
  addClassify: function (e) {
    console.log(e)
    var name = e.detail.value.name;
    var price = e.detail.value.price;
    var classify = e.detail.value.classify
    var parameter = {
      name: name,
      cuisineId: gcuisinesId,
      total: price,
      classifyId: parseInt(classify),
      operation: 1
    }
    util.wxRequest(app.globalData.domain + '/merchant/add_cuisine/', parameter, data => {
      
    }, data => { }, data => { });
  },
  // 监听输入事件
  inputAffair:function(){
    this.setData({
      savaHide: true
    })
  },
  // 设为精选
  setHandpick:function(){
    console.log("设为精选")
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
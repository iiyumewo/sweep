const util = require('../../../../utils/util.js')
const config = require('../../../../config.js')
var uploadImage = require('../../../../libs/AlOSS/uploadFile.js');
const app = getApp();
var gsellId = null;
var cuisineUrl = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyes: [],
    img_src:'',
    index:0
  },
  addCommodity:function(e){
    var name = e.detail.value.name;
    var price = e.detail.value.price;
    var classify = e.detail.value.classify
    console.log(cuisineUrl)
    if (cuisineUrl == null){
      wx.showToast({
        title: '请上传菜品图片',
      })
      return;
    }
    var parameter = {
      img_src: cuisineUrl,
      name: name,
      sellInfoId: parseInt(gsellId),
      total: price,
      classifyId: parseInt(classify),
      operation: 0
    }
    util.wxRequest(app.globalData.domain + '/merchant/add_cuisine/', parameter, data => {
      if (data.status == 200) {
        wx.showToast({
          title: '添加成功',
        })
      }
    }, data => { }, data => { });
  },
  cutClassify:function(e){
    console.log(e)
    var classifyIndex = e.currentTarget.dataset.classifyIndex
    console.log(classifyIndex)
    this.setData({
      index: classifyIndex
    })
  },
  play:function(){
    var that = this;
    wx.chooseImage({
      count: 6, // 默认最多一次选择9张图
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var nowTime = util.formatTime(new Date());

        //支持多图上传
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          //显示消息提示框
          wx.showLoading({
            title: '上传中' + (i + 1) + '/' + res.tempFilePaths.length,
            mask: true
          })
          //上传图片
          uploadImage(res.tempFilePaths[i], 'sweep_imges/cuisine/',
            function (result) {
              that.setData({
                img_src: result
              })
              cuisineUrl = result
              wx.hideLoading();
            }, function (result) {
              console.log("======上传失败======", result);
              wx.hideLoading()
            }
          )
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gsellId = app.globalData.sellInfo.id
    util.wxRequest(app.globalData.domain + '/merchant/get_classify/', { sellId: gsellId }, data => {
      var classifyes = data.classify
      this.setData({
        classifyes: classifyes
      })
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

  }
})
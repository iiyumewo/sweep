const util = require('../../../../utils/util.js')
const config = require('../../../../config.js')
const app = getApp();
var gsellId = null;
/**
 * addClassify:点击添加分类 进行请求接口
 * showClassify:点击添加分类触发显示输入框
 * delect:删除分类
 */
Page({
  /**
   * 页面的初始数据
   * hide:控制电机分添加分类之后 隐藏
   * classifyes:获取商家所有分类
   * searchinput:控制输入框内容
   */
  data: {
    searchinput:'',
    hide:true,
    classifyes:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gsellId = app.globalData.sellInfo.id
    util.wxRequest(app.globalData.domain + '/merchant/get_classify/', { sellId: gsellId}, data => {
      var classifyes = data.classify
      this.setData({
        classifyes: classifyes
      })
    }, data => { }, data => { });
  },
  showClassify:function(){
    this.setData({
      hide:false
    })
  },
  // 增加分类
  addClassify:function(e){
    var classifyName = e.detail.value.classifyName
    console.log(classifyName)
    if (classifyName != undefined || classifyName != ' ' || classifyName == null){
      util.wxRequest(app.globalData.domain + '/merchant/add_classify/', { name: classifyName, sellId: gsellId }, data => {
        console.log(data)
        var classifyes = data.classify
        this.setData({
          searchinput: '',
          classifyes: classifyes
        })
      }, data => { }, data => { });
    }else{
      wx.showToast({
        title: '请输入分类名字',
      })
      return;
    }
  },
  // 删除分类
  delect:function(e){
    var that = this;
    wx.showModal({
      title: '删除分类',
      content: '确定要删除分类?',
      success(res) {
        if (res.confirm) {
          var classifyId = e.target.dataset.classifyId
          console.log(classifyId)
          util.wxRequest(app.globalData.domain + '/merchant/del_classify/', { classifyId: classifyId, sellId: gsellId }, data => {
            if (data.status == 203){
              wx.showToast({
                title: '当前分类有菜品无法删除',
              })
              return;
            }
            var classifyes = data.classify
            that.setData({
              classifyes: classifyes
            })
          }, data => { }, data => { });
        }
      }
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
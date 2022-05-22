const BaseRest = require('./rest.js');
const Core = require('@alicloud/pop-core');
const { getCaptcha,saveUserStatusByjwt,getParams } = require("../utills/utills")
const fs = require('fs');
const path = require('path');
const rename = think.promisify(fs.rename, fs);
const { v4: uuidv4 } = require('uuid');
const request = require('request');
const { where } = require('../model/qq_login.js');
module.exports = class extends BaseRest {
  async __before() {
    return true;
  }
  getAllAction() {
    return this.success()
  }
  // 获取用户
  async getAction() {
    let {
      Fuser_id,
      all,
      Fnickname,
      Fphone,
      Funion_id,
      Fstatus,
      Finsert_time,
      Fupdate_time,
      current,
      pageSize,
      sortField
    }  = this.get()
    let data = {}

    if(Fuser_id){
      // id 查询
      data = await this.model('user').where({Fuser_id}).find()
    }else{
      if(all == 1){
        // 查询全部
        data = await this.model('user').where().select()
      }else{
        // 分页查询
        let searchWhereParams = {
          Fphone,
          Funion_id,
          Fstatus,
          Finsert_time,
          Fupdate_time,
          Fnickname,
        }
        searchWhereParams =   this.ctx.handleSearchParams(searchWhereParams)
        
        // 添加需要模糊查询的字段
        searchWhereParams.Fnickname && (searchWhereParams.Fnickname = ['like', `%${searchWhereParams.Fnickname}%`])

        // 查询时间段
        // 查询具体时间
        //searchWhereParams.Finsert_time = '2022'
        // 处理额外字段
        if(searchWhereParams.Fstatus == 0) delete searchWhereParams.Fstatus
        let searchSortParams = {}
        // ascend 升序 descend 降序
        if(typeof sortField == 'string')sortField = JSON.parse(sortField)
        if(sortField && Object.keys(sortField).length){
          for(let key in sortField){
            if(sortField[key] == 'ascend'){
              // sortField[key]  = 'ASC'
              searchSortParams[key] = 'ASC'
            }
            if(sortField[key] == 'descend'){
              // sortField[key]  = 'DESC'
              searchSortParams[key] = 'DESC'
            }
          }
        }
        data = await this.model('user').page(current,pageSize).order(searchSortParams).where(searchWhereParams).countSelect()
      }
    }
    
   
    return this.success(data)
  }

  // 添加用户

  // 更新用户
  async putAction() {
     try {
      let {
        Fuser_id,
        Faccount_number,
        Fpassword,
        Fnickname,
        Fphone,
        Fstatus,
     
      }  = this.post()
      let data 
       console.log('this.post()',this.post())
      // 处理参数
  
      // updateData 最终要更新的数据
      let updateData = {
        Faccount_number,
        Fpassword,
        Fnickname,
        Fphone,
        Fstatus,
        Fupdate_time:this.ctx.dataTime()
      }
      if(Fuser_id){
        // id 单个更新
        data = await this.model('user').where({Fuser_id}).update(updateData)
        // 返回data = 1
         console.log('data8888888888888',data)
      }else{
        // 多个更新
      }
      return this.success(data)
     } catch (error) {
        if(error){
          this.fail("更新失败" + error + '')
        }
     }
  }
  // 删除用户


  // 用户注册
  async registerAction() {
    try {
      // 
      let {
        Faccount_number,
        Fpassword,
        Fnickname,
        Fphone,
        captcha
      } = this.post()

      // 从session中获取
      const phoneRegisterCatpcha = await this.session('phoneRegisterCatpcha');
  
      // 查询数据库中 Faccount_number 是否存在确保账户不重复
      let data = await this.model('user').where({Faccount_number}).select()
      if(data && data.length){
        return this.fail("账户已经存在,请重新输入账户")
      }
      if (!phoneRegisterCatpcha) {
        return this.fail("phoneRegisterCatpcha未获取到")
      }
      if (Date.now() > phoneRegisterCatpcha.expire) {
        return this.fail("验证码已经过期")
      }
      if (captcha !== phoneRegisterCatpcha.code) {
        return this.fail("验证码不正确")
      }

      let addData = {
        Faccount_number,
        Fpassword,
        Fnickname,
        Fphone,
        Finsert_time : this.ctx.dateTime(),
        Fupdate_time : this.ctx.dateTime()
      }

      let res = await this.model('user').add(addData)
      if (res) {
        await this.session('phoneRegisterCatpcha', null);
      }
      return this.success(res)
    } catch (error) {

      if(error)error = error + ''
      console.log("error", error)
      return this.fail(error)
    }
  }
  // 账号密码登陆
  async loginByCountAction() {
    try {
      let {
        Faccount_number,
        Fpassword,
        autoLogin
      } = this.post()
      // 注册时已经保证 保证Faccount_number 唯一的 以确认是唯一用户
      // 更具账号 密码 查询出该用户

      // 使用select 查询不到数据时 是空数组还是 null 需要确认
      let data = await this.model('user').where({ Faccount_number,Fpassword }).find()
      console.log('data',data)
      if(data && data.Fuser_id){
          // 查询到该用户 返回用户信息
          let currentUser  = {
            nickname:data.Fnickname,
            phone:data.Fphone
          }
          saveUserStatusByjwt(this,currentUser,autoLogin,data.Fuser_id)
          return this.success(data)

      }else{
        // 没有查询到该用户
        return this.fail("账号或者密码不正确")
      }
    } catch (error) {
    }
  }
  // 手机号登陆
  async loginByPhoneAction() {
    try {
      let {
        Fphone,
        captcha,
        autoLogin
      } = this.post()
      let data = await this.model('user').where({ Fphone }).find()
      if (data && data.Fuser_id) {
        const phoneLoginCatpcha = await this.session('phoneLoginCatpcha');
        if (!phoneLoginCatpcha) {
          return this.fail("phoneLoginCatpcha未获取到")
        }
        if (Date.now() > phoneLoginCatpcha.expire) {
          return this.fail("验证码已经过期")
        }
        if (captcha !== phoneLoginCatpcha.code) {
          return this.fail("验证码不正确")
        }
        //校验通过 登陆成功 返回用户信息
      
        let currentUser  = {
          nickname:data.Fnickname,
          phone:data.Fphone
        }
        saveUserStatusByjwt(this,currentUser,autoLogin,data.Fuser_id)
        await this.session('phoneLoginCatpcha', null);
        return this.success(data)
      } else {
        return this.fail("该手机号还未注册,请先注册")
      }
    } catch (error) {
      this.fail(error + '')
    }
  }
  // 获取登陆的手机验证码
  async getLoginCaptchaAction() {
    try {
      let { phone } = this.get()
      let data = await this.model('user').where({ Fphone: phone }).select()
      if (data && data.length == 0) {
        return this.fail("该手机号还未注册,请先注册")
      }
      let code = ""
      for (let i = 0; i < 4; i++) {
        code = code + parseInt(Math.random() * 9 + 1)
      }
      console.log("code", code)
      let phoneLoginCatpcha = {
        code,
        expire: Date.now() + 60 * 1000
      }
      await this.session('phoneLoginCatpcha', phoneLoginCatpcha);
 
     let res = await getCaptcha(phone, code)
      return this.success(res)
    } catch (error) {
      
      this.fail(error + '')
    }
  }
  // 或者注册的手机验证码
    async getCaptchaAction() {
    console.log("123456456")
    let { phone } = this.get()
    let data = await this.model('user').where({ Fphone: phone }).select()
    if (data && data.length > 0) {
      return this.fail("该手机号已经被注册,请前往登陆")
    }
    let code = ""
    for (let i = 0; i < 4; i++) {
      code = code + parseInt(Math.random() * 10)
    }
    console.log("code", code)
    let phoneCatpcha = {
      code,
      expire: Date.now() + 60 * 1000
    }
    await this.session('phoneRegisterCatpcha', phoneCatpcha);
  
    let res = await getCaptcha(phone, code)
    return this.success(res)
  }
  // 退出登陆
  async outLoginAction(){
    // 清空cookie中token和 Fuser_id
    let {
      Fuser_id
    } = this.post()
    this.cookie('Fuser_id',null)
    this.cookie('token',null)
  }
 // 上传头像
  async avatarUploadAction(){

    const file = this.file();
    // 如果上传的是 png 格式的图片文件，则移动到其他目录
    let imageFile =  file.file
   // const filepath = path.join(think.ROOT_PATH, 'runtime/upload/a.png');
    
   let uuid =  uuidv4()
   let name =  imageFile.name.split('.')[0]  // 名称
   let ext = imageFile.name.split('.')[1]    // 后缀
    let newImageName = `${name}---${uuid}.${ext}`
   // let data = fs.readFileSync(imageFile.path) // 读出图片文件 是buffer
    let readPath = imageFile.path
    let writePath = path.join(think.ROOT_PATH, 'www/static/image/' + newImageName);
    let  readStrem = fs.createReadStream(readPath)
    let  writeStrem = fs.createWriteStream(writePath)
    readStrem.pipe(writeStrem)

    // 返回可以访问的url
    // http://127.0.0.1:8360/static/image/1---6bf185e6-01d8-43b4-98c5-3b0ece055541.jpg
    
   console.log('this.ctx.origin',this.ctx.origin)
    let Favatar = `${this.ctx.origin}/static/image/${newImageName}`
    
    // 将地址保存到数据库中
    let Fuser_id = this.cookie('Fuser_id')
    await this.model('user').where({Fuser_id}).update({Favatar,Fupdate_time:this.ctx.dataTime()})
    return  this.success(Favatar)
   // rename 跨磁盘会有问题
   // await rename(imageFile.path, filepath)
    
   // 这里将图片上传到了本台部署后端服务的服务器上
   // 可以将图片上传到cdn上 上传到cdn有什么好处
    
  }

// 忘记密码 验证码
  async getForgetPassWordCaptchaAction(){
    try {
      let { phone } = this.get()
      let data = await this.model('user').where({ Fphone: phone }).find()
        if (data && data.length == 0) {
          return this.fail("该手机号还未注册,请先注册")
        }
        let code = ""
        for (let i = 0; i < 4; i++) {
          code = code + parseInt(Math.random() * 10)
        }
        console.log("code", code)
        let forgetPassWordCaptcha = {
          code,
          expire: Date.now() + 60 * 1000
        }
        await this.session('forgetPassWordCaptcha', forgetPassWordCaptcha);
      
        let res = await getCaptcha(phone, code)
        return this.success(res)
    } catch (error) {
       this.fail('获取验证码失败--' + error)
    }
 

  }

// 重置登陆密码
 async resetLoginPassWordAction(){
   try {
        let {
          Faccount_number,
          Fpassword,
          Fphone,
          captcha
        } = this.post()

        let dataByPhone = await this.model('user').where({ Fphone }).find()
         if(!dataByPhone.Fuser_id){
            return this.fail('该手机号尚未绑定任何账号,请先前往注册')
         }
         let dataByFaccountNumber = await this.model('user').where({ Faccount_number}).find()
         if(!dataByFaccountNumber.Fuser_id){
            return this.fail('账号不存在,请先注册')
         }
         const forgetPassWordCaptcha = await this.session('forgetPassWordCaptcha');
         if (!forgetPassWordCaptcha) {
          return this.fail("forgetPassWordCaptcha未获取到")
        }
        if (Date.now() > forgetPassWordCaptcha.expire) {
          return this.fail("验证码已经过期")
        }
        if (captcha !== forgetPassWordCaptcha.code) {
          return this.fail("验证码不正确")
        }

        let updateData = {
          Faccount_number,
          Fpassword,
          Fphone,
        }
        let res = await this.model('user').where({ Faccount_number,Fphone}).update(updateData)

        if(res){
          return  this.success(res)
        }else{
          return this.fail('重置密码失败')
        }
   } catch (error) {
     
    this.fail('重置密码失败--' + error)
   }
  

 }

// 获取账号
  async getFaccountNumberAction(){
    let {
      phone,
    } = this.get()
    let data = await this.model('user').where({ Fphone :phone}).find()
    if(data){
      return this.success({Faccount_number:data.Faccount_number})
    }
  }

// 获取第三方登陆QQ用户信息
  async getQQUserInfoAction(){
    let { code } = this.get()
    console.log('code',code)
    try {
      if(code){
        let accessTokenParamsObj = {
          grant_type:'authorization_code',
          client_id:'101984051',
          client_secret:'1c1932095d08306a027d769898153f63',
          redirect_uri:'http://www.lashiyong.top/welcome',
          fmt:'json',
          code,
        }
        let accessTokenParamsStr = getParams(accessTokenParamsObj) // 'a=1&b=2'
        let getAccessTokenUrl = `https://graph.qq.com/oauth2.0/token?${accessTokenParamsStr}`
        console.log('getAccessTokenUrl',getAccessTokenUrl)
        // let res =  await request(getAccessTokenUrl)
        let userService = think.service('user');
        // 获取AccessToken
        let resGetAccessToken = await userService.getAccessToken(code) // 如果是失败的promise 会终止执行 被try catch捕捉结果
        // code 只能用一次 code 10 分钟内会过期
        console.log('resGetAccessToken',resGetAccessToken)
        // 获取 获取 unionid 和 openid
        let access_token = resGetAccessToken.access_token
        let resGetOpenId = await userService.getOpenId(access_token)
        console.log('resGetOpenId',resGetOpenId)
        let openid = resGetOpenId.openid
        let resGetUserInfo = await userService.getUserInfo(access_token,openid)
        console.log('resGetUserInfo',resGetUserInfo)
        // 获取用户信息

        // 根据unionid QQ用户唯一Id 查询是否有该用户
        let unionid = resGetOpenId.unionid
        let currentUser = await this.model('user').where({ Funion_id:unionid }).find()
        if(currentUser.Fuser_id){
           // 有该用户
           // 保存用户登陆状态
           currentUser = {
             ...currentUser
           }
           saveUserStatusByjwt(this,currentUser,false,currentUser.Fuser_id)

           // 将最新的用户信息保存到数据库中
           let updateData = {
            Fnickname:resGetUserInfo.nickname,
            Favatar:resGetUserInfo.figureurl_qq,
            Fupdate_time:this.ctx.dataTime(),
           }
          await this.model('user').where({ Funion_id:unionid }).update(updateData)
        }else{
           // 没有该用户 添加进去
           let addData = {
            Funion_id:unionid,            // QQ唯一识别ID
            Fnickname:resGetUserInfo.nickname,  // QQ昵称
            Favatar:resGetUserInfo.figureurl_qq, // QQ头像
            Finsert_time:this.ctx.dataTime(),
            Fupdate_time:this.ctx.dataTime(),
          }
          let Fuser_id = await this.model('user').add(addData)
           currentUser = await this.model('user').where({Fuser_id}).find()
          console.log('currentUser',currentUser)
        }
        // 将上述三个结果包装一下返回

        let res = {
          getAccessToken :{
            ...resGetAccessToken,
          },
          getOpenId :{
            ...resGetOpenId,
          },
          getUserInfo :{
            ...resGetUserInfo,
          },
          currentUser,
        }
        return this.success(res)
        // request(getAccessTokenUrl,async (error,response,body)=>{
        //       if(error){
        //         return this.fail("" + error)
        //       }else if(response.statusCode == 200){
        //         // {"error":100020,"error_description":"code is reused error"} 
        //         console.log('body',body)
        //         let resAccessToken = JSON.parse(body)
        //         if(resAccessToken.error){
        //           console.log('this',this)
        //           return this.fail(body + '')
        //         }else{
        //           let access_token = resAccessToken.access_token
                
        //           let openIdParamsObj = {
        //             access_token,
        //             unionid:1,
        //             fmt:'json'
        //           }
        //           let openIdParamsStr = getParams(openIdParamsObj)
        //           // 获取 unionid 和 openid
        //           let getOpenIdUrl  = `https://graph.qq.com/oauth2.0/me?${openIdParamsStr}`
        //           request(getOpenIdUrl,async (error,response,body)=>{
        //             if(error){
        //               return this.fail(error + '')  
        //             }else if(response.statusCode == 200){
        //               let resOpenId = JSON.parse(body)
        //                if(resOpenId.error){
        //                  return this.fail(body)
        //                }else{
        //                  let openid = resOpenId.openid
        //                  let unionid = resOpenId.unionid
        //                  let getUserInfoUrlParamsObj = {
        //                   access_token,
        //                   oauth_consumer_key : '101984051',
        //                   openid,
        //                  }
        //                  let getUserInfoUrlParamsStr = getParams(getUserInfoUrlParamsObj)
        //                  // 获取用户信息
        //                  let getUserInfoUrl = `https://graph.qq.com/user/get_user_info?${getUserInfoUrlParamsStr}`
        //                  request(getUserInfoUrl,async (error,response,body)=>{
                              
        //                   if(error){
        //                     return this.fail(error + '')
        //                   }else if(response.statusCode == 200){
        //                       let userInfo  = JSON.parse(body)
        //                       if(userInfo.ret == 0){
        //                         // 获取用户信息成功
                            

        //                         // 保存用户信息
                              
        //                         // 根据unionid 查询是否有该用户
        //                         let data = await this.model('qq_login').where({ Funion_id:unionid }).find()
        //                         if(data.Fqq_id){
        //                           // 说明有该用户
        //                           let currentUser = {
        //                             Funion_id: data.Funion_id,
        //                             Fnickname : data.Fnickname
        //                           }
        //                           // 保存用户登陆状态 为1天
        //                           saveUserStatusByjwt(this,currentUser,false,data.Fqq_id)

        //                           return this.success(data)
        //                         }else{
        //                           // 没有该用户 添加进去
                   
        //                           let addData = {
        //                             Funion_id:unionid,            // QQ唯一识别ID
        //                             Fnickname:userInfo.nickname,  // QQ昵称
        //                             Favatar:userInfo.figureurl_qq // QQ头像
              
        //                           }
        //                           let Fqq_id = await this.model('qq_login').add(addData)
        //                           return this.success({
        //                             Fqq_id,
        //                             Funion_id:unionid,            
        //                             Fnickname:userInfo.nickname,
        //                             Favatar:userInfo.figureurl_qq 
        //                           })
        //                         }
                              
        //                       }
        //                   }else{
        //                     return this.fail('获取get_user_info失败')
        //                   }
        //                  })
        //                }
        //             }else{
        //               return this.fail("获取openId失败")  
        //             }
        //           })
        //         }
              
              
        //       }else{
        //         return this.fail("获取AccessToken失败")
        //       }
        // })
        

      }else{
        return this.fail('code不存在')
      }
    
    } catch (error) {

      // 这里会接受到语法错误 和 失败的promise 的结果
      if(typeof error == 'object'){
        error = JSON.stringify(error)
      }
      return this.fail('获取第三方登陆QQ用户信息失败--' + error)
    }
  }
}

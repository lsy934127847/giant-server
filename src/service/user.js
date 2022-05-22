const request = require('request')
const { saveUserStatusByjwt,getParams } = require("../utills/utills")
module.exports = class extends think.Service {
   async getAccessToken(code) {
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
       let p = new Promise((res,rej) =>{
        request(getAccessTokenUrl,function(error,response,body){
            let bodyObj = JSON.parse(body)
            if(error){
                rej(error)
            }else if(bodyObj.error){
               rej(bodyObj)
            }else{
                res(bodyObj)
            }
        })
       })

       return p
       
    }
   async getOpenId(access_token){
    let openIdParamsObj = {
        access_token,
        unionid:1,
        fmt:'json'
    }
    let openIdParamsStr = getParams(openIdParamsObj) // 'a=1&b=2'
    let getOpenIdUrl  = `https://graph.qq.com/oauth2.0/me?${openIdParamsStr}`
    let p = new Promise((res,rej) =>{
        request(getOpenIdUrl,function(error,response,body){
            let bodyObj = JSON.parse(body)
            if(error){
                rej(error)
            }else if(bodyObj.error){
               rej(bodyObj)
            }else{
                res(bodyObj)
            }
        })
       })

       return p
   }

   async getUserInfo(access_token,openid){
    let getUserInfoUrlParamsObj = {
            access_token,
            oauth_consumer_key : '101984051',
            openid,
        }
    let getUserInfoUrlParamsStr = getParams(getUserInfoUrlParamsObj)
    let getUserInfoUrl = `https://graph.qq.com/user/get_user_info?${getUserInfoUrlParamsStr}`
    let p = new Promise((res,rej) =>{
        request(getUserInfoUrl,function(error,response,body){
            let bodyObj = JSON.parse(body)
            if(error){
                rej(error)
            }else if(bodyObj.error){
               rej(bodyObj)
            }else{
                res(bodyObj)
            }
        })
       })

       return p
   }
  }
  
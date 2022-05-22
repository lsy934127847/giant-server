
// 用户登陆后 利用jwt 保存登陆用户状态 
// 如果用户勾选自动登陆 会有7天的免登录 如果没有勾选 默认为1天的免费登录
var jwt = require('jsonwebtoken');
// 只要前端有访问后端服务 那么后端就进行 token 鉴权 
// 如果没获取到token或者或者token不正确 则进行重定向到登陆页面
// 如果能获取到token并且token没过期则正常进行 

// 某些网络请求不需要鉴权 如登陆注册
let NotTofUrl = [
   '/common/user/loginByCount',
   '/common/user/loginByPhone',
   '/common/user/getLoginCaptcha',
   '/common/user/getCaptcha',
   '/common/user/register',
   '/common/user/resetLoginPassWord',
   '/common/user/getForgetPassWordCaptcha',
   '/common/user/getFaccountNumber',
   '/common/user/getQQUserInfo'
  
]
module.exports = (options = {}) => {
    return (ctx, next) => {
        console.log('ctx1',ctx.path === '/common/user/getQQUserInfo')
        if(NotTofUrl.includes(ctx.path) || ctx.path.indexOf('/static/image') > -1){
          //  某些网络请求不需要鉴权 如登陆注册
          console.log('1112')
            return next();
        }
        const token = ctx.cookie('token')
        let currentUser
        let currentErr = null
      jwt.verify(token, 'lashiyong',function(err, decoded){
          if(err){
            currentErr = err
          }
          if(decoded)currentUser =decoded
        });
        if(currentUser){
            console.log('66666666666666666666666666666666')
            return next();
        }else{
            return  ctx.fail(currentErr + '' + 'token过期或者不存在')
        }
       
    };
};
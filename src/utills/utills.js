const Core = require('@alicloud/pop-core');
var jwt = require('jsonwebtoken');

async function getCaptcha(phone, code) {
  var client = new Core({
    accessKeyId: 'LTAI5tPyYkXucixcJADDHPm2',
    accessKeySecret: '5mOYKRghi8keLsjHJOBYuAfeCWnhrR',
    // securityToken: '<your-sts-token>', // use STS Token
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });
  var requestOption = {
    method: 'POST'
  };

  var params = {
    'SignName': '巨人后台管理系统',
    'TemplateCode': 'SMS_229637685',
    'PhoneNumbers': phone,
    'TemplateParam': `{code:${code}}`
  };
  const p = new Promise((resolve, reject) => {
    client.request('SendSms', params, requestOption).then((result) => {
      resolve(result);
    }, (ex) => {
      reject(ex);
    });
  });
  return p;
}

// 利用jwt保存用户登陆状态 默认为1天 如果勾选自动登陆 则会有7天
// 参数 ctx 对象
//      currentUser :{},
//      autoLogin 存在 设置7天免登陆 不存在设置1天面登陆
//      Fuser_id 用户ID
async function saveUserStatusByjwt(ctx, currentUser, autoLogin, Fuser_id) {
  // lashiyong 密钥
  // 后端也有设置token过期时间的必要性
  // 这里发现一个奇怪的问题
  // currentUser必须为普通对象 如果数据库中带有RowDataPacket 的对象则执行不下去 不知道两者有何区别
  const token = jwt.sign(currentUser, 'lashiyong', {
    expiresIn: autoLogin ? '7 days' : '1 days'
  });
  const maxAge = autoLogin ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  ctx.cookie('token', token, {
    maxAge,
    httpOnly: false
    // domain:'' 不设置 或者设置为空 代表 在前端响应头中set-cookie中无法看到domain 那就是谁访问就是谁
  });
  ctx.cookie('Fuser_id', Fuser_id + '', {
    maxAge,
    httpOnly: false
    // domain:'' 不设置 或者设置为空 代表 在前端响应头中set-cookie中无法看到domain 那就是谁访问就是谁
  });
}

// 将对象转换为get地址栏的参数
// 参数   params : {a:'1',b:'2'}
// 返回值  'a=1&b=2'
function getParams(params) {
  let paramStr = '';
  for (const key in params) {
    paramStr = paramStr + '&' + key + '=' + params[key];
  }
  return paramStr.substr(1);
}
module.exports = {
  getCaptcha,
  saveUserStatusByjwt,
  getParams
};

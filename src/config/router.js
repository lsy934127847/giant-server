module.exports = [
    [/\/api\/(\w+)(?:\/(\d+))?/, '/:1?id=:2', 'rest'],
    // [/\/user\/(\w+)/, 'user?name=:1']
    [/common\/(\w+)\/(\w+)/i, '/:1/:2'] // common/user/getCaptcha
];



// 访问规则  
//   以api开头的路由都将会是restful 路由
//   /api/module  get方式 
//   如果 _before 返回false 则停止继续执行  
//   如果 _before 返回 true 则继续向后执行 先匹配 自己的getAction  有则执行  
//   对应contronl 没有getAction 则找父类 的getAction 


//  /module/getAll   先找 module 的 controller 中的 getAllAction 但不会匹配父类中的getAllAction 
//   
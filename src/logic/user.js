
// 数据校验
module.exports = class extends think.Logic {
  indexAction() {

  }

  getAction(){
    /*
    let rules = {
      username: {
        string: true,       // 字段类型为 String 类型
        required: false,     // 字段必填
        default: 'thinkjs', // 字段默认值为 'thinkjs'
        trim: true,         // 字段需要trim处理
        method: 'GET'       // 指定获取数据的方式
      },
      age: {
        int: true ,// 20到60之间的整数,
        required: false,
        method: 'GET'
      }
    }
    let flag = this.validate(rules);
    if(!flag){
      return this.fail('validate error', this.validateErrors);
      // 如果校验失败，返回
      // {"errno":1000,"errmsg":"validate error","data":{"username":"username can not be blank"}}
    }
    */
    // 将校验规则赋值给 this.rules 属性进行自动校验 如果有错误则直接输出 JSON 格式的错误信息
    // {"errno":1000,"errmsg":"validate error","data":{"username":"username can not be blank"}}
    this.rules = {
      Fuser_id : {
        int: true, 
        required :false
      },
      Faccount_number : {
        string: true, 
        required: false,
        trim: true, 
      },
      Fpassword : {
        string: true, 
        required :false
      },
      Fnickname : {
        string: true, 
        required :false
      },
      Fphone : {
        string: true, 
        required :false,
        trim: true,
      }
    }


  }
  // 注册用户
  postAction(){
    this.rules = {
      Faccount_number : {
        string: true, 
        required: true,
        trim: true, 
      },
      Fpassword : {
        string: true, 
        required :true
      },
      Fnickname : {
        string: true, 
        required :true
      },
      Fphone : {
        string: true, 
        required :true
      },
      captcha : {
        string: true, 
        required :true
      },
      Finsert_time : {
        string: true, 
        required :true
      },
      Fupdate_time : {
        string: true, 
        required :true
      }
      
    }
  }

  // 注册或者登陆验证码
  getCaptchaAction(){
    this.rules = {
      phone : {
        string: true, 
        required :true
      },
    }
  }
};

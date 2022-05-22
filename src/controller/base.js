module.exports = class extends think.Controller {
  __before() {
      return true
  }


  baseGetList(){
    
    return '我是基类中的方法'
  }
};

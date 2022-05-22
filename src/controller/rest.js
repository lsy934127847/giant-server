const assert = require('assert');


module.exports = class extends think.Controller {
  static get _REST() {
    return true;
  }

  constructor(ctx) {
    super(ctx);
    this.resource = this.getResource(); // ['module']
    this.id = this.getId();          // /api/module/1    this.id = 1
    assert(think.isFunction(this.model), 'this.model must be a function');
    this.modelInstance = this.model(this.resource); // module 实例
  }
  __before() {

    return true
  }
  /**
   * get resource
   * @return {String} [resource name]
   */
  getResource() {
    return this.ctx.controller.split('/').pop(); // ['module']
  }
  getId() {
    const id = this.get('id');
    if (id && (think.isString(id) || think.isNumber(id))) {
      return id;
    }
    const last = this.ctx.path.split('/').slice(-1)[0];
    if (last !== this.resource) {
      return last;
    }
    return '';
  }


  async getAction() {

    console.log('this.modelInstance.tableName',this.modelInstance.tableName) // 'w_module'
    console.log('this.modelInstance.modelName',this.modelInstance.modelName) // 'module'
    let options = this.ctx.param(); // 获取请求参数  // /api/module/1  options = { id: '1' } //也能解析出来
    console.log('options',options)

    let {
        pageSize, //   默认this.modelInstance.config.pageSize 在adapter中有配置
        currentPage,// 默认第一页
        all
    } = options
    let {tableName} = this.modelInstance


     delete options.pageSize
     delete options.currentPage
     delete options.all

    let data 
    if(all == 1){
      // 某条件下查询全部
      let where = {
         
      }
      data =  await this.modelInstance.where(where).select()
    }else{
      // 不传或传0 为分页查询
        // 查询条件
     
        console.log(where)
       data =  await this.modelInstance.where(where).page(currentPage,pageSize).countSelect()
       /*
       data =   {
            errno: 0,
            errmsg: "",
            data: {
                count: 20,  // 共20条
                totalPages: 2, // 共2页
                pageSize: 10, // 每页10条
                currentPage: 1, // 当前第一页
                data: [] // 数据
                }
            }
       */
    }
   

   
    
   
   
    // if (this.id) { // 
    //   const pk = this.modelInstance.pk;
    //   data = await this.modelInstance.where({ [pk]: this.id }).find();
    //   return this.success(data);
    // }


    // 某条件下  分页查询     all = 0 或者不传 分页查

    // 某条件下  查询所有      all = 1 
    // data = await this.modelInstance.select();
    return this.success(data);
  }
  /**
   * put resource
   * @return {Promise} []
   */
  async postAction() {
    const pk = this.modelInstance.pk;
    const data = this.post();
    delete data[pk];
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    const insertId = await this.modelInstance.add(data);
    return this.success({ id: insertId });
  }
  /**
   * delete resource
   * @return {Promise} []
   */
  async deleteAction() {
    if (!this.id) {
      return this.fail('params error');
    }
    const pk = this.modelInstance.pk;
    const rows = await this.modelInstance.where({ [pk]: this.id }).delete();
    return this.success({ affectedRows: rows });
  }
  /**
   * update resource
   * @return {Promise} []
   */
  async putAction() {
    if (!this.id) {
      return this.fail('params error');
    }
    const pk = this.modelInstance.pk;
    const data = this.post();
    data[pk] = this.id; // rewrite data[pk] forbidden data[pk] !== this.id
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    const rows = await this.modelInstance.where({ [pk]: this.id }).update(data);
    return this.success({ affectedRows: rows });
  }

  
  __call() {}
};
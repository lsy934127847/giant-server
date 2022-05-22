
module.exports = class extends think.Model {
    get pk() {
        return 'Fqq_id';
    }

    get tableName() {
        let prefix = 't_';
        // TODO:方便后期分表扩展
        return `${prefix}${this.modelName}`;
    }

    // get relation() {
    //     return {
    //         mod_version: {
    //             type: think.Model.HAS_MANY,
    //             key: 'Fmod_id',
    //             fKey: 'Fmod_id',
    //             name: 'versionInfo',
    //             order: 'Fupdate_time',
    //         }
    //     };
    // }
};

module.exports = (options = {}) => {
    return (ctx, next) => {
        ctx.set({
            'Access-Control-Allow-Origin': 'http://localhost:8000',
            'Access-Control-Allow-Headers':
                'Origin, X-Requested-With, Content-Type, Accept, Connection, User-Agent, Cookie',
            'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
            'X-Powered-By': ' 3.2.1',
            'Access-Control-Allow-Credentials': 'true',
            'Access-control-expose-headers': 'Area'
        });
        return next();
    };
};


const router = (routes = null, authRoutes = null) => {

    if (routes && routes.constructor !== Array) {
        console.error('Routes need to be a valid array!');
        return false;
    }

    if (authRoutes && authRoutes.constructor !== Array) {
        console.error('Authentication routes need to be a valid array!');
        return false;
    }

    let paths = [];

    if (authRoutes) {
        Array.prototype.push.apply(paths, authRoutes);
    } else {
        const defaultAuthRoutes = require('./router/auth').default;
        Array.prototype.push.apply(paths, defaultAuthRoutes);
    }

    let children = [];

    if (routes) {
        Array.prototype.push.apply(children, routes);
    }

    children.push({
        path: '/dashboard',
        name: 'Dashboard',
        component: require('./views/Dashboard').default,
    });

    paths.push({
        path: '/',
        redirect: '/dashboard',
        name: 'Home',
        component: require('./containers/Default').default,
        meta: {
            breadcrumb: 'Home'
        },
        children: children
    });

    paths.push({
        path: '*',
        name: 'Error',
        component: require('./views/errors/Page404').default
    });

    return {
        mode: 'history',
        linkActiveClass: 'active',
        scrollBehavior: () => ({y: 0}),
        routes: paths
    };
}

const store = (config = {}) => {

    if (typeof (config.modules) !== 'undefined' && typeof (config.modules) !== 'object') {
        console.error('Config modules needs to be of type object!');
        return false;
    }

    if (typeof (config.state) !== 'undefined' && typeof (config.state) !== 'object') {
        console.error('Config state needs to be of type object!');
        return false;
    }

    if (typeof (config.getters) !== 'undefined' && typeof (config.getters) !== 'object') {
        console.error('Config getters needs to be of type object!');
        return false;
    }

    if (typeof (config.actions) !== 'undefined' && typeof (config.actions) !== 'object') {
        console.error('Config actions needs to be of type object!');
        return false;
    }

    if (typeof (config.mutations) !== 'undefined' && typeof (config.mutations) !== 'object') {
        console.error('Config mutations needs to be of type object!');
        return false;
    }

    let storeModules = {};
    let storeState = {};
    let storeGetters = {};
    let storeActions = {};
    let storeMutations = {};

    const authModule = require('./store/auth').default;
    const resourceModule = require('./store/resources').default;
    const applicationModule = require('./store/application').default;

    storeModules = {
        auth: authModule,
        resources: resourceModule,
        application: applicationModule
    };

    if (typeof config.modules !== 'undefined') {
        // TODO: TEST!!!
        // storeModules = {
        //     ...storeModules,
        //     ...config[modules]
        // }
    }

    return {
        modules: storeModules,
        state: storeState,
        getters: storeGetters,
        actions: storeActions,
        mutations: storeMutations
    }
};

module.exports = {
    router,
    store,
};

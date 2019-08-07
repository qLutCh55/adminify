let routes = [
    {
        path: '/login',
        name: 'Login',
        component: require('../views/auth/Login').default,
    }, {
        path: '/password/reset',
        name: 'Password-Reset',
        component: require('../views/auth/Password-Reset').default,
    }, {
        path: '/password/reset/:token/:email',
        name: 'Password-Change',
        component: require('../views/auth/Password-Change').default,
    },
    {
        path: '/email/verify',
        name: 'Email-Verification',
        component: require('../views/auth/Email-Verification').default,
    }
];

if (document.body.getAttribute('data-reg')) {
    routes.push({
        path: '/register',
        name: 'Register',
        component: require('../views/auth/Register').default,
    });
}

export default routes;

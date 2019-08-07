import axios from 'axios';
import Vue from 'vue'

function errorResponseHandler(error) {
    // check for errorHandle config
    if (error.config.hasOwnProperty('errorHandle') && error.config.errorHandle === true) {
        return Promise.reject(error);
    }

    if (error.response.status == 419) {
        location = window.location.href;
    } else if (error.response) {
        Vue.toasted.show("Whoops! Something went wrong", {
            theme: "error",
            position: "top-center",
            duration: 1500
        });
    }
}

// apply interceptor on response
axios.interceptors.response.use(
    response => response,
    errorResponseHandler
);

export default errorResponseHandler;
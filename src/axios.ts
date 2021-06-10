import axios, { AxiosTransformer } from 'axios';
// import router from './router';

const zsAxios = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL,
    transformRequest: [function (data, headers) {
        if (localStorage.accessToken) {
            headers.Authorization = "Bearer " + localStorage.accessToken;
        }
        // TODO
        // if (store.debugSession && store.debugSession.id) {
        //     headers["X-Debug-ID"] = store.debugSession.id;
        // }
        return data;
    }, ...(axios.defaults.transformRequest as AxiosTransformer[])],
});

zsAxios.interceptors.response.use(response => response, function (error: any) {
    if (error.response.status == 403 && localStorage.accessToken) {
        delete localStorage.accessToken;
        window.location.href = "/authentication/login/";
    }
    // console.log(error);
    // console.log(error.response);
    // TODO
    // if (error.response && error.response.status == 401) {
    //     router.push('/authentication/login/');
    //     return;
    // }
    throw error;
})

export default zsAxios;

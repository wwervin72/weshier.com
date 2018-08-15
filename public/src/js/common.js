import Cookies from 'js-cookie'

export const ax = (option, baseURL = '/api/') => {
    option = Object.assign({
        type: 'get',
        url: '',
        timeout: 10000,
        data: {}
    }, option)
    option.url = baseURL + option.url
    return $.ajax(option)
}

export const validaEmail = email => /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(email)

export const validaUserName = userName => /^[a-zA-Z0-9]{5,16}$/.test(userName)

export const getCookieName = cookieName => {
    return Cookies.get(cookieName)
}
import '@/style/signUp.scss'

import { ax, validaEmail, validaUserName } from './common';

$(function () {
    const signUpForm = $('#sign_up_form')
    const getAuthCodeBtn = $('#get_auth_code')
    const emailIpt = $('#sign_up_form input[name=email]')
    let coolingTime = 60
    let coolingTimer

    const refreshCoolingTime = () => {
        getAuthCodeBtn.text(`从新发送(${coolingTime}秒)`)
        getAuthCodeBtn.css({
            opacity: .5,
            cursor: 'text'
        })
        coolingTimer = setInterval(() => {
            coolingTime -= 1
            if (coolingTime <= 0) {
                coolingTime = 60
                coolingTimer = clearInterval(coolingTimer)
                getAuthCodeBtn.text(`从新发送`)
                getAuthCodeBtn.css({
                    opacity: 1,
                    cursor: 'pointer'
                })
            } else {
                getAuthCodeBtn.text(`从新发送(${coolingTime}秒)`)
            }
        }, 1000)
    }

    signUpForm.on('submit', evt => {
        evt.preventDefault()
        ax({
            type: 'post',
            url: '/signUp',
            data: (() => {
                let data = {}
                signUpForm.serializeArray().forEach(el => {
                    data[el.name] = el.value
                })
                return data
            })()
        }).then(res => {
            if (res.result) {
                signUpForm[0].reset()
                coolingTime = 60
                coolingTimer = clearInterval(coolingTimer)
                getAuthCodeBtn.text(`从新发送`)
                getAuthCodeBtn.css({
                    opacity: 1,
                    cursor: 'pointer'
                })
                alert('注册成功')
            } else {
                alert(res.msg)
            }
        }).catch(err => {
            console.log(err)
        })
    })
    getAuthCodeBtn.on('click', evt => {
        evt.preventDefault()
        if (coolingTimer) return
        let val = emailIpt.val()
        if (!val) return alert('请输入绑定邮箱')
        if (!validaEmail(val)) return alert('邮箱格式不正确')
        ax({
            url: `/email/signUp/authCode?email=${val}`
        }).then(res => {
            if (res.result) {
                refreshCoolingTime()
            } else {
            }
            alert(res.msg)
        }).catch(err => {
            console.log(err)
        })
    })
})
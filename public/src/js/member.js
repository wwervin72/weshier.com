import '@/style/member.scss'

$(function () {
    const focusOnBtn = $('.focus_on')
    const noFocusOnBtn = $('.no_focus')
    
    focusOnBtn
        .on('mouseenter', evt => {
            $(evt.target).html('<span class="cancel_focus_on"></span>取消关注')
        })
        .on('mouseleave', evt => {
            $(evt.target).html('<span class="focus_on_icon"></span>已关注')
        })
    noFocusOnBtn.on('click', evt => {
        console.log('focus')
    })
})
import '@/style/sideTool.scss';

$(function () {
    const goTop = $('#go_top')
    let scrollTop
    $(window).on('scroll', evt => {
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop
        if (scrollTop > 50) goTop.show()
        else goTop.hide() 
    })

    goTop.on('click', evt => {
        $(window).scrollTop(0)
    })
})
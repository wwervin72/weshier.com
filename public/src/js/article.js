import '@/style/article.scss'

import { ax, getCookieName } from './common'
import './sideTool'

$(function () {
    const hiddenIpt = $('#hidden_content')
    let comments = []
    let emojis = []
    let emojiHtml = ''
    let article = window.location.pathname
    article = article.slice(article.lastIndexOf('/') + 1)
    const commentsDom = $('#comments')
    // 获取评论
    const queryComments = () => {
        ax({
            url: `c/${article}`
        }).then(res => {
            if (res.result) {
                comments = res.data
                let commentsHtml = ''
                res.data.forEach(comment => {
                    comment.content = comment.content.replace(/:([\d\w_+-]+):/ig, `<img src="/public/assets/emoji/$1.png">`)
                    commentsHtml += `
                        <li class="comment">
                            <div class="comment_info">
                                <a href="/m/${comment.author.userName}">
                                    <img class="comment_avatar" src="${comment.author.avatar}" title="${comment.author.alias}">
                                </a>
                                <div class="info">
                                    <a class="author_alias" href="/m/${comment.author.userName}">${comment.author.alias}</a>
                                    <div class="create_time">${comment.createdAt}</div>
                                </div>
                            </div>
                            <p class="comment_cnt">${comment.content}</p>
                            <div class="comment_handle">
                                <a class="heart" href="javascript:;">赞</a>
                                <a class="reply" href="javascript:;">回复</a>
                            </div>
                            <div class="cmt_comments_list">
                                <ul class="cmt_comments">
                    `
                    if (comment.comments && comment.comments.length) {
                        comment.comments.forEach(cnt => {
                            cnt.content = cnt.content.replace(/:([\d\w_+-]+):/ig, `<img src="/public/assets/emoji/$1.png">`)
                            commentsHtml += `
                                    <li>
                                        <div class="reply_author_cnt">
                                            <a class="reply_author" href="/m/${cnt.author.userName}">${cnt.author.alias}:</a>
                                            <span class="reply_cnt">${cnt.content}</span>
                                        </div>
                                        <div class="reply_info">
                                            <span class="reply_time">${cnt.createdAt}</span>
                                            <a href="javascript:;" class="reply_btn reply">回复</a>
                                        </div>
                                    </li>
                            `
                        })
                        commentsHtml += `<li class="add_comment_label"><a href="javascript:;" class="reply_btn reply">添加新评论</a></li>`
                    }
                    commentsHtml += `
                                </ul>
                                <div class="reply_editor">
                                    <textarea class="editor" placeholder="写点啥吧..."></textarea>
                                    <div class="editor_comment_handle">
                                        <div class="emoji_enter_desc">
                                            <div class="emoji">
                                                <a href="javascript:;" class="emoji_btn">emoji</a>
                                            </div>
                                            <span class="enter_desc">Ctrl+Enter 发表</span>
                                        </div>
                                        <div class="cancel_public">
                                            <a href="javascript:;" class="cancel">取消</a>
                                            <a href="javascript:;" class="public">发表</a>
                                        </div>
                                    </div>
                                </div>
                        </li>
                    `
                })
                commentsDom.append(commentsHtml)
            } else {
                alert(res.msg)
            }
        }).catch(err => {
            console.log(err)
        })
    }
    // 获取emoji表情
    const queryEmojis = () => {
        ax({
            url: 'emoji'
        }).then(res => {
            if (res.result) {
                emojis = res.data
                let emojiHeaderHtml = `<div class="emojis_header">`
                let emojiBodyHtml = `<div class="emojis_body">`
                let pagePane
                emojis.forEach((emoji, index) => {
                    pagePane = index % 50
                    if (!pagePane) {
                        if (index) {
                            emojiBodyHtml += '</div>'
                        }
                        emojiHeaderHtml += `<span class="emoji_page_num"></span>`
                        emojiBodyHtml += `<div class="emoji_pane">`
                    }
                    emojiBodyHtml += `
                        <a href="javascript:;" class="emoji_img">
                            <img src="${emoji.src}" title="${emoji.name}">
                        </a>
                    `
                })
                emojiHeaderHtml += `</div>`
                emojiBodyHtml += `</div></div>`
                emojiHtml = `<div class="emojis_wrapper">${emojiHeaderHtml}${emojiBodyHtml}</div>`
            } else {
                alert(res.msg)
            }
        }).catch(err => {
            console.log(err)
        })
    }

    editormd.markdownToHTML('content', {
        markdown: hiddenIpt.val(),
        htmlDecode: 'style, script, iframe',
        taskList: true,
        tex: true,
        flowChart: true,
        sequenceDiagram: true
    });
    hiddenIpt.val('')

    queryComments()
    queryEmojis()

    $('.comment_editor, .comments_list')
        .on('click', '.public', evt => {
            const target = $(evt.target)
            const cmtIdx = target.parents('.comment')
            const textarea = target.parents('.editor_area, .reply_editor').find('textarea')
            let val = textarea.val().trim()
            if (!val) return alert('请输入评论内容')
            val = val.replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;')
            let parentComment
            if (cmtIdx.length) parentComment = comments[cmtIdx.index()]._id
            ax({
                type: 'POST',
                url: 'comment/new',
                data: {
                    content: val,
                    article,
                    parentComment
                },
                dataType: 'json'
            }).then(res => {
                if (res) {
                    textarea.val('')
                    if (res.data.comment.parentComment) {
                        const reply = res.data.comment
                        const author = res.data.author
                        const ul = target.parents('.reply_editor').prev()
                        const addCmtLabel = ul.find('.add_comment_label')
                        reply.content = reply.content.replace(/:([\d\w_+-]+):/ig, `<img src="/public/assets/emoji/$1.png">`)
                        const html = `
                            <li>
                                <div class="reply_author_cnt">
                                    <a class="reply_author" href="/m/${author.userName}">${author.alias}:</a>
                                    <span class="reply_cnt">${reply.content}</span>
                                </div>
                                <div class="reply_info">
                                    <span class="reply_time">${reply.createdAt}</span>
                                    <a href="javascript:;" class="reply_btn reply">回复</a>
                                </div>
                            </li>
                        `
                        if (addCmtLabel.length) {
                            addCmtLabel.before(html)
                        } else {
                            ul.append(html)
                        }
                    } else {
                        comments.unshift(Object.assign(res.data.comment, {author: res.data.author}))
                        const comment = res.data.comment
                        const author = res.data.author
                        comment.content = comment.content.replace(/:([\d\w_+-]+):/ig, `<img src="/public/assets/emoji/$1.png">`)
                        commentsDom.prepend(`
                            <li class="comment">
                                <div class="comment_info">
                                    <a href="/m/${author.userName}">
                                        <img class="comment_avatar" src="${author.avatar}" title="${author.alias}">
                                    </a>
                                    <div class="info">
                                        <a class="author_alias" href="/m/${author.userName}">${author.alias}</a>
                                        <div class="create_time">${comment.createdAt}</div>
                                    </div>
                                </div>
                                <p class="comment_cnt">${comment.content}</p>
                                <div class="comment_handle">
                                    <a class="heart" href="javascript:;">赞</a>
                                    <a class="reply" href="javascript:;">回复</a>
                                </div>
                                <div class="cmt_comments_list">
                                    <ul class="cmt_comments"></ul>
                                    <div class="reply_editor">
                                        <textarea class="editor" placeholder="写点啥吧..."></textarea>
                                        <div class="editor_comment_handle">
                                            <div class="emoji_enter_desc">
                                                <div class="emoji">
                                                    <a href="javascript:;" class="emoji_btn">emoji</a>
                                                </div>
                                                <span class="enter_desc">Ctrl+Enter 发表</span>
                                            </div>
                                            <div class="cancel_public">
                                                <a href="javascript:;" class="cancel">取消</a>
                                                <a href="javascript:;" class="public">发表</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        `)
                    }
                } else {
                }
                alert(res.msg)
            }).catch(err => {
                console.log(err)
            })
        })
        .on('focus', '.editor', evt => {
            $(evt.target).next().show()
        })
        .on('keyup', '.editor', evt => {
            if (evt.ctrlKey && evt.keyCode === 13) {
                $(evt.target).next('.editor_comment_handle').find('.public').trigger('click')
            }
        })
        .on('click', '.reply', evt => {
            if (!getCookieName('userName')) return window.location.href = '/signIn'
            $(evt.target).parents('.comment').find('.reply_editor').toggle()
        })
        .on('click', '.emoji_btn', evt => {
            evt.stopPropagation()
            const target = $(evt.target)
            let emojiWrapper = target.next()
            if (!emojiWrapper.length) {
                let emojiHtmlDom = $(emojiHtml)
                emojiHtmlDom.find('.emoji_page_num:first-child').addClass('active')
                emojiHtmlDom.find('.emoji_pane:first-child').addClass('active')
                target.after(emojiHtmlDom)
            } else {
                emojiWrapper.toggle()
            }
        })
        .on('click', '.heart', evt => {
            if (!getCookieName('userName')) return window.location.href = '/signIn'
            console.log('heart')
        })
        .on('click', '.emoji_page_num', evt => {
            let target = $(evt.target)
            let index = target.index()
            if (target.is('active')) return
            else {
                let panes = target.parent().next('.emojis_body').find('.emoji_pane')
                target.siblings().removeClass('active')
                target.addClass('active')
                panes.removeClass('active')
                $(panes[index]).addClass('active')
            }
        })
        .on('click', '.emoji_img img', evt => {
            let target = $(evt.target)
            let textarea = target.parents('.reply_editor, .editor_area').find('.editor')
            textarea.val(textarea.val() + `:${target.attr('title')}:`)
            target.parents('.emojis_wrapper').hide()
        })
        .on('click', '.emojis_wrapper', evt => {
            console.log(123)
            evt.stopPropagation()
        })
        .on('click', '.cancel', evt => {
            evt.stopPropagation()
        })
    $(document).on('click', evt => {
        $('.emojis_wrapper').hide()
    })
    const heartArticle = $('.heart_article')
    const heartLabel = $('.heart_label')
    let hearting = false
    heartArticle.on('click', evt => {
        if (hearting) return
        if (!getCookieName('userName')) return window.location.href = '/signIn'
        const target = $('.heart_article')
        let url = ''
        let heart
        if (target.is('.hearted_article')) {
            url = '/a/hearted'
            heart = false
        } else {
            url = '/a/heart'
            heart = true
        }
        hearting = true
        ax({
            url: `${url}?articleId=${article}`
        }).then(res => {
            hearting = false
            if (res.result) {
                if (heart) {
                    // 点赞
                    heartArticle.addClass('hearted_article')
                    let next = heartLabel.next('span')
                    if (next.length) {
                        let num = next.find('.heart_num');
                        num.text(num.text() - 0 + 1)
                    } else {
                        heartLabel.after(`
                            <span>
                                <span class="split"></span>
                                <span class="heart_num">1</span>
                            </span>
                        `)
                    }
                } else {
                    // 取消点赞
                    heartArticle.removeClass('hearted_article')
                    let next = heartLabel.next('span')
                    let numDom = next.find('.heart_num')
                    let num = numDom.text() - 1
                    if (!num) {
                        next.remove()
                    } else {
                        numDom.text(num)
                    }
                }
            } else {
                alert(res.msg)
            }
        }).catch(err => {
            hearting = false
            console.log(err)
        })
    })
})
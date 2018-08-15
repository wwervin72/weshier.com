import '@/style/index.scss'

import { ax } from './common'
import './sideTool'

$(function () {
    const loadMoreBtn = $('#load_more')
    const articleList = $('#article_list')
    let pageNum = 0
    let count = 0
    let hasMore = true
    const loadingAni = $('#loading_ani')
    loadMoreBtn.on('click', evt => {
        if (!hasMore || pageNum && 10 * pageNum >= count) {
            loadMoreBtn.text('没有更多的了')
            return
        }
        loadingAni.show()
        pageNum += 1
        ax({
            url: `/a/list?pageNum=${pageNum}`
        }).then(res => {
            loadingAni.hide()
            if (res.data.length < res.count) {
                hasMore = false
                loadMoreBtn.text('没有更多的了')
            }
            if (res.result) {
                count = res.count
                let html = ``
                if (res.data.length) {
                    res.data.forEach(el => {
                        html += `
                            <li class="article">
                                <div class="main">
                                    <div class="content">
                                        <a class="title" href="/${el.author.userName}/a/${el.id}">
                                            ${el.title}
                                        </a>
                                        <p class="abstract">
                                            ${el.abstract}
                                        </p>
                                    </div>
                                    <a class="avatar" href="/${el.author.userName}/a/${el.id}">
                                        <img src="${el.avatar}" title="${el.title}">
                                    </a>
                                </div>
                                <div class="base_info">
                                    <span class="alias_update">${el.author.alias} 发布于 ${el.updateAt}</span>
                                    <span class="heart_num">${el.heartLen}</span>
                                    <span class="comment_num">${el.commentsLen}</span>
                                </div>
                            </li>  
                        `
                    })
                    articleList.append(html)
                } 
            } else {
                alert('加载失败')
            }
            console.log(res)
        }).catch(err => {
            alert(err)
        })
    })
})
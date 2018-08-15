import '@/style/editor.scss'

import { ax } from './common'

$(function() {
    let tags = []
    let testEditor
    const imageUploadFn = (files, cb, writeUrl) => {
        let formData = new FormData();
        formData.append('image', files[0]);
        ax({
            type: 'post',
            url: '/file',
            data: formData,
            complete: cb,
            contentType: false,
            cache: false,
            processData: false
        }).then(res => {
            if (res.result) {
                writeUrl(res.data)
            } else {
                alert('上传失败')
            }
        }).catch(err => {
            console.log(err)
        })
    }
    
    const save = () => {
        const markdown = testEditor.getMarkdown();
        const title = $('#title_ipt').val().trim()
        if (!title) return alert('请输入标题')
        if (!markdown) return alert('请输入内容')
        const abstractLen = Math.floor(Math.random() * 200 + 100)
        const html = $(testEditor.getHTML())
        const abstract = html.text().replace(/\s/g, '').slice(0, abstractLen)
        const imgs = html.find('img')
        let avatar
        for(let i = 0, len = imgs.length; i < len; i++){
            avatar = $(imgs[i]);
            if(avatar.width() >= 50 && avatar.height() >= 50){
                avatar = avatar.attr('src');
                break;
            }
        }
        let data = {
            title,
            content: markdown,
            abstract,
            tags
        }
        if (typeof avatar === 'string') data.avatar = avatar
        ax({
            type: 'post',
            url: '/a/save',
            data
        }).then(res => {
            if (res.result) {
                alert('文章保存成功')
                window.location.href = `/${res.data.user.userName}/a/${res.data.id}`
            } else {
                alert('保存失败')
            }
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }
    
    testEditor = editormd("editor", {
        width: "100%",
        height: '100%',
        path: "/lib/editor.md/",
        pluginPath: '/lib/editor.md/plugins/',
        tex: false,
        toolbarIcons: () => {
            return ["undo", "redo", "|", "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", "h1", "h2", "h3", "h4", "h5", "h6", "|",
            "list-ul", "list-ol", "hr", "|", "link", "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime", "pagebreak", 
            "|", "goto-line", "watch", "preview", "fullscreen", "clear", "search", "save"]
        },
        imageUpload : true,
        imageFormats : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        imageUploadFn,
        saveHTMLToTextarea: true,
        toolbarIconsClass: {
            save: "fa-save"
        },
        toolbarHandlers: {
            save: function (cm, icon, cursor, selection) {
                save();
            },
        },
        onfullscreen: function () {
            $('#editor').css({'zIndex': 99999});
        },
        onfullscreenExit: function () {
            $('#editor').css({'zIndex': 'auto'});
        }
    })

    const tagIpt = $('#tag_ipt')
    tagIpt.on('keypress', evt => {
        const val = tagIpt.val()
        // 最多十个tags
        if (evt.keyCode === 13 && val && !tags.includes(val)) {
            if (tags.length >= 10) return alert('最多十个标签')
            tags.push(val)
            tagIpt.before(`<button class="tag">${val}<span class="remove_tag">×</span></button>`)
            tagIpt.val('')
        }
    })
    
    $('.tags').on('click', evt => {
        const target = $(evt.target)
        if (target.is('.remove_tag')) {
            evt.stopPropagation()
            const parent = target.parent()
            const val = parent.text().slice(0, -1)
            const idx = tags.indexOf(val)
            if (~idx) {
                tags.splice(idx, 1)
                parent.remove()
            }
            return
        }
        tagIpt.focus()
    })
})
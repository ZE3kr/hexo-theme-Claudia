var $posts = {
    scroller: function() {
        function Scroller() {
            this.callbacks = []
            return this
        }
        Scroller.prototype.bindScrollEvent = function() {
            var _that = this

            window.addEventListener('scroll', function(event) {
                var wait = false
                var beforeOffsetY = window.pageYOffset

                if (wait) return
                wait = true

                setTimeout(function() {
                    var params = {
                        event: event,
                        beforeOffsetY: beforeOffsetY,
                    }
                    _that.callbacks.forEach(function(func) {
                        func(params)
                    })

                    wait = false
                }, 150)
            })
        }

        return Scroller
    },
    showTopic: function(evt) {
        var topicEl = document.getElementById('postTopic')
        var postTitle = document.getElementById('postTitle')

        var postTitleCoordinate = postTitle.getBoundingClientRect()
        var threshold = postTitle.offsetTop + postTitleCoordinate.height

        // show title
        if (window.pageYOffset > threshold) {
            var beforeOffsetY = evt && evt.beforeOffsetY
            var isScrollToTop = beforeOffsetY - window.pageYOffset > 0

            topicEl.classList.remove('is-hidden-topic-bar')

            if (beforeOffsetY - window.pageYOffset === 0) {
                topicEl.classList.remove('is-switch-post-title')
                topicEl.classList.remove('is-show-post-title')
                topicEl.classList.remove('immediately-show')

                if (topicEl.classList.contains('is-show-scrollToTop-tips')) {
                    topicEl.classList.remove('is-show-scrollToTop-tips')
                    topicEl.classList.add('is-flash-scrollToTop-tips')
                } else {
                    topicEl.classList.add('immediately-show')
                }
            }
            // scroll to up👆
            else if (isScrollToTop) {
                // show scroll to top tips
                if (window.pageYOffset > window.innerHeight * 2) {
                    topicEl.classList.remove('immediately-show')
                    topicEl.classList.remove('is-show-post-title')
                    topicEl.classList.remove('is-switch-post-title')
                    topicEl.classList.remove('is-flash-scrollToTop-tips')

                    topicEl.classList.add('is-show-scrollToTop-tips')
                }
                // show post title
                else {
                    topicEl.classList.remove('immediately-show')
                    topicEl.classList.remove('is-show-post-title')
                    topicEl.classList.remove('is-show-scrollToTop-tips')
                    topicEl.classList.remove('is-flash-scrollToTop-tips')

                    topicEl.classList.add('is-switch-post-title')
                }
            }
            // scroll to down👇
            else if (beforeOffsetY - window.pageYOffset !== 0) {
                topicEl.classList.remove('immediately-show')
                topicEl.classList.remove('is-switch-post-title')
                topicEl.classList.remove('is-show-scrollToTop-tips')
                topicEl.classList.remove('is-flash-scrollToTop-tips')
                topicEl.classList.add('is-show-post-title')
            }
        } else {
            // hidden all
            topicEl.classList.remove('is-flash-scrollToTop-tips')
            topicEl.classList.remove('is-show-scrollToTop-tips')
            topicEl.classList.remove('is-switch-post-title')
            topicEl.classList.remove('is-show-post-title')
            topicEl.classList.remove('immediately-show')

            topicEl.classList.add('is-hidden-topic-bar')
        }
    },
    catalogueHighlight: function() {
        var directory = document.querySelectorAll('.toc a')
        if (directory.length === 0) {
            return false
        }

        var tocContainer = document.querySelector('.toc')
        return function() {
            var contentTocList = []
            var activeClassName = 'is-active'

            directory.forEach(function(link) {
                if (!link.href) return
                var id = decodeURI(link.href).split('#')[1]
                contentTocList.push(document.getElementById(id))
            })
            var spacing = 60
            var activeTopicEl = null
            var scrollTop = window.pageYOffset
            for (var i = 0; i < contentTocList.length; i++) {
                var currentTopic = contentTocList[i]

                if (currentTopic.offsetTop > scrollTop + spacing / 2) {
                    // jump to next loop
                    continue
                }

                if (!activeTopicEl) {
                    activeTopicEl = currentTopic
                } else if (currentTopic.offsetTop + spacing >= activeTopicEl.offsetTop - spacing) {
                    activeTopicEl = currentTopic
                }

                var beforeActiveEl = document.querySelector('.toc' + ' .' + activeClassName)
                beforeActiveEl && beforeActiveEl.classList.remove(activeClassName)

                var selectTarget = '.toc a[href="#' + encodeURI(activeTopicEl.id) + '"]'
                var direc = document.querySelector(selectTarget)
                direc.classList.add(activeClassName)

                var tocContainerHeight = tocContainer.getBoundingClientRect().height
                if (direc.offsetTop >= tocContainerHeight - spacing) {
                    tocContainer.scrollTo({
                        // top: direc.offsetTop - spacing,
                        top: direc.offsetTop + 100 - tocContainerHeight,
                    })
                } else {
                    tocContainer.scrollTo({
                        top: 0
                    })
                }
            }
        }
    },
    smoothScrollToTop: function() {
        var Y_TopValve = (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop);
        if (Y_TopValve > 1) {
            window.requestAnimationFrame($posts.smoothScrollToTop);
            scrollTo(0, Math.floor(Y_TopValve * 0.85));
        } else {
            scrollTo(0, 0);
        }
    },
    addValineComment() {
        var el = document.getElementById('vcomments')
        new Valine({
            el: '#vcomments',
            appId: el.dataset.comment_valine_id,
            appKey: el.dataset.comment_valine_key
        })
    },
    mounted: function() {
        typeof hljs !== 'undefined' && hljs.initHighlighting()

        var Scroller = this.scroller()
        var scrollerInstance = new Scroller()

        var catalogueHighlight = this.catalogueHighlight()
        catalogueHighlight && scrollerInstance.callbacks.push(catalogueHighlight)

        scrollerInstance.callbacks.push(this.showTopic)

        scrollerInstance.bindScrollEvent()

        $claudia.fadeInImage(document.querySelectorAll('.post-content img'))

        document.getElementById('postTopic').addEventListener('click', this.smoothScrollToTop)

        window.Valine && this.addValineComment()

        var timeout

        function postScroll() {
            if (timeout) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(function() {
                document.querySelectorAll('.content figure').forEach(function(figure) {
                    if (figure.getBoundingClientRect().top + figure.clientHeight < window.innerHeight && figure.getBoundingClientRect().top > 58) {
                        figure.classList.add('hover')
                        hasHover = true
                    } else {
                        figure.classList.remove('hover')
                    }
                })
            }, 100)
        }

        var canScroll = true
        window.addEventListener('load', function() {
            setTimeout(postScroll, 500)
        })
        window.addEventListener('scroll', postScroll)
        document.querySelectorAll('.content figure').forEach(function(figure) {
            window.addEventListener('load', function() {
                figure.querySelectorAll('iframe').forEach(function(iframe) {
                    var url = new URL(iframe.src)
                    if (url.searchParams.get('autoplay') !== 'true') {
                        var player = Stream(iframe)
                        player.addEventListener('play', () => {
                            figure.classList.add('full-screen')
                            window.$claudia.disableScroll()
                        })
                        player.addEventListener('pause', () => {
                            figure.classList.remove('full-screen')
                            window.$claudia.enableScroll()
                        })
                    }
                })
            })

            var img = figure.querySelector('img')

            img.scale = 100
            img.translateX = 0
            img.translateY = 0
            img.scaleBase = 100

            figure.addEventListener('touchstart', function(e) {
                img.scaleBase = img.scale
            })
            figure.addEventListener('touchmove', function(e) {
                if (e.scale !== 1) {
                    e.preventDefault()
                    img.scale = e.scale * img.scaleBase
                    if (img.scale < 100) {
                        img.scale = 100
                    }
                    var transform = `translateY(-50%) scale(${img.scale / 100})`
                    if (transform !== img.style.transform) {
                        img.style.transform = transform
                        if (img.offsetWidth >= 2 * img.offsetHeight) {
                            img.sizes = ((window.innerHeight / img.offsetHeight * img.offsetWidth) * img.scale / 100).toFixed(0) + 'px'
                        } else {
                            img.sizes = (Math.max(img.offsetHeight, img.offsetWidth) * img.scale / 100).toFixed(0) + 'px'
                        }
                    }
                }
            })

            figure.addEventListener(window.$claudia.wheelEvent, function(e) {
                if (figure.classList.contains('full-screen')) {
                    if (e.ctrlKey && e.deltaY !== 0) {
                        img.scale -= e.deltaY
                        figure.scrollLeft -= e.deltaY * window.innerWidth / 200
                        figure.scrollTop -= e.deltaY * window.innerHeight / 200
                        img.translateY = figure.scrollTop * 100 / window.innerHeight
                        if (img.scale < 100) {
                            img.scale = 100
                        }
                        var transform = `translateY(-50%) scale(${img.scale / 100})`
                        if (transform !== img.style.transform) {
                            img.style.transform = transform
                            if (img.offsetWidth >= 2 * img.offsetHeight) {
                                img.sizes = ((window.innerHeight / img.offsetHeight * img.offsetWidth) * img.scale / 100).toFixed(0) + 'px'
                            } else {
                                img.sizes = (Math.max(img.offsetHeight, img.offsetWidth) * img.scale / 100).toFixed(0) + 'px'
                            }
                        }
                        return
                    }

                    img.translateY += e.deltaY * 100 / window.innerHeight
                    if (img.translateY > img.scale) {
                        img.translateY = img.scale
                    }
                    if (img.translateY < 0) {
                        img.translateY = 0
                    }
                    figure.scrollTop = img.translateY / 100 * window.innerHeight
                }
            })

            figure.addEventListener('click', function() {
                if (figure.classList.contains('full-screen')) {
                    figure.classList.remove('full-screen')
                    img.style.transform = ''
                    img.sizes = '(min-width: 1216px) 858px, (min-width: 1024px) 714px, (min-width: 769px) 75vw, 100vw'
                    canScroll = true
                    window.$claudia.enableScroll()
                } else {
                    img.scale = 100
                    img.translateX = 0
                    img.translateY = 0
                    figure.querySelectorAll('img').forEach(function(img) {
                        if (img.offsetWidth >= 2 * img.offsetHeight) {
                            figure.classList.add('panorama')
                            img.sizes = (window.innerHeight / img.offsetHeight * img.offsetWidth) + 'px'
                        } else {
                            img.sizes = 'max(100vw, 100vh)'
                        }
                    })
                    figure.classList.add('full-screen')
                    canScroll = false
                    window.$claudia.disableScroll()
                }
            })
        })
    }
}

$posts.mounted()

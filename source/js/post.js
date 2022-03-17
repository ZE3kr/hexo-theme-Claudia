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
        var directory = document.querySelectorAll('.toc-container .toc a')
        if (directory.length === 0) {
            return false
        }

        var tocContainer = document.querySelector('.toc-container .toc')
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

                var beforeActiveEl = document.querySelector('.toc-container .toc' + ' .' + activeClassName)
                beforeActiveEl && beforeActiveEl.classList.remove(activeClassName)

                var selectTarget = '.toc-container .toc a[href="#' + encodeURI(activeTopicEl.id) + '"]'
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
        var lastScroll
        var loadedHash

        function postScroll() {
            if (lastScroll && lastScroll + 100 < Date.now() && loadedHash != location.hash) {
                loadedHash = location.hash
            }
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

        window.addEventListener('load', function() {
            setTimeout(postScroll, 500)
        })
        window.addEventListener('scroll', $claudia.throttle(postScroll, 500))
        document.querySelectorAll('.content figure').forEach(function(figure) {
            var figcaption = figure.querySelector('figcaption')
            var title = figcaption && figcaption.innerText
            var postTitle = document.getElementById('postTitle')
            title = title || (postTitle && postTitle.innerText)

            window.addEventListener('load', function() {
                var iframe = figure.querySelector('iframe')

                if (iframe) {
                    var url = new URL(iframe.src)
                    if (url.searchParams.get('autoplay') !== 'true') {
                        var player = Stream(iframe)
                        player.addEventListener('play', () => {
                            window._paq && _paq.push(['trackEvent', 'Movie', 'play', title]);
                        })
                        player.addEventListener('pause', () => {
                            window._paq && _paq.push(['trackEvent', 'Movie', 'pause', title]);
                        })
                        player.addEventListener('ended', () => {
                            window._paq && _paq.push(['trackEvent', 'Movie', 'ended', title]);
                        })
                    }
                }
            })

            var img = figure.querySelector('img')

            if (img) {
                img.scale = 100
                img.translateY = 0
                img.scaleBase = 100

                img.onload = function() {
                    if (location.hash && loadedHash != location.hash) {
                        setTimeout(function () {
                                const element = document.querySelector(location.hash)
                                const topPos = element.getBoundingClientRect().top + pageYOffset
                                lastScroll = Date.now()
                                window.scrollTo({ top: topPos })
                        }, 100)
                    }
                }
    
                figure.addEventListener('touchstart', function(e) {
                    img.scaleBase = img.scale
                })
                figure.addEventListener('touchmove', function(e) {
                    if (figure.classList.contains('full-screen') && e.scale !== 1) {
                        e.preventDefault()
                        img.scale = e.scale * img.scaleBase
                        if (img.offsetWidth >= 2 * img.offsetHeight) {
                            var min = 100 * img.offsetHeight / img.offsetWidth * window.innerWidth / window.innerHeight
                            if (img.scale < min) {
                                img.scale = min
                            } else if (img.scale > 200) {
                                img.scale = 200
                            }
                            img.sizes = img.style.width = `${ ((window.innerHeight / img.offsetHeight * img.offsetWidth) * img.scale / 100).toFixed(0) }px`
                            img.style.height = 'auto'
                        } else {
                            if (img.scale < 100) {
                                img.scale = 100
                            } else if (img.scale > 600) {
                                img.scale = 600
                            }
                            if (img.offsetWidth/img.offsetHeight > window.innerWidth/window.innerHeight) {
                                img.style.width = `${ img.scale }vw`
                                img.style.height = 'auto'
                                img.sizes = (window.innerWidth * img.scale / 100).toFixed(0) + 'px'
                            } else {
                                img.style.width = 'auto'
                                img.style.height = `${ img.scale }vh`
                                img.sizes = (window.innerHeight * img.scale / 100).toFixed(0) + 'px'
                            }
                        }
                        if (img.offsetHeight > window.innerHeight) {
                            img.style.top = 0
                        } else {
                            img.style.top = `${ (window.innerHeight - img.offsetHeight)/2 }px`
                        }
                        if (img.style.transform !== 'unset') {
                            img.style.transform = 'unset'
                        }
                    }
                })

                figure.addEventListener(window.$claudia.wheelEvent, function(e) {
                    if (figure.classList.contains('full-screen')) {
                        if (e.ctrlKey && e.deltaY !== 0) {
                            img.scale -= e.deltaY
                            figure.scrollLeft -= e.deltaY * window.innerWidth / 200
                            if (img.offsetWidth >= 2 * img.offsetHeight) {
                                var min = img.offsetHeight / img.offsetWidth * window.innerWidth / window.innerHeight
                                if (img.scale < min) {
                                    img.scale = min
                                } else if (img.scale > 200) {
                                    img.scale = 200
                                }
                                img.sizes = img.style.width = `${ ((window.innerHeight / img.offsetHeight * img.offsetWidth) * img.scale / 100).toFixed(0) }px`
                                img.style.height = 'auto'
                            } else {
                                if (img.scale < 100) {
                                    img.scale = 100
                                } else if (img.scale > 600) {
                                    img.scale = 600
                                }
                                if (img.offsetWidth/img.offsetHeight > window.innerWidth/window.innerHeight) {
                                    img.style.width = `${ img.scale }vw`
                                    img.style.height = 'auto'
                                    img.sizes = (window.innerWidth * img.scale / 100).toFixed(0) + 'px'
                                } else {
                                    img.style.width = 'auto'
                                    img.style.height = `${ img.scale }vh`
                                    img.sizes = (window.innerHeight * img.scale / 100).toFixed(0) + 'px'
                                }
                            }
                            if (img.offsetHeight > window.innerHeight) {
                                img.style.top = 0
                                if (img.style.transform !== 'unset') {
                                    img.style.transform = 'unset'
                                }
                            } else if (img.style.transform !== '') {
                                img.style.top = ''
                                img.style.transform = ''
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
                        window._paq && _paq.push(['trackEvent', 'Picture', 'exit', title])
                        img.style.transform = ''
                        img.style.width = ''
                        img.style.height = ''
                        img.style.maxWidth = ''
                        img.style.maxHeight = ''
                        img.style.top = ''
                        img.sizes = '(min-width: 1805px) 1300px, (min-width: 1408px) 1002px, (min-width: 1216px) 858px, (min-width: 1024px) 714px, (min-width: 769px) 75vw, 100vw'
                        window.$claudia.enableScroll()
                    } else {
                        img.scale = 100
                        img.translateY = 0
                        figure.querySelectorAll('img').forEach(function(img) {
                            img.style.maxWidth = 'unset'
                            img.style.maxHeight = 'unset'
                            if (img.offsetWidth >= 2 * img.offsetHeight) {
                                figure.classList.add('panorama')
                                img.sizes = (window.innerHeight / img.offsetHeight * img.offsetWidth) + 'px'
                            } else {
                                img.sizes = 'max(100vw, 100vh)'
                                if (img.offsetWidth/img.offsetHeight > window.innerWidth/window.innerHeight) {
                                    img.style.width = '100vw'
                                    img.style.height = 'auto'
                                } else {
                                    img.style.width = 'auto'
                                    img.style.height = '100vh'
                                }
                            }
                        })
                        figure.classList.add('full-screen')
                        window._paq && _paq.push(['trackEvent', 'Picture', 'full', title])
                        window.$claudia.disableScroll()
                    }
                })
            }
        })
    }
}

$posts.mounted()

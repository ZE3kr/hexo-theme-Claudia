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

        window.addEventListener('load', function() {
            setTimeout(postScroll, 500)
        })
        window.addEventListener('scroll', postScroll)
        document.querySelectorAll('.content figure').forEach(function(figure) {
            window.addEventListener('load', function() {
                var iframe = figure.querySelector('iframe')
                if (iframe) {
                    var url = new URL(iframe.src)
                    if (url.searchParams.get('autoplay') !== 'true') {
                        var player = Stream(iframe)
                        player.addEventListener('play', () => {
                            // figure.classList.add('full-screen')
                            // window.$claudia.disableScroll()
                            // window.addEventListener('touchmove', window.$claudia.preventDefault, window.$claudia.wheelOpt)
                        })
                        player.addEventListener('pause', () => {
                            // figure.classList.remove('full-screen')
                            // window.$claudia.enableScroll()
                            // window.removeEventListener('touchmove', window.$claudia.preventDefault, window.$claudia.wheelOpt)
                        })
                    }
                }
            })

            var img = figure.querySelector('img')

            if (img) {
                img.scale = 100
                img.translateY = 0
                img.scaleBase = 100
    
                figure.addEventListener('touchstart', function(e) {
                    img.scaleBase = img.scale
                })
                figure.addEventListener('touchmove', function(e) {
                    if (figure.classList.contains('full-screen') && e.scale !== 1) {
                        e.preventDefault()
                        img.scale = e.scale * img.scaleBase
                        window.$claudia.throttle( function () {
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
                        }, 8 )()
                    }
                })

                figure.addEventListener(window.$claudia.wheelEvent, function(e) {
                    if (figure.classList.contains('full-screen')) {
                        if (e.ctrlKey && e.deltaY !== 0) {
                            img.scale -= e.deltaY
                            figure.scrollLeft -= e.deltaY * window.innerWidth / 200
                            window.$claudia.throttle( function () {
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
                            }, 8 )()
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
                        window.$claudia.disableScroll()
                    }
                })
            }
        })
    }
}

$posts.mounted()

// https://developer.matomo.org/guides/media-analytics/custom-player
window.matomoMediaAnalyticsAsyncInit = function () {
    var MA = Matomo.MediaAnalytics;
    function MyPlayer(node, mediaType) {
        // in this class we track interactions with the player
        // instance is created whenever a media for this player was found
        if (node.hasPlayerInstance) {
            // prevent creating multiple trackers for the same media
            // when scanning for media multiple times
            return;
        }
        var player = Stream(iframe)
        node.hasPlayerInstance = true;
        // find the actual resource / URL of the video
        var actualResource = MA.element.getAttribute(node, 'src');
        // a user can overwrite the actual resource by defining a "data-matomo-resource" attribute.
        // the method `getMediaResource` will detect whether such an attribute was set
        var resource = MA.element.getMediaResource(node, actualResource);
        // create an instance of the media tracker.
        // Make sure to replace myPlayerName with your player name.
        var tracker = new MA.MediaTracker('cloudflareStream', mediaType, resource);
        // for video you should detect the width, height, and fullscreen usage, if possible
        tracker.setWidth(node.clientWidth);
        tracker.setHeight(node.clientHeight);
        tracker.setFullscreen(MA.element.isFullscreen(node));
        // the method `getMediaTitle` will try to get a media title from a
        // "data-matomo-title", "title" or "alt" HTML attribute. Sometimes it might be possible
        // to retrieve the media title directly from the video or audio player
        var caption = node
            .parentElement
            .parentElement
            .querySelector('caption')
        caption = caption && caption.innerText
        var title = caption || MA.element.getMediaTitle(node);
        tracker.setMediaTitle(title);
        // some media players let you already detect the total length of the video
        tracker.setMediaTotalLengthInSeconds(player.duration);
        var useCapture = true;
        player.addEventListener('play', function () { // notify the tracker the media is now playing
            tracker.play();
        }, useCapture);
        player.addEventListener('pause', function () { // notify the tracker the media is now paused
            tracker.pause();
        }, useCapture);
        player.addEventListener('ended', function () { // notify the tracker the media is now finished
            tracker.finish();
        }, useCapture);
        player.addEventListener('timeupdate', function () {
            // notify the tracker the media is still playing
            // we update the current made progress (time position) and duration of
            // the media. Not all players might give you that information
            tracker.setMediaProgressInSeconds(node.currentTime);
            tracker.setMediaTotalLengthInSeconds(node.duration);
            // it is important to call the tracker.update() method regularly while the
            // media is playing. If this method is not called eg every X seconds no
            // updated data will be tracked.
            // The method itself will not actually send a tracking request whenever it
            // is called. Instead it will make sure to respect the set ping interval and
            // eg only send a tracking request every 5 seconds.
            tracker.update();
        }, useCapture);
        player.addEventListener('seeking', function () {
            // "seekStart" is needed when the player is seeking or buffering.
            // It will stop the timer that tracks for how long the media has been played.
            tracker.seekStart();
        }, true);
        player.addEventListener('seeked', function () {
            // we update the current made progress (time position) and duration of
            // the media. Not all players might give you that information
            tracker.setMediaProgressInSeconds(node.currentTime);
            tracker.setMediaTotalLengthInSeconds(node.duration);
            // "seekFinish" is needed when the player has finished seeking or buffering.
            // It will start the timer again that tracks for how long the media has been played.
            tracker.seekFinish();
        }, useCapture);
        // for videos it might be useful to listen to the resize event to detect a
        // changed video width or when the video has gone fullscreen
        window.addEventListener('resize', function () {
            tracker.setWidth(node.clientWidth);
            tracker.setHeight(node.clientHeight);
            tracker.setFullscreen(MA.element.isFullscreen(node));
        }, useCapture);
        // here we make sure to send an initial tracking request for this media.
        // This basically tracks an impression for this media.
        tracker.trackUpdate();
    }
    MyPlayer.scanForMedia = function (documentOrElement) {
        // called whenever it is needed to scan the entire document
        // or when a certain element area is scanned for new videos or audio
        documentOrElement.querySelectorAll('figure > div > iframe').forEach(function (video) {
            // for each of the medias found, create an instance of your player as long as the media is
            // not supposed to be ignored via a "data-matomo-ignore" attribute
            if (! MA.element.isMediaIgnored(video)) {
                new MyPlayer(video, MA.mediaType.VIDEO);
                // there is also a MA.mediaType.AUDIO constant if you want to track audio
            }
        })
    };
    // adding the newly created player to the Media Analytics tracker
    MA.addPlayer('cloudflareStream', MyPlayer);
};
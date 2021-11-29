window.$claudia = {
    throttle: function (func, time) {
        var wait = false
        return function () {
            if (wait) return
            wait = true

            setTimeout(function () {
                func()
                wait = false
            }, time || 100)
        }
    },
    fadeInImage: function(imgs, imageLoadedCallback) {
        var images = imgs || document.querySelectorAll('.js-img-fadeIn')

        function loaded(event) {
            var image = event.currentTarget

            image.ontransitionend = function () {
                image.ontransitionend = null
                image.style.transition = null
            }
            image.style.transition = 'opacity 320ms'
            image.style.opacity = 1

            if (image.parentElement && image.parentElement.classList.contains('skeleton')) {
                image.parentElement.classList.remove('skeleton')
            }
            imageLoadedCallback && imageLoadedCallback(image)
        }

        images.forEach(function (img) {
            if (img.complete) {
                return loaded({ currentTarget: img })
            }

            img.addEventListener('load', loaded)
        })
    },
    blurBackdropImg: function(image) {
        if (!image.dataset.backdrop) return

        var parent = image.parentElement //TODO: Not finish yes, must be a pure function
        var parentWidth = Math.round(parent.getBoundingClientRect().width)
        var childImgWidth = Math.round(image.getBoundingClientRect().width)
        var parentHeight = Math.round(parent.getBoundingClientRect().height)
        var childImgHeight = Math.round(image.getBoundingClientRect().height)

        var isCovered = parentWidth === childImgWidth && parentHeight === childImgHeight
        var blurImg = parent.previousElementSibling //TODO: Not finish yes, must be a pure function

        isCovered ? blurImg.classList.add('is-hidden') : blurImg.classList.remove('is-hidden')
    },
    getSystemTheme(callback) {
        var media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', function (e){
            callback && callback(e.matches ? "dark" : "light")
        })

        callback && callback(media.matches ? 'dark' : 'light')
    },

    keys: {37: 1, 38: 1, 39: 1, 40: 1},

    preventDefault(e) {
        e.preventDefault();
    },

    preventDefaultForScrollKeys(e) {
        console.log(this)
        if (this.keys[e.keyCode]) {
            this.preventDefault(e);
            return false;
        }
    },

    // modern Chrome requires { passive: false } when adding event
    supportsPassive: false,
    init() {
        var supportsPassive = false;
        try {
            window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
                get: function () { supportsPassive = true; } 
            }));
        } catch(e) {}
        console.log(supportsPassive)
        this.wheelOpt = supportsPassive ? { passive: false } : false;
        this.wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    },

    // call this to Disable
    disableScroll() {
        window.addEventListener('DOMMouseScroll', this.preventDefault, false); // older FF
        window.addEventListener(this.wheelEvent, this.preventDefault, this.wheelOpt); // modern desktop
        window.addEventListener('touchmove', this.preventDefault, this.wheelOpt); // mobile
        window.addEventListener('keydown', this.preventDefaultForScrollKeys, false);
    },

    // call this to Enable
    enableScroll() {
        window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
        window.removeEventListener(this.wheelEvent, this.preventDefault, this.wheelOpt); 
        window.removeEventListener('touchmove', this.preventDefault, this.wheelOpt);
        window.removeEventListener('keydown', this.preventDefaultForScrollKeys, false);
    }
}

window.$claudia.init();


var appSelector = {

    _currentTarget: null,
    _selectable: true,

    /**
     *
     */
    init: function () {
        console.log('init')

        appSelector.events.init();
    },


    /**
     *
     */
    deinit: function () {
        console.log('deinit')

        $('.__news_selector_overlay').remove();
        appSelector.events.deinit();

        // delete appSelector;
    },


    events: {

        /**
         *
         */
        init: function () {

            document.addEventListener('mouseover', appSelector.events._mouseover);
            document.addEventListener('mouseout', appSelector.events._mouseout);
            document.addEventListener('click', appSelector.events._click);
            document.addEventListener("keydown", appSelector.events._keydown);
        },


        /**
         *
         */
        deinit: function () {
            document.removeEventListener('mouseover', appSelector.events._mouseover);
            document.removeEventListener('mouseout', appSelector.events._mouseout);
            document.removeEventListener('click', appSelector.events._click);
            document.removeEventListener("keydown", appSelector.events._keydown);
        },


        /**
         * @param event
         * @private
         */
        _click: function (event) {

            event.preventDefault();
            event.stopPropagation();

            $('.__news_selector_overlay.__default_overlay').remove();

            // console.log(event.target);
            console.log($(event.target).ellocate().css);

            appSelector._addElementOverlay(event.target, {
                color:'#0014ff',
                className: "__select_element"
            });

            // appSelector._selectable = false;
        },


        /**
         * @param event
         * @private
         */
        _mouseover: function (event) {

            if ( ! appSelector._selectable ||
                appSelector._currentTarget === event.target) {
                return;
            }

            //console.log(event.target)
            appSelector._currentTarget = event.target
            appSelector._addElementOverlay(event.target);
        },


        /**
         * @param event
         * @private
         */
        _mouseout: function (event) {

            if (appSelector._selectable) {
                $('.__news_selector_overlay.__default_overlay').remove();
            }
        },


        /**
         * @param event
         * @private
         */
        _keydown: function (event) {

            if ( ! event.ctrlKey &&
                ! event.altKey &&
                ! event.shiftKey
            ) {
                if (event.keyCode === 13) {
                    console.log('Return')
                } else if (event.keyCode === 27) {
                    console.log('Escape')
                }
            }
        }
    },


    /**
     * Добавление оверлея для элемента
     * @param element
     * @param options
     * @returns {null|HTMLDivElement}
     * @private
     */
    _addElementOverlay: function(element, options) {

        let position = "absolute";
        let offsetX = window.scrollX;
        let offsetY = window.scrollY;

        let color     = options && options.hasOwnProperty('color') ? options.color : '#f00';
        let className = options && options.hasOwnProperty('className') ? options.className : '__default_overlay';


        for (let e = element; e; e = e.parentElement) {
            let style = getComputedStyle(e);

            // If the element isn't rendered (since its or one of its ancestor's
            // "display" property is "none"), the overlay wouldn't match the element.
            if (style.display === "none")
                return null;

            // If the element or one of its ancestors uses fixed postioning, the overlay
            // must too. Otherwise its position might not match the element's.
            if (style.position === "fixed")
            {
                position = "fixed";
                offsetX = offsetY = 0;
            }
        }


        let overlay = document.createElement("div");
        overlay.prisoner = element;
        overlay.className = "__news_selector_overlay " + className;
        overlay.setAttribute("style",
            "opacity:0.4; display:inline-block !important; " +
            "overflow:hidden; box-sizing:border-box; pointer-events:none; background: " + color);
        let rect = element.getBoundingClientRect();
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.style.left = (rect.left + offsetX) + "px";
        overlay.style.top = (rect.top + offsetY) + "px";
        overlay.style.position = position;
        overlay.style.zIndex = 0x7FFFFFFE;

        document.documentElement.appendChild(overlay);
        return overlay;
    },

    
    /**
     * Генератор случайного ключа
     * @param extInt
     * @returns {*}
     * @private
     */
    _keygen : function(extInt) {
        let d = new Date();
        let v1 = d.getTime();
        let v2 = d.getMilliseconds();
        let v3 = Math.floor((Math.random() * 1000) + 1);
        let v4 = extInt ? extInt : 0;

        return 'A' + v1 + v2 + v3 + v4;
    },
}





$(function () {

    chrome.storage.local.get(['status'], function(result) {
        if (result.status === 'on') {
            appSelector.init();
        }
    });
});



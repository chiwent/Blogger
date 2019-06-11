
/**
 * 纵向滚动函数组件
 */
/**
 * 
 * @param { Object } element 目标DOM
 * @param { Number } scrollTargetY  滚动的目标高度
 * @param { Number } speed 动画持续事件
 * @param { String } easing  滚动的加速度：easeOutSine、easeInOutSine、easeInOutQuint
 */
export const scrollToY = (element, scrollTargetY, speed, easing) => {
    let scrollY = element.scrollTop,
        currentTime = 0;
    scrollTargetY = scrollTargetY || 0;
    speed = speed || 2000;
    easing = easing || 'easeOutSine';
    // min time .1, max time .8 seconds
    let time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, .8));

    /**
    * requestAnimFrame polyfill
    */
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
    let easingEquations = {
        easeOutSine: function (pos) {
            return Math.sin(pos * (Math.PI / 2));
        },
        easeInOutSine: function (pos) {
            return (-0.5 * (Math.cos(Math.PI * pos) - 1));
        },
        easeInOutQuint: function (pos) {
            if ((pos /= 0.5) < 1) {
                return 0.5 * Math.pow(pos, 5);
            }
            return 0.5 * (Math.pow((pos - 2), 5) + 2);
        }
    };

    // add animation loop
    function tick() {
        currentTime += 1 / 60;

        let p = currentTime / time;
        let t = easingEquations[easing](p);

        if (p < 1) {
            requestAnimFrame(tick);

            element.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t));
        } else {
            element.scrollTo(0, scrollTargetY);
        }
    }
    // call it once to get started
    tick();
};


'use strict';

Date.prototype.format = function (fmt) {
    let o = {
        'M+': this.getMonth() + 1,                 //月份
        'd+': this.getDate(),                    //日
        'h+': this.getHours(),                   //小时
        'm+': this.getMinutes(),                 //分
        's+': this.getSeconds(),                 //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
}



/**
 * 设置本地存储
 * @param { Object } params 
 */
export const setStorage = params => {
    let { name, content, type } = params;
    if (!type) {
        type = 'local';
    }
    let obj = {
        dataType: Object.prototype.toString.call(content).slice(8, -1),
        content: content,
        type: type,
        date: new Date().getTime()
    };
    if (type === 'session') {
        return sessionStorage.setItem(name, JSON.stringify(obj));
    } else if (type === 'local') {
        return localStorage.setItem(name, JSON.stringify(obj));
    }
}

/**
 * 获取本地存储
 * @param { Object } params 
 */
export const getStorage = params => {
    let { name, type } = params;
    if (!type) {
        type = 'local';
    }
    if (name) {
        if (type === 'session') {
            return JSON.parse(sessionStorage.getItem(name))
        } else if (type === 'local') {
            return JSON.parse(localStorage.getItem(name));
        }
    } else {
        return null;
    }
}

/**
 * 根据键名删除本地存储
 * @param { Object } params 
 */
export const removeStorage = params => {
    let { name, type } = params;
    if (!type) {
        type = 'local';
    }
    if (type === 'session') {
        sessionStorage.removeItem(name);
    } else if (type === 'local') {
        localStorage.removeItem(name);
    }
}

/**
 * 删除指定类型的全部存储
 * @param { String } type 存储的类型
 */
export const clearStorage = (type = 'local') => {
    if (type === 'session') {
        sessionStorage.clear();
    } else if (type === 'local') {
        localStorage.clear();
    }
}
/**
 * @desc 下拉加载更多的插件
 * @author winter min
 * @Date 20170804
 * @version 0.0.1
 */
;(function ($, window) {
    'use static';
    //本身默认的参数设置
    var parameters = {
        loading: false,
        upInsertDOM: false
    };

    $.fn.JsDropLoad = function (options) {
        var _this = this;
        var defaults = {
            ele: _this,
            domUp: {
                domClass: 'dropload-up',
                domRefresh: '<div class="dropload-refresh">↓下拉刷新</div>',
                domUpdate: '<div class="dropload-update">↑释放更新</div>',
                domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
            },
            domDown: {
                domClass: 'dropload-down',
                domRefresh: '<div class="dropload-refresh">↑上拉加载更多哈哈哈哈哈</div>',
                domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                domNoData: '<div class="dropload-noData">暂无数据</div>'
            }
        };

        _this.settings = $.extend(true, {}, defaults, options);


        var _init = function () {
            var settings = _this.settings;
            var ele = settings.ele[0];
            parameters.totalHeight = ele.scrollHeight;
            parameters.scrollTop = ele.scrollTop;
            parameters.clientHeight = ele.clientHeight;
            parameters.distance = 50;

            //如果需要加载下方，事先在下方插入DOM
            if (settings.loadDownFn != '') {
                if (settings.isNoData) {
                    settings.ele.append('<div class="' + settings.domDown.domClass + '">' + settings.domDown.domNoData + '</div>');
                } else {
                    settings.ele.append('<div class="' + settings.domDown.domClass + '">' + settings.domDown.domRefresh + '</div>');
                }
                settings.$domDown = $('.' + settings.domDown.domClass);
            }
            fnTouchStart();
            fnTouchmove();
            fnTouchend();
            fnScroll();
        }

        //刚触摸
        var fnTouchStart = function () {
            _this.off('touchstart').on('touchstart', function (e) {
                if (!parameters.loading) {
                    parameters._startY = e.originalEvent.touches[0].pageY;
                    //触摸时候的scrollTop
                    parameters.touchScrollTop = _this.settings.ele[0].scrollTop;
                }
            });
        }

        var fnTouchmove = function () {
            _this.off('touchmove').on('touchmove', function (e) {
                if (!parameters.loading) {
                    parameters._cutY = e.originalEvent.touches[0].pageY;
                    parameters._moveY = parameters._cutY - parameters._startY;
                    if (parameters._moveY > 0) {
                        parameters.direction = 'down';
                    } else if (parameters._moveY < 0) {
                        parameters.direction = 'up';
                    }
                    var _absMoveY = Math.abs(parameters._moveY);
                    //下拉
                    if (_this.settings.loadDownFn != '' && parameters.touchScrollTop <= 0 && parameters.direction == 'down') {
                        e.preventDefault();
                        _this.settings.$domUp = $('.' + _this.settings.domUp.domClass);
                        //加载区没有DOM
                        if (!parameters.upInsertDOM) {
                            _this.prepend('<div class="' + _this.settings.domUp.domClass + '"></div>');
                            parameters.upInsertDOM = true;
                        }

                        // 下拉距离 < 指定距离
                        if (_absMoveY <= parameters.distance) {
                            parameters._offsetY = _absMoveY;
                            _this.settings.$domUp.html(_this.settings.domUp.domRefresh);
                            // 指定距离 < 下拉距离 < 指定距离*2
                        } else if (_absMoveY > parameters.distance && _absMoveY <= parameters.distance * 2) {
                            parameters._offsetY = parameters.distance + (_absMoveY - parameters.distance) * 0.5;
                            _this.settings.$domUp.html(_this.settings.domUp.domUpdate);
                        } else {
                            parameters._offsetY = parameters.distance + parameters.distance * 0.5 + (_absMoveY - parameters.distance * 2) * 0.2;
                        }
                        _this.settings.$domUp.css({'height': parameters._offsetY});
                    }
                }
            });
        }

        var fnTouchend = function () {
            _this.off('touchend').on('touchend', function (e) {
                var _absMoveY = Math.abs(parameters._moveY);
                if (_this.settings.loadDownFn != '' && parameters.touchScrollTop <= 0 && parameters.direction == 'down') {
                    if (_absMoveY > parameters.distance) {
                        _this.settings.$domUp.css({'height': _this.settings.$domUp.children().height()});
                        _this.settings.$domUp.html(_this.settings.domUp.domLoad);
                        parameters.loading = false;
                        _this.settings.loadUpFn(_this);
                    } else {
                        _this.settings.$domUp.css({'height': 0});
                        parameters.upInsertDOM = false;
                        _this.settings.$domUp.remove();
                    }
                    parameters._moveY = 0;
                }
            });
        }

        //加载下方
        var fnScroll = function () {
            _this.off('scroll').on('scroll', function () {
                parameters.scrollTop = _this.settings.ele[0].scrollTop;
                if ((parameters.totalHeight - parameters.scrollTop - parameters.clientHeight < parameters.distance) && !parameters.loading) {
                    loadDown(_this);
                }
            })
        }

        //下拉调用的函数
        var loadDown = function (_this) {
            parameters.loading = true;
            _this.settings.$domDown.html(_this.settings.domDown.domLoad);
            _this.settings.loadDownFn(_this);
        }

        //重新获取文档高度
        var recoverContHeightFn = function () {
            parameters.totalHeight = _this.settings.ele[0].scrollHeight;
        }

        //数据加载了之后重置
        this.resetload = function (flag) {
            var _this = this;
            if (parameters.direction == 'down' && parameters.upInsertDOM) {
                _this.settings.$domUp.css({'height': 0});
                parameters.upInsertDOM = false;
                parameters.loading = false;
                _this.settings.$domUp.remove();
                recoverContHeightFn();
            } else {
                if (!flag) {
                    parameters.loading = false;
                    _this.settings.$domDown.html(_this.settings.domDown.domRefresh);
                    recoverContHeightFn();
                } else {
                    _this.settings.$domDown.html(_this.settings.domDown.domNoData);
                }

            }
        }

        //启动插件
        _init();
        return this;
    }

})(window.jQuery || window.Zepto, window);
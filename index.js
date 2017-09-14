/**
 * @desc 加载更多真实的数据
 * @author winter min
 * @date 20170725
 * @version 0.0.1
 */
$(function () {
    var $wrap = $('div.dropload-wrap');
    var dropload = null;

    function init() {
        getData('first');
    }

    init();

    function getData(isFirst, _this) {
        var page = 1;
        if (_this) {
            page = _this.settings.page;
        }
        $.ajax({
            url: 'http://www.bilibili.com/activity/likes/list/10026?t=' + new Date().getTime(),
            dataType: 'jsonp',
            type: 'GET',
            data: {
                order: 'like',
                page: page,
                pagesize: 15
            }
        }).then((data) => {
            data = data || {};
            var list;
            if (data.code === 0) {
                list = data.data.list || [];
                // 为了测试，延迟0.3秒加载
                if (list.length > 0) {
                    if (isFirst == 'first') {
                        bindDomList(list, false);
                        list.length < 15 ? dropInit(true) : dropInit(false);
                    } else if (isFirst == 'refresh') {
                        setTimeout(function () {
                            bindDomList(list, false);
                            _this.resetload();
                        }, 300);
                    } else {
                        setTimeout(function () {
                            bindDomList(list, true);
                            data.length < 15 ? _this.resetload(true) : _this.resetload(false);
                        }, 300);
                    }
                }
            }
        }, (error) => {

        });
    }

    function bindDomList(lists, isOnceLoaded) {
        let cont = '';
        let $list = $('ul.list', $wrap);
        for (let i = 0, len = lists.length, item; i < len; i++) {
            item = lists[i];
            cont += [
                '<li>',
                '<a href="#" class="l-item">',
                '<h3 class="l-msg">' + item.message + '</h3>',
                '<span class="l-time">' + item.ctime + '</span>',
                '</a>',
                '</li>'
            ].join('');
        }
        !isOnceLoaded ? $list.html(cont) : $list.append(cont);
    }

    function dropInit(isNoData) {
        $('.cont').JsDropLoad({
            page: 1,
            isNoData: isNoData,
            domDown: {
                domClass: 'dropload-down',
                domRefresh: '<div class="dropload-refresh">↑上拉加载更多。。。。。</div>',
                domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                domNoData: '<div class="dropload-noData">暂无数据</div>'
            },
            domUp: {
                domClass: 'dropload-up',
                domRefresh: '<div class="dropload-refresh">↓下拉刷新</div>',
                domUpdate: '<div class="dropload-update">↑释放更新</div>',
                domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
            },
            loadUpFn: function (_this) {
                _this.settings.page = 1;
                getData('refresh', _this);
            },
            loadDownFn: function (_this) {
                _this.settings.page++;
                getData('more', _this);
            }
        });
    }

});


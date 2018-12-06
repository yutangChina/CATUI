/**
 * catProgress v1.0.0
 * Author Tang Yu
 * Date  2018.12.04
 */
jQuery.fn.catProgress = function (obj) {
    /**----------------------------参数初始化定义区--------------------------------------------------------------*/
    //var canSlide = false; //是否可以滑动
    var size = 's'; //s 小号 2px  m 中等 6px  b 大号 18px u 自定义
    var type = 's'; //s success #5FB878 ; w warning #FFA000; e error #f54242
    var uStyle = {
        'pStyle': {},
        'bStyle': {}
    }; //自定义的样式
    var percent = '0'; //进度 不大于100的数字
    var _barDomTree = ''; //进度的dom对象
    /**----------------------------配置处理区-------------------------------------------------------------------*/
    /**
     * 型号的参数配置
     */
    if (obj['size'] != undefined) {
        size = obj['size'];
    }
    /**
     * 样式的参数配置
     */
    if (obj['type'] != undefined) {
        type = obj['type'];
    }
    /**
     * 自定义样式的参数配置
     */
    if (obj['uStyle'] != undefined) {
        uStyle = obj['uStyle'];
    }
    /**
     * 进度
     */
    if (obj['percent'] != undefined) {
        percent = obj['percent'];
    }
    /**----------------------------方法区----------------------------------------------------------------------*/
    /**
     * 生成progress的虚拟dom
     */
    function _handleProgressToVirDom() {
        var _bgStyle = 'position:relative;border-radius:20px;background-color:#e2e2e2;width:100%;';
        switch (size) {
            case 's':
                _bgStyle += 'height:2px;';
                break;
            case 'm':
                _bgStyle += 'height:6px;';
                break;
            case 'b':
                _bgStyle += 'height:18px;';
                break;
            case 'u':
                if (uStyle['pStyle']) {
                    for (var o in uStyle['pStyle']) {
                        _bgStyle += o + ':' + uStyle['pStyle'][o] + ';';
                    }
                }
                break;
        }
        return {
            tagName: 'div',
            props: {
                style: _bgStyle
            },
            children: []
        };
    }
    /**
     * 生成进度的虚拟dom
     */
    function _handleBarToVirDom() {
        var _barStyle = 'position:absolute;left:0;top:0;border-radius:20px;';
        switch (size) {
            case 's':
                _barStyle += 'height:2px;';
                break;
            case 'm':
                _barStyle += 'height:6px;';
                break;
            case 'b':
                _barStyle += 'height:18px;';
                break;
            case 'u':
                if (uStyle['bStyle']) {
                    for (var o in uStyle['bStyle']) {
                        _barStyle += o + ':' + uStyle['bStyle'][o] + ';';
                    }
                }
                break;
        }
        if (size != 'u') {
            switch (type) {
                case 's':
                    _barStyle += 'background-color:#5FB878;';
                    break;
                case 'w':
                    _barStyle += 'background-color:#FFA000;';
                    break;
                case 'e':
                    _barStyle += 'background-color:#f54242;';
                    break;
            }
        }
        _barStyle += 'width:' + percent + '%;'
        return {
            tagName: 'div',
            props: {
                style: _barStyle
            },
            children: []
        };

    }
    /**
     * 根据虚拟dom对象生成对应的dom结构并返回 真正的HTMLDOMElement对象
     * @param {virtual dom} obj 
     */
    function _renderVirDom(obj) {
        var ele = document.createElement(obj.tagName);
        for (var i in obj.props) {
            ele.setAttribute(i, obj.props[i]);
        }
        var children = obj.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i].__proto__ == String.prototype) {
                ele.appendChild(document.createTextNode(children[i]));
            } else {
                ele.appendChild(_renderVirDom(children[i]));
            }
        }
        return ele;
    }
    /**----------------------------自带方法添加区---------------------------------------------------------------*/
    /**
     * 设置新的进度
     */
    this.setPercent = function (p) {
        _barDomTree.style.width = p + '%';
    }
    /**----------------------------初始化执行区----------------------------------------------------------------*/
    /**
     * 生成进度条的虚拟dom
     */
    var _pgVirDom = _handleProgressToVirDom();
    /**
     * 生成进度条的实际dom树
     */
    var _pgDomTree = _renderVirDom(_pgVirDom);
    /**
     * 进度的虚拟dom
     */
    var _barVirDom = _handleBarToVirDom();
    /**
     * 进度的实际dom树
     */
    _barDomTree = _renderVirDom(_barVirDom);
    /**
     * 将进度填入具体的进度条中
     */
    _pgDomTree.appendChild(_barDomTree);
    /**
     * 插入到具体的元素中
     */
    this.append(_pgDomTree);
    /**
     * 返回实例
     */
    return this;
}
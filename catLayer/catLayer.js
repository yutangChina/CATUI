/**
 * catLayer v1.0.0
 * Author Tang Yu
 * Date
 */
jQuery.catLayer = function (obj) {
    /**----------------------------参数初始化定义区--------------------------------------------------------------*/
    var content = ''; //弹窗内的内容元素
    var minWidth = 420; //默认宽度
    var minHeight = 315; //默认高度
    var top = ''; //位置
    var left = ''; //位置
    var _contentDomTree = '';
    var _catLayer = {}; //方法绑定的实体
    var _layerDomTree = ''; //layer的实体
    /**----------------------------配置处理区-------------------------------------------------------------------*/
    //layer内的内容必须要有
    if (obj['content'] == undefined) {
        throw 'content must be defined!'
    }
    content = obj['content'];
    //弹框的最小宽度
    if (obj['minWidth'] != undefined) {
        minWidth = obj['minWidth'];
    }
    //弹框的最小高度
    if (obj['minHeight'] != undefined) {
        minWidth = obj['minHeight'];
    }
    //弹框距离上面的位置
    if (obj['top'] != undefined) {
        top = obj['top'];
    }
    //弹框距离左边的位置
    if (obj['left'] != undefined) {
        left = obj['left'];
    }
    /**----------------------------方法区----------------------------------------------------------------------*/
    /**
     * 生成对应的layer遮罩层虚拟dom
     */
    function _handleLayerToVirDom() {
        return {
            tagName: 'div',
            props: {
                class: 'catLayer'
            },
            children: []
        }
    }
    /**
     * 生成对应的遮罩层中的元素内容虚拟dom
     */
    function _handleContinerToVirDom() {
        if (top == '') {
            var _inHeight = window.innerHeight; //窗口视图的高度
            var _offsetHeight = _contentDomTree.offsetHeight < minHeight ? minHeight : _contentDomTree.offsetHeight //元素的实际高度
            var _continerHeight = _offsetHeight + 16;
            if (_inHeight < _continerHeight) {
                top = '0';
            } else {
                top = (_inHeight - _continerHeight) / 2 + '';
            }
        }
        if (left == '') {
            var _offsetWidth = _contentDomTree.offsetWidth < minWidth ? minWidth : _contentDomTree.offsetWidth //元素的实际宽度
            var _inWidth = window.innerWidth; //窗口视图的宽度
            var _continerWidth = _offsetWidth + 16;
            if (_inWidth < _continerWidth) {
                left = '0';
            } else {
                left = (_inWidth - _continerWidth) / 2 + '';
            }
        }

        return {
            tagName: 'div',
            props: {
                style: 'background: #FFF;padding:8px;position:absolute;min-width:' + minWidth + 'px;min-height:' + minHeight + 'px;top:' + top + 'px;left:' + left + 'px;'
            },
            children: []
        }
    }

    /**
     * 将实际的内容处理为虚拟dom
     */
    function _handleContentToVirDom() {
        if (content.__proto__ == String.prototype) {
            return _textToVirDom(content)[0];
        } else if (content.__proto__ == jQuery.prototype) {
            var _tempDiv = $('<div></div>');
            _tempDiv.append(content);
            var _str = _tempDiv.html();
            return _textToVirDom(_str)[0];
        }
    }
    /**
     * 从字符串转为虚拟dom
     */
    function _textToVirDom(htmlText) {
        var _iteration = function (continer, _childDom) {
            for (var i = 0; i < _childDom.length; i++) {
                var _tempVirDom = {
                    'tagName': '',
                    'props': {},
                    'children': []
                };
                var _tempDom = _childDom[i];
                _tempVirDom['tagName'] = _tempDom.tagName;
                var _attr = _tempDom['attributes'];
                for (var j = 0; j < _attr.length; j++) {
                    _tempVirDom['props'][_attr[j]['nodeName']] = _attr[j]['nodeValue'];
                }
                var _nextChildren = _tempDom.children;
                if (_nextChildren.length > 0) {
                    _iteration(_tempVirDom.children, _nextChildren);
                } else {
                    if (_tempDom.innerHTML != '') {
                        _tempVirDom.children.push(_tempDom.innerHTML);
                    }
                }
                continer.push(_tempVirDom);
            }
        }
        var _virDomArr = [];
        var _div = document.createElement('div');
        _div.innerHTML = htmlText;
        var _childDom = _div.children;
        _iteration(_virDomArr, _childDom);
        return _virDomArr;
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
     * 获取内容实体Dom
     */
    _catLayer.getContent = function () {
        return _contentDomTree;
    }
    /**
     * 关闭弹框
     */
    _catLayer.closeLayer = function () {
        _layerDomTree.remove();
        return true;
    }

    /**----------------------------初始化执行区----------------------------------------------------------------*/

    /**
     * 生成遮罩层的虚拟dom
     */
    var _layerVirDom = _handleLayerToVirDom();
    /**
     * 生成实际的遮罩层dom树
     */
    _layerDomTree = _renderVirDom(_layerVirDom);
    /**
     * 获取内容的虚拟dom
     */
    var _contentVirDom = _handleContentToVirDom();
    /**
     * 生成内容的实际dom树
     */
    _contentDomTree = _renderVirDom(_contentVirDom);
    /**
     * 插入实际的页面中才会有具体的height与width
     */
    $('body').append(_contentDomTree);
    /**
     * 生成承载内容的虚拟dom
     */
    var _continerVirDom = _handleContinerToVirDom();
    /**
     * 生成承载内容的实际dom树
     */
    var _continerDomTree = _renderVirDom(_continerVirDom);
    /**
     * 内容插入容器中
     */
    _continerDomTree.appendChild(_contentDomTree);
    /**
     * 容器插入遮罩中
     */
    _layerDomTree.appendChild(_continerDomTree);
    /**
     * 页面实际元素中假如弹框
     */
    $('body').append(_layerDomTree);
    /**
     * 返回方法绑定的实体
     */
    return _catLayer;
}
/**
 * catTag v1.0.0
 * Author Tang Yu
 * Date
 */
jQuery.fn.catTag = function (obj) {
    /**----------------------------参数初始化定义区--------------------------------------------------------------*/
    var tags = []; //tag数据 [{title:'',value:'',icon:'',choose:''},{title:'',value:'',icon:'',choose:''}]
    var afterClick = function () {}; //点击对应tag后启动的方法
    var _tagTotal = 0; //步骤的个数
    var _chooseIndex = -1; //被选中的tag的下标
    var _tagDomArray = []; //存储tag的dom数组
    var _tagContinerDiv = []; //存储生成的对应的内容容器
    /**----------------------------配置处理区-------------------------------------------------------------------*/
    //校验是否存在tags
    if (obj['tags'] == undefined) {
        throw 'tags must be defiend!';
    }
    //tags中只能有一个choose为true
    var _chooseNum = 0;
    for (var _i = 0; _i < obj['tags'].length; _i++) {
        if (obj['tags'][_i]['choose']) _chooseNum++;
    }
    if (_chooseNum > 1) {
        throw 'tags which is be choosed must be one or zero!';
    }
    tags = obj['tags']; //赋值
    _tagTotal = tags.length;
    if (obj['afterClick'] != undefined) {
        if (obj['afterClick'].__proto__ != Function.prototype) {
            throw 'afterClick must be function!';
        }
        afterClick = obj['afterClick'];
    }
    /**----------------------------方法区----------------------------------------------------------------------*/

    /**
     * 处理tag为虚拟dom
     */
    function _handleTagsToVirDom() {
        var _mainVirDom = {
            'tagName': 'ul',
            'props': {
                class: 'cat-tag'
            },
            children: []
        };
        var _mainChildren = _mainVirDom.children;
        for (var i = (_tagTotal - 1); i > -1; i--) {
            var _temp = tags[i];
            //初始化属性
            var _props = {
                'tagValue': _temp['value'], //自定义属性，存储value值
                'tagIndex': i //是第几个
            };
            //检验使用哪个class
            if (_temp['choose']) {
                //被选中
                _props['class'] = 'cat-tag-hover'
                _chooseIndex = i;
            }

            var _children = [];
            //是否有图标
            if (_temp['icon'] != undefined) {
                var _iconArray = _textToVirDom(_temp['icon']);
                for (var ic = 0; ic < _iconArray.length; ic++) {
                    _children.push(_iconArray[ic]);
                }
            }
            //标题
            _children.push(_temp['title']);
            var _liVirDom = {
                'tagName': 'li',
                props: _props,
                children: _children
            }
            _mainChildren.unshift(_liVirDom); //开头添加元素

        }
        return _mainVirDom;
    }

    /**
     * 生成对应的内容容器虚拟dom
     */
    function _generateContiner() {
        var _continerVirDom = [];
        for (var i = 0; i < _tagTotal; i++) {
            _continerVirDom.push({
                'tagName': 'div',
                'props': {
                    'style': 'display:none;'
                },
                'children': []
            });
        }
        return _continerVirDom;
    }


    /**
     * 为每个tag添加事件
     */
    function _clickTag() {
        for (var i = 0; i < _tagTotal; i++) {
            _tagDomArray[i].addEventListener('click', function () {
                var _tagIndex = Number(this.getAttribute('tagIndex')); //点击的tag的序号
                //点击序号与当前所处序号不一致的时候需要触发 
                //第一次触发
                if (_chooseIndex == -1) {
                    this.className += ' cat-tag-hover';
                } else if (_chooseIndex != _tagIndex) {
                    _tagDomArray[_chooseIndex].className = _tagDomArray[_chooseIndex].className.replace('cat-tag-hover', '').trim();
                    this.className += ' cat-tag-hover';
                }
                _chooseIndex = _tagIndex;
                _showContinerDiv();
                afterClick.call(this, tags[_chooseIndex], _tagContinerDiv[_chooseIndex]);
            });
        }
    }
    /**
     * 展示与之对应的div
     */
    function _showContinerDiv() {
        for (var i = 0; i < _tagTotal; i++) {
            _tagContinerDiv[i].style.display = 'none';
        }
        _tagContinerDiv[_chooseIndex].style.display = '';
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
     * 获取当前步骤的信息
     */
    this.getCurrentTag = function () {
        return tags[_chooseIndex];
    }
    /**
     * 获取当前步骤的div
     */
    this.getCurrentDiv = function () {
        return _tagContinerDiv[_chooseIndex];
    }
    /**----------------------------初始化执行区----------------------------------------------------------------*/
    /**
     * 生成tag的虚拟dom
     */
    var _tagVirDom = _handleTagsToVirDom();
    /**
     * 生成实际的tag的dom树结构
     */
    var _tagDomTree = _renderVirDom(_tagVirDom);
    /**
     * 将_tagDomTree的子元素集合赋给 _tagDomArray
     */
    _tagDomArray = _tagDomTree.children;
    /**
     * 生成对应的div的虚拟dom
     */
    var _continerVirDom = _generateContiner();

    /**
     * 生成对应的容器树并插入到集合里面
     */
    for (var i = 0; i < _tagTotal; i++) {
        _tagContinerDiv.push(_renderVirDom(_continerVirDom[i]));
    }

    /**
     * 将step dom树插入真实的页面上
     */
    this.append(_tagDomTree);

    /**
     * 将容器插入到真实页面上
     */
    for (var i = 0; i < _tagTotal; i++) {
        this.append(_tagContinerDiv[i]);
    }
    /**
     * 如果初始化了选中步骤，则将该步骤下的div显示出来
     */
    if (_chooseIndex > -1) {
        _tagContinerDiv[_chooseIndex].style.display = '';
        afterClick.call(this, tags[_chooseIndex], _tagContinerDiv[_chooseIndex]);
    }
    /**
     * 为tag添加点击事件
     */
    _clickTag();
    /**
     * 返回this
     */
    return this;

}
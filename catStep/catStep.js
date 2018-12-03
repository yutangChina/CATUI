/**
 * catStep v1.0.0
 * Author Tang Yu
 * Date
 */
jQuery.fn.catStep = function (obj) {

    /**----------------------------参数初始化定义区-------------------------------------------------------------*/
    var steps = []; //步骤的数据数组   [{title:'111',value:'1111',icon:'',choose:''}]
    var canClickStep = true; //是否可以点击生成的step 默认为true
    var showStepNum = true; //是否显示数字
    var afterClick = function () {}; //步骤条跳转后启动的方法
    var _stepTotal = 0; //步骤的个数
    var _chooseIndex = -1; //被选中的step的下标
    var _stepDomArray = []; //存储step的dom数组
    var _stepContinerDiv = []; //存储生成的对应的内容容器
    var _canclickstep = true; //记录原始值
    /**----------------------------配置处理区------------------------------------------------------------------*/

    //校验是否存在steps
    if (obj['steps'] == undefined) {
        throw 'steps must be defiend!';
    }
    steps = obj['steps']; //赋值
    _stepTotal = steps.length;
    //是否可以点击step条
    if (obj['canClickStep'] != undefined) {
        canClickStep = obj['canClickStep'];
        _canclickstep = canClickStep;
    }
    //是否显示步骤上的数字
    if (obj['showStepNum'] != undefined) {
        showStepNum = obj['showStepNum'];
    }
    if (obj['afterClick'] != undefined) {
        if (obj['afterClick'].__proto__ != Function.prototype) {
            throw 'afterClick must be function!';
        }
        afterClick = obj['afterClick'];
    }

    /**----------------------------方法区---------------------------------------------------------------------*/
    /**
     * 处理步骤条数据为虚拟dom
     */
    function _handleStepsToVirDom() {
        var _mainVirDom = {
            'tagName': 'div',
            'props': {
                class: 'cat-step'
            },
            children: []
        };
        var _mainChildren = _mainVirDom.children;
        var _choose = false;
        for (var i = (_stepTotal - 1); i > -1; i--) {
            var _temp = steps[i];
            //初始化属性
            var _props = {
                'stepValue': _temp['value'], //自定义属性，存储value值
                'stepIndex': i //是第几个
            };
            //检验使用哪个class
            if (_temp['choose']) {
                //被选中
                _props['class'] = 'cat-step-hover'
                _choose = true;
                _chooseIndex = i; //标记当前选中的step下标
            } else if (!_temp['choose'] && _choose) {
                _props['class'] = 'cat-step-over'
            }

            var _children = [];
            //是否展示数字
            if (showStepNum) {
                _children.push(i + 1 + '  ');
            }
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
        for (var i = 0; i < _stepTotal; i++) {
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
     * 为step添加点击事件
     */
    function _clickStep() {
        for (var i = 0; i < _stepDomArray.length; i++) {
            _stepDomArray[i].addEventListener('click', function () {
                if (!canClickStep) {
                    return;
                }
                var _stepIndex = Number(this.getAttribute('stepindex'));
                if (_chooseIndex == -1) { //第一次选择
                    this.className += ' cat-step-hover';
                    for (var t = 0; t < _stepIndex; t++) {
                        _stepDomArray[t].className += ' cat-step-over';
                    }
                } else if (_chooseIndex != _stepIndex) { //不是第一次选择
                    var _className = this.className;
                    _className = _className.replace('cat-step-over', '');
                    this.className = _className.trim() + ' cat-step-hover';
                    for (var t = 0; t < _stepTotal; t++) {
                        if (t == _stepIndex) {
                            continue;
                        }
                        var _tClass = _stepDomArray[t].className;
                        _tClass = _tClass.replace('cat-step-hover', '');
                        if (t < _stepIndex) {
                            _tClass = _tClass.trim();
                            if (_tClass.indexOf('cat-step-over') < 0) {
                                _tClass += ' cat-step-over';
                            }
                        } else if (t > _stepIndex) {
                            _tClass = _tClass.replace('cat-step-over', '');
                            _tClass = _tClass.trim();
                        }
                        _stepDomArray[t].className = _tClass;
                    }
                }
                _chooseIndex = _stepIndex; //将选中的index下标给全局变量
                _showContinerDiv();
                afterClick.call(this,steps[_chooseIndex],_stepContinerDiv[_chooseIndex]);
            });
        }
    }
    /**
     * 步骤点击显示对应的div
     */
    function _showContinerDiv() {
        for (var i = 0; i < _stepContinerDiv.length; i++) {
            _stepContinerDiv[i].style.display = 'none';
        }
        _stepContinerDiv[_chooseIndex].style.display = '';
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

    /**--------------------- 自带方法添加区 ---------------------------------------------------------------------*/
    /**
     * 下一步
     */
    this.nextStep = function () {
        if (_chooseIndex >= (_stepTotal - 1)) {
            return false;
        }
        canClickStep = true;
        _stepDomArray[_chooseIndex + 1].click();
        canClickStep = _canclickstep;
        return true;
    }
    /**
     * 上一步
     */
    this.previousStep = function () {
        if (_chooseIndex <= 0) {
            return false;
        }
        canClickStep = true;
        _stepDomArray[_chooseIndex - 1].click();
        canClickStep = _canclickstep;
        return true;
    }
    /**
     * 获取当前步骤的信息
     */
    this.getCurrentStep = function () {
        return steps[_chooseIndex];
    }
    /**
     * 获取当前步骤的div
     */
    this.getCurrentDiv = function () {
        return _stepContinerDiv[_chooseIndex];
    }
    /**
     * 设置跳转到哪个step
     */
    this.setStepTo = function (p) {
        if (!/^[0-9]+$/.test(p + '')) {
            throw 'argument must be zero or positive integer!'
        }
        if ((p + 1) > _stepTotal) {
            return false;
        }
        _stepDomArray[p].click();
        return true;
    }


    /**--------------------- 初始化执行区 ---------------------------------------------------------------------*/

    /**
     * 生成step的虚拟dom
     */
    var _stepVirDom = _handleStepsToVirDom();
    /**
     * 生成真实的stepDom树
     */
    var _stepDomTree = _renderVirDom(_stepVirDom);
    /**
     * 将stepDom的子元素集合赋给_stepDomArray
     */
    _stepDomArray = _stepDomTree.children;

    /**
     * 生成去除浮动的div插入step树种
     */
    var _clear = _renderVirDom({
        'tagName': 'div',
        'props': {
            'class': 'cat-step-clear'
        },
        'children': []
    });
    _stepDomTree.appendChild(_clear);
    /**
     * 生成相同数量的内容容器的虚拟dom数组
     */
    var _continerVirDomArr = _generateContiner();
    /**
     * 生成对应的容器树并插入到集合里面
     */
    for (var i = 0; i < _stepTotal; i++) {
        _stepContinerDiv.push(_renderVirDom(_continerVirDomArr[i]));
    }
    /**
     * 将step dom树插入真实的页面上
     */
    this.append(_stepDomTree);

    /**
     * 将容器插入到真实页面上
     */
    for (var i = 0; i < _stepTotal; i++) {
        this.append(_stepContinerDiv[i]);
    }
    /**
     * 如果初始化了选中步骤，则将该步骤下的div显示出来
     */
    if (_chooseIndex > -1) {
        _stepContinerDiv[_chooseIndex].style.display = '';
        afterClick.call(this,steps[_chooseIndex],_stepContinerDiv[_chooseIndex]);
    }
    /**
     * 是否可以点击步骤条
     */
    _clickStep();
    /**
     * 返回对象
     */
    return this;
}

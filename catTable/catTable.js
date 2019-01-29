/**
 * catTbale v1.0.0
 * Author Tang Yu
 * Date 2018-11-28
 */
/**
 * 
 * 变量命名规则：
 * 以'_'开始的变量都是内部使用的
 * 以字母开启的变量都是外部传入的
 * 
 * 知识点: 
 * 1.rowspan 行合并; colspan 列合并; 一行还是一行来看
 */
/**
 * HISTORY:
 * 
 * Dec 19, 2018
 * 1.新增decorate参数，用于特定列的自定义渲染
 * 2.解决内容为数字时候，render函数错误的bug
 * 3.解决当footer未渲染时候，pagenum改变报错的问题 
 * 
 * Dec 20, 2018
 * 1.修改重设total之后页脚不随之改变的bug
 * 2.修改数字校验错误的bug
 * 
 * Dec 21, 2018
 * 1.新增dataFrom == ‘Server-T’模式，此模式下，total将从获取的数据中获得，而无需自己手动进行设置
 * 2.新增 dataComp参数（数组），此参数在dataFrom == ‘Server-T’下有用，
 * 用于确定实际数据与total的key值，其中第一个元素表示获取数据中表格数据的key值，
 * 第二个表示获取数据中total的key值
 * 
 * Jan 7, 2019
 * 1.新增 getCurrentData方法，返回当前页的原始数据，当dataFrom为local的时候返回全部原始数据data
 * 
 * Jan 13, 2019
 * 1.解决多层表头的时候，表头显示不正确的bug
 * 2.解决重新渲染页脚的时候total不正确的bug
 * 3.解决当表格无数据时候，表格展示的问题
 * 4.解决了当thead为字符串数组时候，表格样式渲染报错的bug
 * 5.新增noDataHint参数，用于当表格没有数据的时候应该提示的语句，默认值为'暂无表格数据'
 * 6.使得在多表头的时候thStyle依旧作用
 * 
 * 
 * 
 * UNCOMMIT:
 * 增加页脚中页数显示以及点击功能；新增showPageSelect参数，用于是否展示页脚上的页数，默认为true，在showFooter为true时候才起效果。
 * 修改表头的解析过程，将展示文字作为html字符串进行解析，即可形成checkbox等形式，其内部逻辑需要自行书写。
 */
/**
 * 未兼容IE8以下的方法：querySelector
 * 
 */
jQuery.fn.catTable = function (obj) {
    /**----------------------------参数初始化定义区-------------------------------------------------------------*/
    var _finalDomTree = null; //t包含able实际的dom树 内部使用
    var nowIndex = 0; //初始数组起始位置  当dataFrom == Local的时候启用
    var _targetDiv = this[0]; //组件依附的div
    var _isInit = true; //是否是在进行第一次初始化操作
    var noDataHint = '暂无表格数据'; //当表格没有数据的时候应该提示的语句

    /**   表格头有关的配置项  **/
    var thStyle = {}; //表格头的渲染格式 可以使对象 表示全都用他，可以使数组分别渲染，为数组的时候数组的长度必须等于thead的个数
    var thead = []; //表格的头信息
    var thField = ['name', 'id']; //表头如何取值的  1.显示的值  2.实际代码用于与data内的数据进行比对 有且只能有两个值
    var _thshowType = 'String'; //表头显示的格式  两种 1.字符串数组 String 2.对象数组 Object（对象数组通过thField中的字段进行展示与存储）
    var _dataShowOrder = []; //用于给data的数据进行顺序显示,当传入的数据是对象的时候，同时head也应该是对象模式
    var _thStyleType = 'None'; //None 无样式; Single 单个样式; All 统一运用于所有thead;
    var _baseColspan = 0; //记录表格最基础的表格列数，用于当无数据的时候提示表格行的colspan渲染

    /**   表格数据的配置   **/
    var dataFrom = 'Local'; //数据来源的方式 默认 Local 1.Local 表示展示直接从data来  2.Server 表示从服务器来 3.Server-T
    var pageSize = 10; //一页显示的数据数量
    var pageNumber = 0; //从哪一页开始，默认第一页  永远表示当前所在页 从0开始(即实际上的当前页应该为 pageNumber+1)
    var data = []; //table的数据存储数组
    var param = {}; //参数，当dataFrom为Server的时候使用
    var dataComp = []; //从后台获取到的data的组成 第一个参数表示数据  第二个参数表示总数 在dataFrom == 'Server-T'的时候有效
    var _currentData = []; //当前页面的数据，内部使用，当dataFrom == local时候会返回整个data。

    /**   页脚的配置     **/
    var total = 0; //数据的总条数
    var showFooter = true; //是否展示页脚
    var showPageSelect = true; //是否显示页数，默认为true

    /**   对于特定列的渲染 */

    var decorate = {}; //只在thead为对象数组的时候有效,key-value形式,key为需要渲染列的字段名,value为方法，该方法有唯一参数，该参数为此行的数据。可以返回String对象，也可以返回虚拟dom对象（{tagName:"a",props:{},children:[]}。

    /**----------------------------配置处理区------------------------------------------------------------------*/

    /**
     * 表格头配置信息的处理
     */
    //表格头信息必须拥有，并且数组长度必须大于0
    if (obj.thead == undefined || obj.thead.__proto__ != Array.prototype || obj.thead.length == 0) {
        throw 'thead must be defined and must be array and greater than zero!';
    }
    //给原本的表头信息赋值
    thead = obj.thead;

    //表头是按照string直接展示 还是需要按照对象的展现形式
    _thshowType = thead[0].__proto__ == String.prototype ? 'String' : 'Object';

    //定义表格头的展示形式
    if (obj['thField'] != undefined) {
        thField = obj['thField'];
    }
    //表头样式的定义
    if (obj['thStyle'] != undefined) {
        thStyle = obj['thStyle'];
        _thStyleType = thStyle.__proto__ == Array.prototype ? 'Single' : 'All'
    }

    /**
     * 数据配置信息的处理
     */
    //数据的来源方式
    if (obj['dataFrom'] != undefined) {
        dataFrom = obj['dataFrom'];
    }
    //一页展示的数量
    if (obj['pageSize'] != undefined) {
        pageSize = obj['pageSize'];
    }
    //当前页数
    if (obj['pageNumber'] != undefined) {
        pageNumber = obj['pageNumber'];
    }
    //当数据从服务器端来的时候，data参数必须是方法
    if (dataFrom == 'Server' || dataFrom == 'Server-T') {
        if (obj['data'] == undefined || obj['data'].__proto__ != Function.prototype) {
            throw 'When dataFrom is Server , data must be defined and must be function!';
        }
    }
    //通过校验进行赋值
    if (obj['data'] != undefined) {
        data = obj['data'];
    }
    //参数，当dataFrom为Server的时候有用
    if (obj['param'] != undefined) {
        param = obj['param'];
    }
    /**
     * 页脚配置的处理
     */
    //total参数的处理 当dataFrom == Local的时候默认为data的长度无法修改，
    //当dataFrom == Server的时候必须传入,可以传入方法
    //当dataFrom == Server-T的时候可以不传入，从数据那里取
    switch (dataFrom) {
        case 'Local':
            total = data.length;
            break;
        case 'Server':
            if (obj['total'] == undefined) {
                throw 'When dataFrom is Server , total must be defined!';
            }
            if (obj['total'].__proto__ == Function.prototype) {
                total = obj['total'].call(this, param);
            } else {
                total = obj['total'];
            }
            break;
        case 'Server-T':
            if (obj['dataComp'] == undefined) {
                throw 'When dataFrom is Server-T , dataComp must be defined!';
            }
            dataComp = obj['dataComp'];
            break;
    }

    //是否展示页脚
    if (obj['showFooter'] != undefined) {
        showFooter = obj['showFooter'];
    }

    //是否展示页脚的选择元素
    if (obj['showPageSelect'] != undefined) {
        if (obj['showPageSelect'].__proto__ != Boolean.prototype) throw 'showPageSelect must be type of Boolean!';
        showPageSelect = obj['showPageSelect'];
    }
    //装饰对象
    if (obj['decorate'] != undefined) {
        decorate = obj['decorate'];
    }
    //无数据时候的提示语
    if (obj['noDataHint'] != undefined) {
        noDataHint = obj['noDataHint'];
    }
    /**----------------------------方法区---------------------------------------------------------------------*/

    /**
     * 生成table的主体虚拟dom <table></table>
     */
    function _handleTableToVirDom() {
        return {
            tagName: 'table', // 节点标签名
            props: { // dom的属性键值对
                class: 'cat_table cat_table_hover mt10',
                style: 'width:100%;',
                cellspacing: "0",
                cellpadding: "0"
            },
            children: []
        };
    }
    /**
     * 根据配置生成对应的表头虚拟dom  <thead><tr><th></th><th></th><th></th></tr></thead>
     * @param {*} thead 
     * @param {*} thField 
     * @param {*} _thshowType 
     */
    function _handleHeadToVirDom() {
        //表头的基础虚拟dom
        var _headVirDom = {
            tagName: 'thead',
            props: {

            },
            children: []
        };
        //表头数组
        var _trArr = [];
        //表头层级
        var _level = 0;
        //表头的虚拟dom生成函数
        _multiHeadToVirDom(thead, _trArr, _level, null);
        //当thead为对象的时候，可能是多层表头，要进行相应处理
        if (_thshowType == 'Object') {
            _handleMultiHead(_trArr);
            //当thead为对象的时候，不管是否是多层表头，基础列数都是_trArr的第一个对象中所有children里面colspan的总和
            var _cTdArr = _trArr[0].children;
            for (var i = 0; i < _cTdArr.length; i++) {
                _baseColspan += _cTdArr[i].props.colspan;
            }
        } else {
            //当thead不为对象数组的时候，基础表头列数应该是thead数组的长度
            _baseColspan = thead.length;
        }
        //表头样式的渲染，当为多层表头的时候，只渲染colspan为1的表头
        switch (_thStyleType) {
            case 'None': //没有样式，则直接跳过
                break;
            case 'Single': //数据形式则一个个进行
                var _thStyleIndex = 0;
                for (var i = 0; i < _trArr.length; i++) {
                    var _tempThArr = _trArr[i]['children'];
                    for (var j = 0; j < _tempThArr.length; j++) {
                        var _tempTh = _tempThArr[j];
                        if (_tempTh['props']['colspan'] == undefined || _tempTh['props']['colspan'] == 1) {
                            var _tempDiv = _tempTh.children[0];
                            if (thStyle[_thStyleIndex] != undefined) {
                                for (var o in thStyle[_thStyleIndex]) {
                                    if (_tempDiv['props'][o] != undefined) {
                                        _tempDiv['props'][o] += ' ' + thStyle[_thStyleIndex][o];
                                    } else {
                                        _tempDiv['props'][o] = thStyle[_thStyleIndex][o];
                                    }
                                }
                                _thStyleIndex++;
                            }
                        }
                    }
                }
                break;
            case 'All': //对象形式则每一个都是一样的样式覆盖
                for (var i = 0; i < _trArr.length; i++) {
                    var _tempThArr = _trArr[i]['children'];
                    for (var j = 0; j < _tempThArr.length; j++) {
                        var _tempTh = _tempThArr[j];
                        if (_tempTh['props']['colspan'] == undefined || _tempTh['props']['colspan'] == 1) {
                            var _tempDiv = _tempTh.children[0];
                            for (var o in thStyle) {
                                if (_tempDiv['props'][o] != undefined) {
                                    _tempDiv['props'][o] += ' ' + thStyle[o];
                                } else {
                                    _tempDiv['props'][o] = thStyle[o];
                                }
                            }
                        }

                    }
                }
                break;
        }
        _headVirDom.children = _trArr;
        return _headVirDom;
    }
    /**
     * 表头的虚拟dom生成函数
     * @param {*} _multiHead 
     * @param {*} _trArr 
     * @param {*} _level 
     * @param {*} _belong 
     */
    //TODO
    function _multiHeadToVirDom(_multiHead, _trArr, _level, _belong) {
        if (_trArr[_level] == undefined) {
            _trArr[_level] = {
                tagName: 'tr',
                props: {},
                children: []
            };
        }
        var _children = _trArr[_level]['children'];
        if (_thshowType == 'String') {
            for (var i = 0; i < _multiHead.length; i++) {
                var _tempTh = {
                    tagName: 'th',
                    props: {
                        colspan: 1
                    },
                    children: [{
                        tagName: 'div',
                        props: {

                        },
                        children: _textToVirDom(_multiHead[i])
                    }]
                };
                _children.push(_tempTh);
            }
        } else {
            for (var i = 0; i < _multiHead.length; i++) {
                //展示的文字
                var _tempDisplay = _multiHead[i][thField[0]];
                //代表的字段code
                var _tempCode = _multiHead[i][thField[1]];
                //虚拟dom
                var _temp = {
                    tagName: 'th',
                    props: {
                        'catfield': _tempCode
                    },
                    children: [{
                        tagName: 'div',
                        props: {

                        },
                        children: _textToVirDom(_tempDisplay)
                    }]
                };
                //是否有归属
                if (_belong != null || _belong != undefined) {
                    _temp['props']['belong'] = _belong;

                }
                _children.push(_temp);
                //是否有下一层
                if (_multiHead[i].children != undefined) {
                    _multiHeadToVirDom(_multiHead[i].children, _trArr, (_level + 1), _tempCode);
                } else {
                    //没有下一层，则入数据展示字段信息数组
                    _dataShowOrder.push(_tempCode);
                }
            }
        }
    }
    /**
     * 处理对象类型表头，生成单层/多层表头，即为表头虚拟dom添加colspan与rowspan的属性
     * @param {*} _trArr 
     */
    function _handleMultiHead(_trArr) {
        //处理数据进行多层次表头的渲染
        var _span = {};
        var _trLen = _trArr.length;
        //从最后开始，最后即为表头最底层的字段
        for (var i = (_trLen - 1); i > -1; i--) {
            //该行所拥有的th数组
            var _tempTrArr = _trArr[i].children;
            //该行所拥有的th数组的长度
            var _tempTrLen = _tempTrArr.length;
            for (var j = 0; j < _tempTrLen; j++) {
                //th的虚拟dom
                var _tempTh = _tempTrArr[j];
                //该虚拟dom的props
                var _tempProps = _tempTh.props;
                //该虚拟dom所代表的字段
                var _catfield = _tempProps['catfield'];
                //该虚拟dom的父级字段
                var _belong = _tempProps['belong'];
                /**
                 * 判断所占行的数量
                 */
                //该字段在_span中是否存在
                if (_span[_catfield] == undefined) {
                    _span[_catfield] = 1;
                    //如果不存在则rowspan为当前实际的层级
                    _tempProps['rowspan'] = _trLen - i;
                } else {
                    //如果存在则说明已经有下一级了，因此rowspan 为 1
                    _tempProps['rowspan'] = 1;
                }
                /**
                 * 判断所在列的数量
                 */
                //其父级字段是否存在
                if (_belong != undefined) {
                    if (_span[_belong] == undefined) {
                        _span[_belong] = _span[_catfield];
                    } else {
                        _span[_belong] += _span[_catfield];
                    }
                }
                //添加对应的colspan属性
                _tempProps['colspan'] = _span[_catfield];
            }
        }
    }
    /**
     * 用div将表格虚拟dom包裹住并返回
     * @param {*} tableVirDom 
     */
    function _subsumeTableVirDomByDiv(tableVirDom) {
        return {
            'tagName': 'div',
            'props': {
                class: 'catTable_subsume_div'
            },
            children: [
                tableVirDom
            ]
        };
    }
    /**
     * 生成tbody的虚拟dom  <tbody></tbody>
     */
    function _handleTbodyToVirDom() {
        return {
            tagName: 'tbody',
            props: {

            },
            children: []
        };
    }
    /**
     * 构造tr,根据数据构造行的虚拟dom数组 [<tr><td><td></tr>,<tr><td><td></tr>,<tr><td><td></tr>]
     * 内部会根据pageNumber pageSize来进行取值，内部不会进行pageNumber pageSize的赋值，
     * 因此若两者改变了，需要在此方法调用前进行改变，否则使用的还是原来的值
     * @param {*} data 
     * @param {*} pageSize 
     */
    function _handleDataToVirDom(index) {
        var _data = []; //内部使用的数据
        //判断是本地还是服务器进行数据的获取
        switch (dataFrom) {
            case 'Local':
                _data = data; //本地，则直接将data赋值给它即可
                break;
            case 'Server':
                var _param = {
                    'pageSize': pageSize, //一页显示的数量
                    'pageNumber': pageNumber //页数
                };
                for (var o in param) {
                    _param[o] = param[o];
                }
                _data = data.call(this, _param);
                index = 0;
                break;
            case 'Server-T':
                var _param = {
                    'pageSize': pageSize, //一页显示的数量
                    'pageNumber': pageNumber //页数
                };
                for (var o in param) {
                    _param[o] = param[o];
                }
                var _resl = data.call(this, _param);
                _data = _resl[dataComp[0]]; //表格数据
                _total = Number(_resl[dataComp[1]]); //表格的数量
                //如果数量变化了则需要进行页脚的重新转化
                if (_total != total) {
                    //触发分页的重新渲染
                    if (showFooter) {
                        if (!_isInit) {
                            _footerDomTree.querySelector('.catTable-show-total').innerHTML = '共 ' + _total + ' 条记录';
                            _footerDomTree.querySelector('.catTable-input-decorate-text').innerHTML = '  /' + Math.ceil(_total / pageSize) + '页';
                        }
                    }
                }
                total = _total;
                index = 0;
                break;
            default:
                break;
        }
        var _virDom = [];
        for (var i = 0; i < pageSize; i++) {
            var _mainVirDom = {
                tagName: 'tr',
                props: {
                    class: i % 2 != 0 ? 'cat_table_bg' : ''
                },
                children: []
            }
            var target = _data[index + i];
            if (target == undefined) {
                break;
            }
            //根据表头来判断数据进入的方式，如果是String 表示是直入即可 如果不是则需要通过_dataShowOrder来显示
            //data数组中的数据必须是对象类型
            if (_thshowType == 'String') {
                for (var o in target) {
                    _mainVirDom.children.push({
                        tagName: 'td',
                        props: {

                        },
                        children: [target[o]]
                    })
                }
            } else {
                //根据顺序来，_dataShowOrder存储着thead的填充顺序
                for (var j = 0; j < _dataShowOrder.length; j++) {
                    //是否存在于decorate,如果存在则需要进行方法调用的渲染
                    var _tempChild = [];
                    if (decorate[_dataShowOrder[j]] != undefined) {
                        var _decObj = decorate[_dataShowOrder[j]].call(this, target);
                        if (_decObj.__proto__ == String.prototype) {
                            var _textVirDomArr = _textToVirDom(_decObj);
                            for (var _i = 0; _i < _textVirDomArr.length; _i++) {
                                _tempChild.push(_textVirDomArr[_i]);
                            }
                        } else if (_decObj.__proto__ == Object.prototype) {
                            _tempChild.push(_decObj);
                        }
                    } else {
                        _tempChild.push(target[_dataShowOrder[j]]);
                    }
                    _mainVirDom.children.push({
                        tagName: 'td',
                        props: {

                        },
                        children: _tempChild
                    })
                }
            }
            _virDom.push(_mainVirDom);
        }
        //为nowIndex进行赋值，主要是dataFrom == Local的时候需要使用
        nowIndex = index + pageSize;
        //为_currentData元素赋值，_currentData表示的是当前的数据
        _currentData = _data;
        //获取的数据为空，此时需要表格头数据来进行colspan的写入
        if (_virDom.length == 0) {
            _virDom.push({
                tagName: 'tr',
                props: {

                },
                children: [{
                    tagName: 'td',
                    props: {
                        colspan: _baseColspan
                    },
                    children: [noDataHint]
                }]
            });
        }
        return _virDom;
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
            if (children[i] == undefined || children[i] == null) {
                continue;
            }
            if (children[i].__proto__ == String.prototype || children[i].__proto__ == Number.prototype) {
                ele.appendChild(document.createTextNode(children[i]));
            } else {
                ele.appendChild(_renderVirDom(children[i]));
            }
        }
        return ele;
    }
    /**
     * 从字符串转为虚拟dom
     */
    function _textToVirDom(htmlText) {
        //迭代函数，将实际的dom转化为虚拟dom
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
        //div元素
        var _div = document.createElement('div');
        //将需要解析的htmlText放入div中生成dom片段
        _div.innerHTML = htmlText;
        //获取div的子元素，即htmlText解析后的dom片段
        var _childDom = _div.children;
        //子元素没有，说明时字符串而不是html字符串，则直接返回一个包含该字符串的数组即可
        if (_childDom.length == 0) {
            _virDomArr.push(htmlText);
        } else {
            //有，则进行解析
            _iteration(_virDomArr, _childDom);
        }
        return _virDomArr;
    }
    /**
     * 添加行的点击事件，改变其背景颜色
     */
    function _clickTrChangeColor() {
        this[0].addEventListener('click', function (e) {
            if (e.target.nodeName == 'TD') {
                var parent = e.target.parentElement;
                if (parent.className.indexOf('choose_tr') == -1) {
                    parent.className += ' choose_tr';
                } else {
                    parent.className = parent.className.replace('choose_tr', '').trim();
                }
            }
        });
    }

    /**
     * 添加上一步按钮事件
     */
    function _clickPreviousStep() {
        var dom = _targetDiv.querySelector('.first-child');
        this[0].addEventListener('click', function (e) {
            if (e.target == dom || dom.contains(e.target)) {
                _previous();
            }
        });
    }
    /**
     * 添加下一步按钮事件
     */
    function _clickNextStep() {
        var dom = _targetDiv.querySelector('.last-child');
        this[0].addEventListener('click', function (e) {
            if (e.target == dom || dom.contains(e.target)) {
                _next();
            }
        });
    }

    /**
     * 上一步的操作
     */
    function _previous() {
        //本地还是从服务器
        //1.判断是否是首页
        if (dataFrom == 'Local') {
            var previousIndex = nowIndex - 2 * pageSize;
            if (previousIndex < 0) {
                return false;
            }
        } else {
            if (pageNumber - 1 < 0) {
                return false;
            }
        }
        //2.不是首页，需要获取之前的数据并进行渲染
        //获取新的数组起始下标
        var _tempIndex = previousIndex < 0 ? 0 : previousIndex;
        //修改pageNumber到正确的值
        pageNumber--; //减一才是上一步的pageNumber
        //更新table中的tr
        _updateTableTr(_tempIndex);
        //页脚的统一变化
        _footerChangeOverAll(pageNumber);
        return true;
    }

    /**
     * 下一步操作
     */
    function _next() {
        //1.判断是否可以继续下一页
        if (dataFrom == 'Local') {
            if (nowIndex >= total) {
                return false;
            }
        } else {
            if (pageNumber >= (Math.ceil(total / pageSize) - 1)) {
                return false;
            }
        }
        //修改pageNumber到正确的值
        pageNumber++; //加1才是下一步的pageNumber
        //更新table中的tr
        _updateTableTr(nowIndex);
        //页脚的统一变化
        _footerChangeOverAll(pageNumber);
        return true;
    }
    /**
     * 修改input框内的数字跳转到对应的页
     */
    function _changeInputIndexNum() {
        var _inputPage = _targetDiv.querySelector('.input-page-num');
        this[0].addEventListener('change', function (e) {
            var _dom = e.target;
            if (_dom == _inputPage) {
                //校验 必须是正整数，不能大于最大页数
                var _wirteNum = _dom.value;
                if (!/^[1-9]+[0-9]*$/.test(_wirteNum) || _wirteNum > Math.ceil(total / pageSize)) {
                    _dom.value = pageNumber + 1;
                    return false;
                }
                //满足则进行跳转
                //修改pageNumber到正确的值
                pageNumber = _wirteNum - 1;
                var _tempIndex = pageNumber * pageSize;
                //更新table中的tr
                _updateTableTr(_tempIndex);
                //页脚的变换
                _footerChangeOverAll(pageNumber);
            }
        });
    }
    /**
     * 点击页脚的选择进行页面的跳转
     * 此时各部分的实际dom已经生成，可以直接调用
     */
    function _clickFooterIndex() {
        //页脚选择点击事件的添加
        this[0].addEventListener('click', function (e) {
            var _dom = e.target;
            //判断是否是事件的触发，只有li里面是数据的才可以出发事件，...是不可以触发事件的
            if (_dom.className.indexOf('footer-index') > -1 || _dom.parentElement.className.indexOf('footer-index') > -1) {
                //获取选择的页数
                var _selectPageIndex = ((_dom.nodeName.toUpperCase() == 'A' ? Number(_dom.text) : Number(_dom.firstElementChild.text)) - 1);
                //如果选择页数和当前页数一致，则不需要做任何操作 (pageNumber + 1)为实际上的页数
                if (_selectPageIndex == pageNumber) {
                    return;
                }
                //修改当前的pageNumber使之指向正确的被选择的页数
                pageNumber = _selectPageIndex;
                //不一致，则需要进行操作
                //1.table数据的重新渲染 
                _updateTableTr(_selectPageIndex * pageSize);
                //2.页脚的总起变化
                _footerChangeOverAll(_selectPageIndex);
            }
        });
    }

    /**
     *
     * 选择页脚后页脚选择dom的改变
     * 因为内部要使用到total这个参数，因此必须要在_handleDataToVirDom方法调用后才可以进行调用
     * @param {*} _currentPageNum 选着的页数（实际页数 - 1 即 pageNumber）
     */
    function _changeFooterNumOfPageDom(_currentPageNum) {
        //得出总共的页数
        var _realSize = Math.ceil(total / Number(pageSize));
        //页脚选择li的list
        var _selectLiList = _footerDomTree.querySelectorAll('.catTable-footer-select-li');
        //总页数小于10，则只需要考虑样式的删除与添加
        if (_realSize < 10) {
            //循环页脚的list
            for (var i = 0; i < _selectLiList.length; i++) {
                //如果有catTable-footer-index-choosed，则剥夺
                if (_selectLiList[i].className.indexOf('catTable-footer-index-choosed') > -1) {
                    _selectLiList[i].className = _selectLiList[i].className.replace('catTable-footer-index-choosed', '');
                }
                //获取页脚选择li代表的页数(实际页数 - 1)
                var _selectIndex = Number(_selectLiList[i].querySelector('a').text) - 1;
                //比较，如果是正确的当前页，则添加catTable-footer-index-choosed样式
                if (_selectIndex == _currentPageNum) {
                    _selectLiList[i].className = _selectLiList[i].className + ' catTable-footer-index-choosed';
                }
            }
        } else {
            //总页数大于等于10，则存在···这个元素，需要进行特别的展示
            //其实就是页脚select元素内部text的修改，包括其class
            var _numOfPageList = [];
            //实际的页数(当前页 + 1 = 认知上的实际页数)
            var _realCurPageNum = _currentPageNum + 1;
            //最低不变临界值
            var _lowNum = 3;
            //最高不变临界值
            var _upNum = _realSize - 2;
            //根据临界值，给_numOfPageList赋值对应的数组实例
            if (_realCurPageNum < _lowNum || _realCurPageNum > _upNum) {
                _numOfPageList = [1, 2, 3, '···', (_realSize - 2), (_realSize - 1), _realSize];
            } else {
                _numOfPageList = [1, '···', (_realCurPageNum - 1), _realCurPageNum, (_realCurPageNum + 1), '···', _realSize];
            }
            //循环list进行页脚选择dom的重新渲染
            //用实际的dom节点渲染新的数据
            for (var i = 0; i < _selectLiList.length; i++) {
                //li  catTable-footer-select-li footer-index 
                //li.choose  catTable-footer-select-li footer-index  catTable-footer-index-choosed
                //....  catTable-footer-select-li catTable-footer-ellipsis 
                if (_numOfPageList[i] == _realCurPageNum) {
                    _selectLiList[i].className = 'catTable-footer-select-li footer-index  catTable-footer-index-choosed';
                } else if (_numOfPageList[i] == '···') {
                    _selectLiList[i].className = 'catTable-footer-select-li catTable-footer-ellipsis';

                } else {
                    _selectLiList[i].className = 'catTable-footer-select-li footer-index';
                }
                _selectLiList[i].querySelector('a').text = _numOfPageList[i];
            }
        }
    }
    /**
     * 页脚变化的总起函数
     * 用于当需要进行页脚改变的时候，直接调用该函数即可，无需在分步调用各变化函数
     * @param {*} _currentPageNum 当前的页数
     * 0.footer必须存在
     * 1.必须要在pageNumber被重新赋值以后
     * 2.改变:页脚select的变化
     * 3.改变:input框的变化
     */
    function _footerChangeOverAll(_currentPageNum) {
        if (showFooter) {
            _changeInputPageNum();
            if (showPageSelect) {
                _changeFooterNumOfPageDom(_currentPageNum);
            }
        }
    }
    /**
     * 上一页，下一页的时候修改页脚input框中显示的页数
     */
    function _changeInputPageNum() {
        if (showFooter) {
            _targetDiv.querySelector('.input-page-num').value = pageNumber + 1;
        }
    }
    /**
     * 根据total以及pageSzie生成footer的中间主体，例:1,2,3,...,7,8,9
     * 不必须考虑 dataFrom的模式，
     * 因为 _handleDataToVirDom 是在此方法之前执行的，
     * 此时Servce-T模式下total已经生成了
     * 中间的页数list固定大小7个(为什么选7个，因为7个展示起来好看)
     */
    function _handleFooterNumOfPageVirDom() {
        var footerArray = [];
        //实际的页数
        var _realSize = Math.ceil(total / Number(pageSize));
        //需要进行渲染的页脚list
        var _numOfPageList = [];
        //如果小于等于7则全部展示
        //如果大于7则中间的一个li为···
        if (_realSize < 8) {
            for (var i = 1; i <= _realSize; i++) {
                _numOfPageList.push(i);
            }
        } else {
            _numOfPageList = [1, 2, 3, '···', (_realSize - 2), (_realSize - 1), _realSize];
        }
        //形成页脚选择的虚拟dom数组
        for (var i = 0; i < _numOfPageList.length; i++) {
            footerArray.push({
                tagName: 'li',
                props: {
                    class: 'catTable-footer-select-li ' + (_numOfPageList[i] == '···' ? 'catTable-footer-ellipsis ' : 'footer-index ') + (i == 0 ? 'catTable-footer-index-choosed' : '')
                },
                children: [{
                    tagName: 'a',
                    props: {

                    },
                    children: [_numOfPageList[i]]
                }]
            });
        }
        return footerArray;
    }
    /**
     * 生成对应的footer虚拟dom
     */
    function _handleFooterToVirDom() {
        var _footer = {
            tagName: 'ul', // 节点标签名
            props: { // dom的属性键值对
                class: 'paging mt10 fr',
            },
            children: []
        };
        var _footer_children = _footer.children;
        _footer_children.push({
            tagName: 'span',
            props: {
                class: 'fl catTable-show-total',
            },
            children: ['共 ' + total + ' 条记录']
        }, {
            tagName: 'li',
            props: {
                class: "first-child"
            },
            children: [{
                tagName: 'a',
                props: {

                },
                children: ['上一页']
            }]
        });
        //是否需要加入页脚选择的虚拟dom
        if (showPageSelect) {
            var _numOfPageVirDom = _handleFooterNumOfPageVirDom();
            for (var i = 0; i < _numOfPageVirDom.length; i++) {
                _footer_children.push(_numOfPageVirDom[i]);
            }
        }
        _footer_children.push({
            tagName: 'li',
            props: {
                class: 'plr5'
            },
            children: [{
                tagName: 'input',
                props: {
                    class: "inp-page fl mt5 input-page-num",
                    value: pageNumber + 1
                },
                children: ['10']
            }, {
                tagName: 'span',
                props: {
                    class: "catTable-input-decorate-text"
                },
                children: ['  /' + (Math.ceil(total / Number(pageSize))) + '页']
            }]
        }, {
            tagName: 'li',
            props: {
                class: "last-child"
            },
            children: [{
                tagName: 'a',
                props: {

                },
                children: ['下一页']
            }]
        });

        return _footer;
    }


    /**
     * table数据tr的更新
     */
    function _updateTableTr(index) {
        //构建新的数据虚拟dom节点
        var _tempVirDom = _handleDataToVirDom(index);
        //获取tbody元素
        var _tbodyDomTree = _finalDomTree.querySelector('tbody');
        //清空tbody元素里面的旧内容
        _tbodyDomTree.innerHTML = '';
        //添加新的数据内容
        for (var i = 0; i < _tempVirDom.length; i++) {
            _tbodyDomTree.appendChild(_renderVirDom(_tempVirDom[i]));
        }
    }
    /**--------------------- 自带方法添加区 ---------------------------------------------------------------------*/
    /**
     * 重新设置初始化param
     */
    this.setInitParam = function (p) {
        param = p;
    }
    /**
     * 传入p 表示回到确定的某一页(pageNumber+1为真实的页数),不传表示回到首页
     */
    this.reloadTable = function (p) {
        var _index = 0;
        if (p == null || p == undefined) {
            pageNumber = 0;
        } else {
            if (!/^[1-9]+[0-9]*$/.test(p)) {
                throw 'pageNumber must be positive integer! ';
            }
            pageNumber = p;
            _index = pageNumber * pageSize;
        }
        //更新table上数据tr
        _updateTableTr(_index);
        //修改page input中的数据
        _changeInputPageNum();
    }
    /**
     * 重新设置pageSize
     */
    this.setPageSize = function (p) {
        if (!/^[1-9]+[0-9]*$/.test(p)) {
            throw 'pageSize must be positive integer! ';
        }
        pageSize = p;
    }
    /**
     * 重新设置total
     */
    this.setTotal = function (p) {
        if (!/^[1-9]+[0-9]*$/.test(p)) {
            throw 'total must be positive integer! ';
        }
        total = p;
        //触发分页的重新渲染
        if (showFooter) {
            _footerDomTree.querySelector('.catTable-show-total').innerHTML = '共 ' + total + ' 条记录';
            _footerDomTree.querySelector('.catTable-input-decorate-text').innerHTML = '  /' + Math.ceil(total / pageSize) + '页';
        }
    }
    /**
     * 获取当前的pageNumber
     */
    this.getCurPageNum = function () {
        return pageNumber;
    }

    /**
     * 获取当前页的原始数据
     */
    this.getData = this.getCurrentData = function () {
        return _currentData;
    }

    /**--------------------- 初始化执行区 ---------------------------------------------------------------------*/
    /**
     * table主体的虚拟dom
     */
    var _tableVirDom = _handleTableToVirDom();
    /**
     * 表格头的虚拟dom
     */
    var _headerVirDom = _handleHeadToVirDom();
    /**
     * 表格tbody的虚拟dom
     */
    var _bodyVirDom = _handleTbodyToVirDom();
    /**
     * 数据tr的虚拟dom数组
     */
    var _dataVirDom = _handleDataToVirDom(nowIndex);
    /**
     * 页脚的虚拟dom，此操作必须在_handleDataToVirDom执行后才可以进行
     * 因为dataFrom可能是‘Server-T’类型，此类型下total从后台数据中获取
     * 只有在total确定的情况下，footer才可以生成
     */
    if (showFooter) {
        var _footerVirDom = _handleFooterToVirDom();
    }
    /**
     * 将表头的虚拟dom插入table的虚拟dom中
     */
    _tableVirDom.children.push(_headerVirDom);
    /**
     * 将数据的tr虚拟dom插入table body的虚拟dom中
     */
    for (var i = 0; i < _dataVirDom.length; i++) {
        _bodyVirDom.children.push(_dataVirDom[i]);
    }
    /**
     * 将table body插入table的虚拟dom中
     */
    _tableVirDom.children.push(_bodyVirDom);
    /**
     * 最后真正的包含表格的虚拟元素
     */
    var _finalVirDom = _subsumeTableVirDomByDiv(_tableVirDom);
    /**
     * 生成实际的包含整个table的dom树
     */
    _finalDomTree = _renderVirDom(_finalVirDom);
    /**
     * 生成实际的页脚数
     */
    if (showFooter) {
        var _footerDomTree = _renderVirDom(_footerVirDom);
    }
    /**
     * 向真实的页面DOM中插入表格
     */
    this.append(_finalDomTree);
    /**
     * 向真实的页面DOM中插入页脚
     */
    if (showFooter) {
        this.append(_footerDomTree);
    }
    /**
     * tr的点击事件添加
     */
    _clickTrChangeColor.call(this);
    /**
     * 页脚事件的添加
     */
    if (showFooter) {
        /**
         * 上一页
         */
        _clickPreviousStep.call(this);
        /**
         * 下一页
         */
        _clickNextStep.call(this);
        /**
         * 修改input直接跳转到对应页
         */
        _changeInputIndexNum.call(this);
    }
    /**
     * 如果显示页脚选择，则需要添加对应的事件
     */
    if(showFooter){
        if (showPageSelect) {
            _clickFooterIndex.call(this);
        }
    }
    
    /**
     * 将isInit置为false，不在是初始化操作，用于Server-T模式下，在total改变时候进行的不同操作。
     */
    _isInit = false;
    return this;
}
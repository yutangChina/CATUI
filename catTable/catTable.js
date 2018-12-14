/**
 * catTbale v1.0.0
 * Author Tang Yu
 * Date 2018-11-28
 */
/**
 * catTbale v1.1.0
 * Author Tang Yu
 * Date 2018-12-14
 * 知识点: 
 * 1.rowspan 行合并; colspan 列合并; 一行还是一行来看
 * 新增功能:
 * 1.新增多层表头的展示
 * 问题修复:
 * 1.修复多个表格的时候，只有第一个表格的分页组件可以使用的bug
 */
/**
 * 未兼容IE8以下的方法：querySelector
 * 
 */
jQuery.fn.catTable = function (obj) {
    /**----------------------------参数初始化定义区-------------------------------------------------------------*/
    var _tableDomTree = null; //table实际的dom树 内部使用
    var nowIndex = 0; //初始数组起始位置  当dataFrom == Local的时候启用
    var _targetDiv = this[0]; //组件依附的div

    /**   表格头有关的配置项  **/
    var thStyle = {}; //表格头的渲染格式 可以使对象 表示全都用他，可以使数组分别渲染，为数组的时候数组的长度必须等于thead的个数
    var thead = []; //表格的头信息
    var thField = ['name', 'id']; //表头如何取值的  1.显示的值  2.实际代码用于与data内的数据进行比对 有且只能有两个值
    var _thshowType = 'String'; //表头显示的格式  两种 1.字符串数组 String 2.对象数组 Object（对象数组通过thField中的字段进行展示与存储）
    var _dataShowOrder = []; //用于给data的数据进行顺序显示,当传入的数据是对象的时候，同时head也应该是对象模式
    var _thStyleType = 'None'; //None 无样式; Single 单个样式; All 统一运用于所有thead;


    /**   表格数据的配置   **/
    var dataFrom = 'Local'; //数据来源的方式 默认 Local 1.Local 表示展示直接从data来  2.Server 表示从服务器来
    var pageSize = 10; //一页显示的数据数量
    var pageNumber = 0; //从哪一页开始，默认第一页  永远表示当前所在页
    var data = []; //table的数据存储数组
    var param = {}; //参数，当dataFrom为Server的时候使用

    /**   页脚的配置     **/
    var total = 0; //数据的总条数
    var showFooter = true; //是否展示页脚


    /**----------------------------配置处理区------------------------------------------------------------------*/



    /**
     * 表格头配置信息的处理
     */
    //表格头信息必须拥有
    if (obj.thead == undefined || obj.thead.__proto__ != Array.prototype) {
        throw 'thead must be defined and must be array!';
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
    if (dataFrom == 'Server') {
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
    //total参数的处理 当dataFrom == Local的时候默认为data的长度无法修改，当dataFrom == Server的时候必须传入,可以传入方法
    if (dataFrom == 'Local') {
        total = data.length;
    } else {
        if (obj['total'] == undefined) {
            throw 'When dataFrom is Server , total must be defined!';
        }
        if (obj['total'].__proto__ == Function.prototype) {
            total = obj['total'].call(this, param);
        } else {
            total = obj['total'];
        }
    }
    //是否展示页脚
    if (obj['showFooter'] != undefined) {
        showFooter = obj['showFooter'];
    }


    /**----------------------------方法区---------------------------------------------------------------------*/

    /**
     * 生成table的主体虚拟dom <table></table>
     */
    function _handleTableToVirDom() {
        return {
            tagName: 'table', // 节点标签名
            props: { // dom的属性键值对
                id: 'table1',
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
        }


        //_thStyleType样式只对单层表头有效
        if (_trArr.length == 1) {
            //一个tr表示是单层表头
            for (var i = 0; i < _trArr[0].children.length; i++) {
                var _tempTh = _trArr[0].children[i];

                switch (_thStyleType) {
                    case 'None':
                        break;
                    case 'Single':
                        if (thStyle[i] != undefined) {
                            for (var o in thStyle[i]) {
                                if (_tempTh['props'][o] != undefined) {
                                    _tempTh['props'][o] += ' ' + thStyle[i][o];
                                } else {
                                    _tempTh['props'][o] = thStyle[i][o];
                                }
                            }

                        }
                        break;
                    case 'All':
                        for (var o in thStyle) {
                            if (_tempTh['props'][o] != undefined) {
                                _tempTh['props'][o] += ' ' + thStyle[o];
                            } else {
                                _tempTh['props'][o] = thStyle[o];
                            }
                        }
                        break;
                }

            }
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
    function _multiHeadToVirDom(_multiHead, _trArr, _level, _belong) {
        if (_trArr[_level] == undefined) {
            _trArr[_level] = {
                tagName: 'tr',
                props: {

                },
                children: []
            };
        }
        var _children = _trArr[_level]['children'];
        if (_thshowType == 'String') {
            for (var i = 0; i < _multiHead.length; i++) {
                var _tempTh = {
                    tagName: 'th',
                    children: [_multiHead[i]]
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
                    children: [_tempDisplay]
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
     * 处理对象类型表头，生成单层/多层表头
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
                //该字段在_span中是否存在
                if (_span[_catfield] == undefined) {
                    _span[_catfield] = 1;
                    //如果不存在则rowspan为当前实际的层级
                    _tempProps['rowspan'] = _trLen - i;
                } else {
                    //如果存在则说明已经有下一级了，因此rowspan 为 1
                    _tempProps['rowspan'] = 1;
                }
                //其父级字段是否存在
                if (_belong != undefined) {
                    if (_span[_belong] == undefined) {
                        _span[_belong] = 1;
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
                    _mainVirDom.children.push({
                        tagName: 'td',
                        props: {

                        },
                        children: [target[_dataShowOrder[j]]]
                    })
                }
            }
            _virDom.push(_mainVirDom);
        }
        nowIndex = index + pageSize;
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
            if (children[i] == undefined) {
                continue;
            }
            if (children[i].__proto__ == String.prototype) {
                ele.appendChild(document.createTextNode(children[i]));
            } else {
                ele.appendChild(_renderVirDom(children[i]));
            }
        }
        return ele;
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
        pageNumber--; //减一才是上一步的pageNumber
        //更新table中的tr
        _updateTableTr(_tempIndex);
        //修改page input中的数据
        _changeInputPageNum();
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
        pageNumber++; //加1才是下一步的pageNumber
        //更新table中的tr
        _updateTableTr(nowIndex);
        //修改page input中的数据
        _changeInputPageNum();
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
                pageNumber = _wirteNum - 1;
                var _tempIndex = pageNumber * pageSize;
                //更新table中的tr
                _updateTableTr(_tempIndex);

            }
        });
    }

    /**
     * 点击页脚的size li跳转到对应的页面
     */
    // function _clickFooterIndex() {
    //     this[0].addEventListener('click', function (e) {
    //         var dom = e.target;
    //         if (dom.className.indexOf('footer-index') > -1 || dom.parentElement.className.indexOf('footer-index') > -1) {
    //             var shouldIndex = ((dom.nodeName == 'A' ? Number(dom.text) : Number(dom.firstElementChild.text)) - 1) * Number(pageSize);

    //             if ((shouldIndex + Number(pageSize)) != nowIndex) {
    //                 var tempVirDom = _handleDataToVirDom(shouldIndex);
    //                 //获取tbody元素
    //                 var tbodyDomTree = _tableDomTree.querySelector('tbody');
    //                 //清空tbody元素里面的旧内容
    //                 tbodyDomTree.innerHTML = '';
    //                 //添加新的数据内容
    //                 for (var i = 0; i < tempVirDom.length; i++) {
    //                     tbodyDomTree.appendChild(_renderVirDom(tempVirDom[i]));
    //                 }
    //                 _changeInputPageNum();
    //                 return true;
    //             }


    //         }
    //     });
    // }


    /**
     * 上一页，下一页的时候修改页脚input框中显示的页数
     */
    function _changeInputPageNum() {
        _targetDiv.querySelector('.input-page-num').value = pageNumber + 1;
    }
    /**
     * 根据数据生成footer的中间主体:1,2,3,4,...,7,9
     */
    // function _handleFooterDataToVirDomArray() {
    //     var footerArray = [];
    //     //实际的页数
    //     var real_size = Math.ceil(total / Number(pageSize));
    //     for (var i = 0; i < real_size; i++) {
    //         var text = i + 1 + '';
    //         if (i == 4) {
    //             if (real_size - i < 4) {
    //                 text = i + 1 + '';
    //             } else {
    //                 i = real_size - 3;
    //                 text = '...';
    //             }
    //         }
    //         footerArray.push({
    //             tagName: 'li',
    //             props: {
    //                 class: 'footer-index'
    //             },
    //             children: [{
    //                 tagName: 'a',
    //                 props: {

    //                 },
    //                 children: [text]
    //             }]
    //         });
    //     }
    //     return footerArray;
    // }
    /**
     * 生成对应的footer虚拟dom
     */
    function _handleFooterToVirDom() {
        var footer = {
            tagName: 'ul', // 节点标签名
            props: { // dom的属性键值对
                class: 'paging mt10 fr',
            },
            children: [{
                tagName: 'span',
                props: {
                    class: 'fl',
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
            }]
        };
        var footer_children = footer.children;
        // var footerDataVirDom = _handleFooterDataToVirDomArray();
        // for (var i = 0; i < footerDataVirDom.length; i++) {
        //     footer_children.push(footerDataVirDom[i]);
        // }
        footer_children.push({
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
            }, '  /' + (Math.ceil(total / Number(pageSize))) + '页']
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

        return footer;
    }


    /**
     * table数据tr的更新
     */
    function _updateTableTr(index) {
        //构建新的数据虚拟dom节点
        var _tempVirDom = _handleDataToVirDom(index);
        //获取tbody元素
        var _tbodyDomTree = _tableDomTree.querySelector('tbody');
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
            if (/^[1-9]+[0-9]*$/.test(p)) {
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
        if (/^[1-9]+[0-9]*$/.test(p)) {
            throw 'pageSize must be positive integer! ';
        }
        pageSize = p;
    }
    /**
     * 重新设置total
     */
    this.setTotal = function (p) {
        if (/^[1-9]+[0-9]*$/.test(p)) {
            throw 'total must be positive integer! ';
        }
        total = p;
    }
    /**
     * 获取当前的pageNumber
     */
    this.getCurPageNum = function () {
        return pageNumber;
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
     * 页脚的虚拟dom
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
     * 生成实际的整个table
     */
    _tableDomTree = _renderVirDom(_tableVirDom);

    /**
     * 生成实际的页脚数
     */
    if (showFooter) {
        var _footerDomTree = _renderVirDom(_footerVirDom);
    }
    /**
     * 向真实的页面DOM中插入表格
     */
    this.append(_tableDomTree);
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
    //_clickFooterIndex.call(this);
    return this;
}
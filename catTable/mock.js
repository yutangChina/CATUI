var data = [];
for (var i = 0; i < 901; i++) {
    var obj = {
        'a': i + '-1',
        'b': i + '-2',
        'c': i + '-3',
        'd': i + '-4',
        'e': i + '-5',
        'f': i + '-6',
        'g': i + '-7'
    }
    data.push(obj);
}

var headStrArr = ['表头1', '表头2', '表头3', '表头4', '表头5', '表头6', '表头7', '表头8', '表头9', '表头10'];

var head = [{
    display1: '栏目1',
    id: 'a'
}, {
    display1: '栏目2',
    id: 'b',
    children: [{
        display1: '栏目21',
        id: 'b1'
    }, {
        display1: '栏目22',
        id: 'b2'
    }, {
        display1: '栏目23',
        id: 'b3',
        children: [{
            display1: '栏目231',
            id: 'b31',
        }, {
            display1: '栏目232',
            id: 'b32',
        }]
    }]
}, {
    display1: '栏目3',
    id: 'c'
}, {
    display1: '栏目4',
    id: 'd'
}, {
    display1: '栏目5',
    id: 'e'
}, {
    display1: '栏目6',
    id: 'f'
}, {
    display1: '栏目7',
    id: 'g'
}];


var head3 = [{
    display1: '栏目1',
    id: 'a'
}, {
    display1: '栏目2',
    id: 'b',
    children: [{
        display1: '栏目2-1',
        id: 'b1',
        children: [{
            display1: '栏目2-1-1',
            id: 'b11'
        }, {
            display1: '栏目2-1-2',
            id: 'b12'
        }, {
            display1: '栏目2-1-3',
            id: 'b13'
        }, {
            display1: '栏目2-1-4',
            id: 'b14'
        }, {
            display1: '栏目2-1-5',
            id: 'b15'
        }]
    }, {
        display1: '栏目2-2',
        id: 'b2',
        children: [{
            display1: '栏目2-2-1',
            id: 'b21'
        }, {
            display1: '栏目2-2-2',
            id: 'b22'
        }, {
            display1: '栏目2-2-3',
            id: 'b23'
        }, {
            display1: '栏目2-2-4',
            id: 'b24'
        }, {
            display1: '栏目2-2-5',
            id: 'b25'
        }]
    }, {
        display1: '栏目2-3',
        id: 'b3',
        children: [{
            display1: '栏目2-3-1',
            id: 'b31'
        }, {
            display1: '栏目2-3-2',
            id: 'b32'
        }, {
            display1: '栏目2-3-3',
            id: 'b33'
        }, {
            display1: '栏目2-3-4',
            id: 'b34'
        }, {
            display1: '栏目2-3-5',
            id: 'b35'
        }]
    }, {
        display1: '栏目2-4',
        id: 'b4',
        children: [{
            display1: '栏目2-4-1',
            id: 'b41'
        }, {
            display1: '栏目2-4-2',
            id: 'b42'
        }, {
            display1: '栏目2-4-3',
            id: 'b43'
        }, {
            display1: '栏目2-4-4',
            id: 'b44'
        }, {
            display1: '栏目2-4-5',
            id: 'b45'
        }]
    }, {
        display1: '栏目2-5',
        id: 'b5',
        children: [{
            display1: '栏目2-5-1',
            id: 'b51'
        }, {
            display1: '栏目2-5-2',
            id: 'b52'
        }, {
            display1: '栏目2-5-3',
            id: 'b53'
        }, {
            display1: '栏目2-5-4',
            id: 'b54'
        }, {
            display1: '栏目2-5-5',
            id: 'b55'
        }]
    }, {
        display1: '栏目2-6',
        id: 'b6',
        children: [{
            display1: '栏目2-6-1',
            id: 'b61'
        }, {
            display1: '栏目2-6-2',
            id: 'b62'
        }, {
            display1: '栏目2-6-3',
            id: 'b63'
        }, {
            display1: '栏目2-6-4',
            id: 'b64'
        }, {
            display1: '栏目2-6-5',
            id: 'b65'
        }]
    }, {
        display1: '栏目2-7',
        id: 'b7',
        children: [{
            display1: '栏目2-7-1',
            id: 'b71'
        }, {
            display1: '栏目2-7-2',
            id: 'b72'
        }, {
            display1: '栏目2-7-3',
            id: 'b73'
        }, {
            display1: '栏目2-7-4',
            id: 'b74'
        }, {
            display1: '栏目2-7-5',
            id: 'b75'
        }]
    }]
}];

var head1 = [{
    display1: '栏目1',
    id: 'a'
}, {
    display1: '栏目2',
    id: 'b'
}, {
    display1: '栏目3',
    id: 'c'
}, {
    display1: '栏目4',
    id: 'd'
}, {
    display1: '栏目5',
    id: 'e'
}, {
    display1: '栏目6',
    id: 'f'
}, {
    display1: '栏目7',
    id: 'g'
}];
var queryFromServer = function (param) {
    // console.log(param);
    var data = [];
    var num = param.pageSize * (param.pageNumber + 1);
    for (var i = 0; i < num; i++) {


        if (param.pageNumber < 1) {
            return data;
        }

        var obj = {
            'a': i + '-1-a-' + param.pageNumber,
            'b': i + '-2-b-' + param.pageNumber,
            'b1': i + '-2-b1-' + param.pageNumber,
            'b2': i + '-2-b2-' + param.pageNumber,
            'b3': i + '-2-b3-' + param.pageNumber,
            'b31': i + '-2-b31-' + param.pageNumber,
            'b32': i + '-2-b32-' + param.pageNumber,
            'c': i + '-3-c-' + param.pageNumber,
            'd': i + '-4-d-' + param.pageNumber,
            'e': i + '-5-e-' + param.pageNumber,
            'f': i + '-6-f-' + param.pageNumber,
            'g': i + '-7-g-' + param.pageNumber
        }
        data.push(obj);
    }
    return data;
}
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
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
    id: 'g'
}, {
    display1: '栏目7',
    id: 'g'
}];



var queryFromServer = function (param) {
    console.log(param);
    var data = [];
    var num = param.pageSize * (param.pageNumber + 1);
    for (var i = 0; i < num; i++) {
        var obj = {
            'a': i + '-1-' + param.pageNumber,
            'b': i + '-2-' + param.pageNumber,
            'c': i + '-3-' + param.pageNumber,
            'd': i + '-4-' + param.pageNumber,
            'e': i + '-5-' + param.pageNumber,
            'f': i + '-6-' + param.pageNumber,
            'g': i + '-7-' + param.pageNumber
        }
        data.push(obj);
    }
    return data;
}
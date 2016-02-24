'use strict';

var _coverage__global = new Function('return this')();

var _coverage__object = _coverage__global['__coverage__'] || (_coverage__global['__coverage__'] = {});

var _coverage__file = _coverage__object['/Users/dtinth/Projects/babel-plugin-__coverage__/testdata/basic.js'] = _coverage__global['JSON'].parse('{"path":"/Users/dtinth/Projects/babel-plugin-__coverage__/testdata/basic.js","s":{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0},"b":{"1":[0,0],"2":[0,0],"3":[0,0],"4":[0,0,0],"5":[0,0],"6":[0,0],"7":[0,0],"8":[0,0],"9":[0,0]},"f":{"1":0,"2":0,"3":0,"4":0,"5":0},"statementMap":{"1":{"start":{"line":3,"column":2},"end":{"line":6,"column":3}},"2":{"start":{"line":3,"column":26},"end":{"line":3,"column":29}},"3":{"start":{"line":3,"column":15},"end":{"line":3,"column":16}},"4":{"start":{"line":4,"column":4},"end":{"line":5,"column":29}},"5":{"start":{"line":4,"column":21},"end":{"line":4,"column":48}},"6":{"start":{"line":5,"column":9},"end":{"line":5,"column":29}},"7":{"start":{"line":7,"column":2},"end":{"line":7,"column":34}},"8":{"start":{"line":7,"column":16},"end":{"line":7,"column":34}},"9":{"start":{"line":8,"column":2},"end":{"line":8,"column":33}},"10":{"start":{"line":8,"column":15},"end":{"line":8,"column":33}},"11":{"start":{"line":12,"column":2},"end":{"line":19,"column":3}},"12":{"start":{"line":13,"column":9},"end":{"line":13,"column":20}},"13":{"start":{"line":15,"column":9},"end":{"line":15,"column":20}},"14":{"start":{"line":14,"column":6},"end":{"line":14,"column":75}},"15":{"start":{"line":14,"column":27},"end":{"line":14,"column":28}},"16":{"start":{"line":14,"column":31},"end":{"line":14,"column":32}},"17":{"start":{"line":14,"column":42},"end":{"line":14,"column":43}},"18":{"start":{"line":14,"column":53},"end":{"line":14,"column":54}},"19":{"start":{"line":14,"column":65},"end":{"line":14,"column":66}},"20":{"start":{"line":14,"column":73},"end":{"line":14,"column":74}},"21":{"start":{"line":16,"column":6},"end":{"line":16,"column":22}},"22":{"start":{"line":18,"column":6},"end":{"line":18,"column":18}},"23":{"start":{"line":22,"column":10},"end":{"line":22,"column":25}},"24":{"start":{"line":23,"column":10},"end":{"line":23,"column":25}},"25":{"start":{"line":25,"column":0},"end":{"line":25,"column":5}},"26":{"start":{"line":26,"column":0},"end":{"line":26,"column":56}},"27":{"start":{"line":28,"column":0},"end":{"line":28,"column":6}}},"fnMap":{"1":{"line":2,"loc":{"start":{"line":2,"column":0},"end":{"line":9,"column":1}}},"2":{"line":11,"loc":{"start":{"line":11,"column":0},"end":{"line":20,"column":1}}},"3":{"line":22,"loc":{"start":{"line":22,"column":10},"end":{"line":22,"column":25}}},"4":{"line":23,"loc":{"start":{"line":23,"column":10},"end":{"line":23,"column":25}}},"5":{"line":26,"loc":{"start":{"line":26,"column":13},"end":{"line":26,"column":45}}}},"branchMap":{"1":{"line":4,"type":"if","locations":[{"start":{"line":4,"column":21},"end":{"line":4,"column":48}},{"start":{"line":5,"column":9},"end":{"line":5,"column":29}}]},"2":{"line":7,"type":"if","locations":[{"start":{"line":7,"column":16},"end":{"line":7,"column":34}},{"start":{"line":7,"column":16},"end":{"line":7,"column":34}}]},"3":{"line":8,"type":"if","locations":[{"start":{"line":8,"column":15},"end":{"line":8,"column":33}},{"start":{"line":8,"column":15},"end":{"line":8,"column":33}}]},"4":{"line":12,"type":"switch","locations":[{"start":{"line":13,"column":4},"end":{"line":14,"column":75}},{"start":{"line":15,"column":4},"end":{"line":16,"column":22}},{"start":{"line":17,"column":4},"end":{"line":18,"column":18}}]},"5":{"line":14,"type":"cond-expr","locations":[{"start":{"line":14,"column":27},"end":{"line":14,"column":28}},{"start":{"line":14,"column":31},"end":{"line":14,"column":32}}]},"6":{"line":14,"type":"binary-expr","locations":[{"start":{"line":14,"column":37},"end":{"line":14,"column":38}},{"start":{"line":14,"column":42},"end":{"line":14,"column":43}}]},"7":{"line":14,"type":"binary-expr","locations":[{"start":{"line":14,"column":48},"end":{"line":14,"column":49}},{"start":{"line":14,"column":53},"end":{"line":14,"column":54}}]},"8":{"line":14,"type":"binary-expr","locations":[{"start":{"line":14,"column":60},"end":{"line":14,"column":61}},{"start":{"line":14,"column":65},"end":{"line":14,"column":66}}]},"9":{"line":14,"type":"binary-expr","locations":[{"start":{"line":14,"column":68},"end":{"line":14,"column":69}},{"start":{"line":14,"column":73},"end":{"line":14,"column":74}}]}}}');

function run() {
  ++_coverage__file.f['1'];
  ++_coverage__file.s['1'];

  for (var i = (++_coverage__file.s['3'], 0); i < 10; ++_coverage__file.s['2'], i++) {
    ++_coverage__file.s['4'];

    if (i % 2 === 0) {
      ++_coverage__file.b['1'][0];
      ++_coverage__file.s['5'];
      console.log('Hello world!');
    } else {
      ++_coverage__file.b['1'][1];
      ++_coverage__file.s['6'];
      console.log('Yeah!');
    }
  }
  ++_coverage__file.s['7'];
  if (i === 10) {
    ++_coverage__file.b['2'][0];
    ++_coverage__file.s['8'];
    console.log('wow');
  } else {
    ++_coverage__file.b['2'][1];
    ;
  }++_coverage__file.s['9'];
  if (i === 0) {
    ++_coverage__file.b['3'][0];
    ++_coverage__file.s['10'];
    console.log('wow');
  } else {
    ++_coverage__file.b['3'][1];
    ;
  }
}

function counter() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var action = arguments[1];
  ++_coverage__file.f['2'];
  ++_coverage__file.s['11'];

  switch (action.type) {
    case (++_coverage__file.s['12'], 'INCREMENT'):
      ++_coverage__file.b['4'][0]
      ++_coverage__file.s['14'];

      return state + (42 ? (++_coverage__file.b['5'][0], (++_coverage__file.s['15'], 2)) : (++_coverage__file.b['5'][1], (++_coverage__file.s['16'], 3))) - ((++_coverage__file.b['6'][0], 1) || (++_coverage__file.b['6'][1], (++_coverage__file.s['17'], 0))) + ((++_coverage__file.b['7'][0], 0) && (++_coverage__file.b['7'][1], (++_coverage__file.s['18'], 1))) + a((++_coverage__file.b['8'][0], 2) && (++_coverage__file.b['8'][1], (++_coverage__file.s['19'], 0)), (++_coverage__file.b['9'][0], 0) || (++_coverage__file.b['9'][1], (++_coverage__file.s['20'], 0)));
    case (++_coverage__file.s['13'], 'DECREMENT'):
      ++_coverage__file.b['4'][1]
      ++_coverage__file.s['21'];

      return state - 1;
    default:
      ++_coverage__file.b['4'][2]
      ++_coverage__file.s['22'];

      return state;
  }
}

var a = (++_coverage__file.s['23'], function (x, y) {
  return ++_coverage__file.f['3'], x + y;
});
var b = (++_coverage__file.s['24'], function (x, y) {
  return ++_coverage__file.f['4'], x - y;
});

++_coverage__file.s['25'];
run();
++_coverage__file.s['26'];
console.log(function (c) {
  return ++_coverage__file.f['5'], c(0, { type: 'INCREMENT' });
}(counter));

++_coverage__file.s['27'];
void b;
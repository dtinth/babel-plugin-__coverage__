
![babel-plugin-\_\_coverage\_\_](http://i.imgur.com/WNq6pvg.png)
=============================

[![npm version](https://badge.fury.io/js/babel-plugin-__coverage__.svg)](https://badge.fury.io/js/babel-plugin-__coverage__)
[![npm downloads](https://img.shields.io/npm/dm/babel-plugin-__coverage__.svg)](https://www.npmjs.com/package/babel-plugin-__coverage__)
[![Build Status](https://travis-ci.org/dtinth/babel-plugin-__coverage__.svg?branch=master)](https://travis-ci.org/dtinth/babel-plugin-__coverage__)
[![codecov.io](https://codecov.io/github/dtinth/babel-plugin-__coverage__/coverage.svg?branch=master)](https://codecov.io/github/dtinth/babel-plugin-__coverage__?branch=master)
![MIT Licensed](https://img.shields.io/badge/license-MIT%20License-blue.svg)

A Babel plugin that instruments your code with `__coverage__` variable.
The resulting `__coverage__` object is compatible with Istanbul, which means it can instantly be used with [karma-coverage](https://github.com/karma-runner/karma-coverage) and mocha on Node.js (through [nyc](https://github.com/bcoe/nyc)).

__Note:__ This plugin does not generate any report or save any data to any file;
it only adds instrumenting code to your JavaScript source code.
To integrate with testing tools, please see the [Integrations](#integrations) section.


## Usage

Install it:

```
npm install --save-dev babel-plugin-__coverage__
```

Add it to `.babelrc` in test mode:

```js
{
  "env": {
    "test": {
      "plugins": [ "__coverage__" ]
    }
  }
}
```


## Integrations

### karma

It _just works_ with Karma. First, make sure that the code is already transpiled by Babel (either using `karma-babel-preprocessor`, `karma-webpack`, or `karma-browserify`). Then, simply set up [karma-coverage](https://github.com/karma-runner/karma-coverage) according to the docs, but __don’t add the `coverage` preprocessor.__ This plugin has already instrumented your code, and Karma should pick it up automatically.

It has been tested with [bemusic/bemuse](https://codecov.io/github/bemusic/bemuse) project, which contains ~2400 statements.


### mocha on node.js (through nyc)

Configure Mocha to transpile JavaScript code using Babel, then you can run your tests with [`nyc`](https://github.com/bcoe/nyc), which will collect all the coverage report. You need to __configure NYC not to instrument your code__ by setting this in your `package.json`:

```js
  "nyc": {
    "include": [ "/" ]
  },
```

## Ignoring files

You don't want to cover your test files as this will skew your coverage results. You can configure this by configuring the plugin like so:

```js
"plugins": [ [ "__coverage__", { "ignore": "test/" } ] ]
```

Where `ignore` is a [glob pattern](https://www.npmjs.com/package/minimatch).

Alternatively, you can specify `only` which will take precedence over `ignore`:

```js
"plugins": [ [ "__coverage__", { "only": "src/" } ] ]
```

## Canned Answers

### There’s already Isparta. Why another coverage tool?

> __Note:__ Some text in this section is outdated and I say this instead of keeping this section up-to-date lol. So [Isparta is now unmaintained](https://github.com/douglasduteil/isparta/commit/7e89d4e467f54558396533462122e73ea4e9dc31) and [a new version of Istanbul](https://github.com/istanbuljs/istanbul-lib-source-maps) that supports arbitrary compile-to-JS language is coming…

Isparta is currently the de-facto tool for measuring coverage against ES6 code, which extends Istanbul with ES6 support through Babel. It works very well so far, but then I hit some walls with it.

So I’ve been trying to get webpack 2 to work with Istanbul/Isparta.
To benefit from [webpack 2’s with tree shaking](http://www.2ality.com/2015/12/webpack-tree-shaking.html), I need to keep `import` and `export` statements in my ES6 modules intact. However, with this setup I can’t get code coverage to work. Inspecting Isparta’s [source code](https://github.com/douglasduteil/isparta/blob/749862a7d1810dd25b8c62c9e613720b57d36da1/src/instrumenter.js) reveals how it works:

1. It uses Babel to transpile ES6 back into ES5, saving the source map.
2. It uses Istanbul to instrument the transpiled source code. This produces some initial metadata (in a global variable called `__coverage__`) which contains the location of each statement, branch, and function. Unfortunately, these mapings are mapped to the transpiled code. Therefore,
3. The metadata is processed using source map obtained from step 1 to map the location in transpiled code back to the location in the original source code.
4. The final instrumented code in ES5 is generated. This code shouldn’t be processed through Babel again, or it will be redundant and leads to slower builds.

Since transforming `import`/`export` statements has now been disabled, instrumentation now dies at step 2, because the Esprima that Istanbul is using cannot process `import`/`export` statements.

So I looked for something else, and I found [babel-plugin-transform-adana](https://github.com/adana-coverage/babel-plugin-transform-adana). I tried it out immediately.
It turns out that although adana also generates the `__coverage__` variable, it uses its own format which is not compatible with most existing tools (e.g. `istanbul`’s reporter, `karma-coverage` and `nyc`). Tools need to be reinvented for each test harness.

So I went back to use webpack 1 for the time being.

Now, with lots of tools to help developers author Babel 6 plugins,
such as [the Babel Handbook](https://github.com/thejameskyle/babel-handbook) and [the AST Explorer](https://astexplorer.net/), it’s not that hard to create Babel plugins today. So I gave it a shot. This is my first Babel plugin.

It turns out that I can create a rudimentary instrumenter with Babel 6 in roughly 300 LOC (compare to Istanbul’s instrumenter which has ~1,000 LOC). Babel has A LOT of cool stuff to make transpilation easy, from [babel-template](https://github.com/babel/babel/tree/master/packages/babel-template) to [babel-traverse](https://github.com/babel/babel/tree/master/packages/babel-traverse) to [babel-helper-function-name](https://github.com/babel/babel/tree/master/packages/babel-helper-function-name). Babel’s convenient API also handles a lot of edge cases automatically. For example, if a function begins with `'use strict'` statement, prepending a statement into its body will insert it _after_ the `'use strict'` statement. It also transparently converts `if (a) b` into `if (a) { b }` if I want to insert another statement before or after `b`.

I haven’t tested this with webpack 2 yet.


### Is it stable?

Well, I wrote most of it in two nights and have only tested some basic stuffs.
So speaking in terms of maturity, this one is very new.

However, I tried using this in some bigger projects, such as [bemusic/bemuse](https://github.com/bemusic/bemuse) (which contains around 2400 statements). It works, with only few problems (which have now been fixed), and now it works fine.

__Note:__ If you’re using babel-plugin-\_\_coverage\_\_ inside a larger-scale application, feel free to send pull request and update this section kthx!


### Is the resulting coverage differ from Istanbul/Isparta?

Sometimes there’s so much logic in a single statement (usually due to functional programming techniques),
it is very likely that not every part of a statement will be covered by tests (see picture below).
Since most coverage service only cares about statement coverage, and I want coverage numbers to be very frank,
`babel-plugin-__coverage__` will treat certain expressions as statements.

Most likely, this means __if you switch to this plugin your coverage percentage will most likely go down__ compared to when you were using Istanbul or Isparta. But if you use a lot of arrow functions, this means your coverage will be more accurate! Here’s an example from the [bemusic/bemuse](https://github.com/bemusic/bemuse) project:

![Imgur](http://i.imgur.com/PX0s8Hy.png)

Here are some notable differences:

1. Arrow function expression body is treated as a statement, because its body may never be evaluated.

    ```js
       const x = a => b => c => a + b + c
    // <--------------------------------> S1
    //                <-----------------> S2
    //                     <------------> S3
    //                          <-------> S4
    ```

2. Logical operator’s right hand side expression is treated as a statement, because it may be short-circuited.

    ```js
       const value = a + b || a - b
    // <--------------------------> S1
    //                        <---> S2
    ```

3. Each of conditional operator’s branch is treated as a statement because it may not be evaluated.

    ```js
       const value = op === 'add' ? a + b : a - b
    // <----------------------------------------> S1
    //                              <---> S2
    //                                      <---> S3
    ```

4. Default parameters and values for destructuring are treated as a statement, because the default may not be evaluated.

    ```js
       function setValue (newValue = defaultValue) { }
    //                                             <-> S1
    //                               <----------> S2
    ```


### How do I ignore branches/statements?

I haven’t implemented it. I once [posted an issue on Isparta](https://github.com/douglasduteil/isparta/issues/24) asking about ignoring statements in Isparta (which is now fixed). But nowadays I just think that “coverage is just a number,” so I don’t need them anymore. If you want it, pull requests are welcome!


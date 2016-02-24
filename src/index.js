'use strict'

import template from 'babel-template'
import nameFunction from 'babel-helper-function-name'
import { realpathSync } from 'fs'

const coverageTemplate = template(`
  var GLOBAL = (new Function('return this'))()
  var COVERAGE = GLOBAL['__coverage__'] || (GLOBAL['__coverage__'] = { })
  var FILE_COVERAGE = COVERAGE[PATH] = GLOBAL['JSON'].parse(INITIAL)
`)

function getRealpath (n) {
  try {
    return realpathSync(n) || n
  } catch (e) {
    return n
  }
}

module.exports = function ({ types: t }) {
  function getData (context) {
    const path = getRealpath(context.file.opts.filename)
    return context.file.__coverage__data || (context.file.__coverage__data = {
      base: {
        path: path,
        s: { },
        b: { },
        f: { },
        statementMap: { },
        fnMap: { },
        branchMap: { }
      },
      nextId: {
        s: 1,
        b: 1,
        f: 1
      }
    })
  }
  function locToObject (loc) {
    return {
      start: {
        line: loc.start.line,
        column: loc.start.column
      },
      end: {
        line: loc.end.line,
        column: loc.end.column
      }
    }
  }
  function increase (context, type, id, index) {
    const wrap = index == null ? x => x : x => t.memberExpression(x, t.numericLiteral(index), true)
    return t.unaryExpression('++',
      wrap(
        t.memberExpression(
          t.memberExpression(getData(context).id, t.identifier(type)),
          t.stringLiteral(id),
          true
        )
      )
    )
  }
  function instrument (path, increment) {
    if (path.isStatement()) {
      path.insertBefore(t.expressionStatement(increment))
    } else if (path.isExpression()) {
      path.replaceWith(t.sequenceExpression([ increment, path.node ]))
    } else {
      throw new Error(`wtf? I can’t cover a ${path.node.type}!!!!??`)
    }
  }
  function instrumentStatement (context, path) {
    const node = path.node
    if (!node.loc) return
    if (node.__coverage__instrumented) return
    node.__coverage__instrumented = true
    const data = getData(context)
    const id = String(data.nextId.s++)
    data.base.s[id] = 0
    data.base.statementMap[id] = locToObject(node.loc)
    instrument(path, increase(context, 's', id))
  }
  function coverStatement (path) {
    instrumentStatement(this, path)
  }
  function coverVariableDeclarator (path) {
    if (!path.node.init) return
    instrumentStatement(this, path.get('init'))
  }
  function nextBranchId (context, line, type, locations) {
    const data = getData(context)
    const id = String(data.nextId.b++)
    data.base.b[id] = locations.map(() => 0)
    data.base.branchMap[id] = { line, type, locations: locations.map(locToObject) }
    return id
  }
  function coverIfStatement (path) {
    if (!path.node.loc) return
    instrumentStatement(this, path)
    if (!path.get('consequent').node) path.set('consequent', t.emptyStatement())
    if (!path.get('alternate').node) path.set('alternate', t.emptyStatement())
    const node = path.node
    const loc1 = node.consequent.loc || node.loc
    const loc2 = node.alternate.loc || loc1
    const id = nextBranchId(this, node.loc.start.line, 'if', [ loc1, loc2 ])
    instrument(path.get('consequent'), increase(this, 'b', id, 0))
    instrument(path.get('alternate'), increase(this, 'b', id, 1))
  }
  function coverSwitchStatement (path) {
    if (!path.node.loc) return
    instrumentStatement(this, path)
    const validCases = path.get('cases').filter(p => p.node.loc)
    const id = nextBranchId(this, path.node.loc.start.line, 'switch', validCases.map(p => p.node.loc))
    let index = 0
    for (const p of validCases) {
      if (p.node.test) {
        instrumentStatement(this, p.get('test'))
      }
      p.node.consequent.unshift(increase(this, 'b', id, index++))
    }
  }
  function coverForStatement (path) {
    instrumentStatement(this, path)
    if (path.get('update').node) {
      instrumentStatement(this, path.get('update'))
    }
  }
  function coverFunction (path) {
    if (!path.node.loc) return
    const node = path.node
    const data = getData(this)
    const id = String(data.nextId.f++)
    data.base.f[id] = 0
    data.base.fnMap[id] = {
      name: nameFunction(path),
      line: node.loc.start.line,
      loc: locToObject(node.loc)
    }
    const increment = increase(this, 'f', id)
    const body = path.get('body')
    if (body.isBlockStatement()) {
      body.node.body.unshift(t.expressionStatement(increment))
    } else if (body.isExpression()) {
      body.replaceWith(t.sequenceExpression([ increment, body.node ]))
    } else {
      throw new Error(`wtf?? Can’t cover function with ${body.node.type}`)
    }
  }
  function coverConditionalExpression (path) {
    if (!path.node.loc) return
    const node = path.node
    const loc1 = node.consequent.loc || node.loc
    const loc2 = node.alternate.loc || loc1
    const id = nextBranchId(this, node.loc.start.line, 'cond-expr', [ loc1, loc2 ])
    instrumentStatement(this, path.get('consequent'))
    instrumentStatement(this, path.get('alternate'))
    instrument(path.get('consequent'), increase(this, 'b', id, 0))
    instrument(path.get('alternate'), increase(this, 'b', id, 1))
  }
  function coverLogicalExpression (path) {
    if (!path.node.loc) return
    const node = path.node
    const loc1 = node.left.loc || node.loc
    const loc2 = node.right.loc || loc1
    const id = nextBranchId(this, node.loc.start.line, 'binary-expr', [ loc1, loc2 ])
    // left is always evaluated!!
    instrumentStatement(this, path.get('right'))
    instrument(path.get('left'), increase(this, 'b', id, 0))
    instrument(path.get('right'), increase(this, 'b', id, 1))
  }
  return {
    visitor: {
      ExpressionStatement: coverStatement,
      BreakStatement: coverStatement,
      ContinueStatement: coverStatement,
      DebuggerStatement: coverStatement,
      ReturnStatement: coverStatement,
      ThrowStatement: coverStatement,
      TryStatement: coverStatement,
      VariableDeclarator: coverVariableDeclarator,
      IfStatement: coverIfStatement,
      ForStatement: coverForStatement,
      ForInStatement: coverStatement,
      ForOfStatement: coverStatement,
      WhileStatement: coverStatement,
      DoWhileStatement: coverStatement,
      SwitchStatement: coverSwitchStatement,
      ArrowFunctionExpression: coverFunction,
      FunctionExpression: coverFunction,
      FunctionDeclaration: coverFunction,
      LabeledStatement: coverStatement,
      ConditionalExpression: coverConditionalExpression,
      LogicalExpression: coverLogicalExpression,
      Program: {
        enter (path) {
          getData(this).id = path.scope.generateUidIdentifier('__coverage__file')
        },
        exit (path) {
          const realPath = getRealpath(this.file.opts.filename)
          path.node.body.unshift(...coverageTemplate({
            GLOBAL: path.scope.generateUidIdentifier('__coverage__global'),
            COVERAGE: path.scope.generateUidIdentifier('__coverage__object'),
            FILE_COVERAGE: getData(this).id,
            PATH: t.stringLiteral(realPath),
            INITIAL: t.stringLiteral(JSON.stringify(getData(this).base))
          }))
        }
      }
    }
  }
}

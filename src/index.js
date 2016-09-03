'use strict'
// babel-plugin-__coverage__
//
// This is my first Babel plugin, and I wrote it during the night.
// Therefore, be prepared to see a lot of copypasta and wtf code.

import { util } from 'babel-core'
import template from 'babel-template'
import nameFunction from 'babel-helper-function-name'
import { realpathSync } from 'fs'
import { createHash } from 'crypto'
import testExclude from 'test-exclude'

const coverageTemplate = template(`
  var FILE_COVERAGE
  function COVER () {
    if (!FILE_COVERAGE) FILE_COVERAGE = GET_INITIAL_FILE_COVERAGE()
    return FILE_COVERAGE
  }
  function GET_INITIAL_FILE_COVERAGE () {
    var path = PATH, hash = HASH
    var global = (new Function('return this'))()
    var coverage = global['__coverage__'] || (global['__coverage__'] = { })
    if (coverage[path] && coverage[path].hash === hash) return coverage[path]
    var coverageData = global['JSON'].parse(INITIAL)
    coverageData.hash = hash
    return coverage[path] = coverageData
  }
  COVER ()
`)

//
// support nyc's include/exclude logic when
// provided as config in package.json.
//
let exclude
function nycShouldInstrument (filename) {
  if (!exclude) {
    exclude = testExclude({
      configKey: 'nyc',
      configPath: process.cwd()
    })
  }

  if (!exclude.configFound) return true
  else return exclude.shouldInstrument(filename)
}

//
// Takes a relative path and returns a real path.
// Assumes the path name is relative to working directory.
//
function getRealpath (n) {
  try {
    return realpathSync(n) || n
  } catch (e) {
    return n
  }
}

/**
 * This determines whether the given state and options combination
 * should result in the file being ignored and not covered
 * Big thanks to babel-plugin-transform-adana and their CC0-1.0 license
 * from which this code was mostly copy/pasted
 */
function skip ({ opts, file } = { }) {
  let shouldSkip = false

  if (file && opts) {
    const { ignore = [], only } = opts
    shouldSkip = util.shouldIgnore(
      file.opts.filename,
      util.arrayify(ignore, util.regexify),
      only ? util.arrayify(only, util.regexify) : null
    )
  }

  return shouldSkip || !nycShouldInstrument(file.opts.filename)
}

module.exports = function ({ types: t }) {
  //
  // Return the immediate data structure local to a file.
  //
  function getData (context) {
    const path = getRealpath(context.file.opts.filename)
    //
    // XXX: Is it OK to mutate `context.file`? I don’t know but it works!
    //
    return context.file.__coverage__data || (context.file.__coverage__data = {
      //
      // Initial data that will be added in front of generated source code
      base: {
        path: path,
        s: { },
        b: { },
        f: { },
        statementMap: { },
        fnMap: { },
        branchMap: { }
      },
      //
      // The counter that generates the next ID for each statement type.
      nextId: {
        s: 1,
        b: 1,
        f: 1
      },
      //
      // True if coverage info is already emitted.
      sealed: false
    })
  }

  //
  // Turns a `SourceLocation` into a plain object.
  //
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

  //
  // Generates an AST representing an expression that will increment the
  // code coverage counter.
  //
  function increase (context, type, id, index) {
    const wrap = (index != null
      // If `index` present, turn `x` into `x[index]`.
      ? (x) => t.memberExpression(x, t.numericLiteral(index), true)
      : (x) => x
    )
    return t.unaryExpression('++',
      wrap(
        t.memberExpression(
          t.memberExpression(t.callExpression(getData(context).id, [ ]), t.identifier(type)),
          t.stringLiteral(id),
          true
        )
      )
    )
  }

  //
  // Adds coverage traking expression to a path.
  //
  // - If it’s a statement (`a`), turns into `++coverage; a`.
  // - If it’s an expression (`x`), turns into `(++coverage, x)`.
  //
  function instrument (path, increment) {
    if (path.isBlockStatement()) {
      path.node.body.unshift(t.expressionStatement(increment))
    } else if (path.isStatement()) {
      path.insertBefore(t.expressionStatement(increment))
    } else if (path.isExpression()) {
      path.replaceWith(t.sequenceExpression([ increment, path.node ]))
    } else {
      throw new Error(`wtf? I can’t cover a ${path.node.type}!!!!??`)
    }
  }

  //
  // Adds coverage to any statement.
  //
  function instrumentStatement (context, path) {
    const node = path.node
    if (!node) return

    // Don’t cover code generated by Babel.
    if (!node.loc) return

    // Make sure we don’t cover already instrumented code (only applies to statements).
    // XXX: Hacky node mutation again. PRs welcome!
    if (node.__coverage__instrumented) return
    node.__coverage__instrumented = true

    const id = nextStatementId(context, node.loc)
    instrument(path, increase(context, 's', id))
  }

  //
  // Returns the next statement ID.
  //
  function nextStatementId (context, loc) {
    const data = getData(context)
    const id = String(data.nextId.s++)
    data.base.s[id] = 0
    data.base.statementMap[id] = locToObject(loc)
    return id
  }

  //
  // Returns the next branch ID and adds the information to `branchMap` object.
  //
  function nextBranchId (context, line, type, locations) {
    const data = getData(context)
    const id = String(data.nextId.b++)
    data.base.b[id] = locations.map(() => 0)
    data.base.branchMap[id] = { line, type, locations: locations.map(locToObject) }
    return id
  }

  //
  // `a` => `++coverage; a` For most common type of statements.
  //
  function coverStatement (path) {
    instrumentStatement(this, path)
  }

  //
  // `var x = 1` => `var x = (++coverage, 1)`
  //
  function coverVariableDeclarator (path) {
    instrumentStatement(this, path.get('init'))
  }

  //
  // Adds branch coverage to `if` statements.
  //
  function coverIfStatement (path) {
    if (!path.node.loc) return
    const loc0 = path.node.loc
    const node = path.node
    makeBlock(path.get('consequent'))
    makeBlock(path.get('alternate'))
    const loc1 = node.consequent && node.consequent.loc || loc0
    const loc2 = node.alternate && node.alternate.loc || loc1
    const id = nextBranchId(this, loc0.start.line, 'if', [ loc1, loc2 ])
    instrument(path.get('consequent'), increase(this, 'b', id, 0))
    instrument(path.get('alternate'), increase(this, 'b', id, 1))
    instrumentStatement(this, path)
  }

  //
  // Turns path into block.
  //
  function makeBlock (path) {
    if (!path.node) {
      return path.replaceWith(t.blockStatement([ ]))
    }
    if (!path.isBlockStatement()) {
      return path.replaceWith(t.blockStatement([ path.node ]))
    }
  }

  //
  // Adds branch coverage to `switch` statements.
  //
  function coverSwitchStatement (path) {
    if (!path.node.loc) return
    instrumentStatement(this, path)
    const validCases = path.get('cases').filter((p) => p.node.loc)
    const id = nextBranchId(this, path.node.loc.start.line, 'switch', validCases.map((p) => p.node.loc))
    let index = 0
    validCases.forEach(p => {
      if (p.node.test) {
        instrumentStatement(this, p.get('test'))
      }
      p.node.consequent.unshift(t.expressionStatement(increase(this, 'b', id, index++)))
    })
  }

  //
  // `for (;; x)` => `for (;; ++coverage, x)`.
  // Because the increment may be stopped in the first iteration due to `break`.
  //
  function coverForStatement (path) {
    makeBlock(path.get('body'))
    instrumentStatement(this, path)
    instrumentStatement(this, path.get('update'))
  }

  //
  // Turn the body into block. This fixes some really weird edge cases where
  // `while (x) if (y) z` is missing coverage on `z`.
  //
  function coverLoopStatement (path) {
    makeBlock(path.get('body'))
    instrumentStatement(this, path)
  }

  //
  // Covers a function.
  //
  function coverFunction (path) {
    if (!path.node.loc) return
    const node = path.node
    const data = getData(this)
    const id = String(data.nextId.f++)
    const nameOf = (namedNode) => namedNode && namedNode.id && namedNode.id.name || null
    data.base.f[id] = 0
    data.base.fnMap[id] = {
      name: nameOf(nameFunction(path)), // I love Babel!
      line: node.loc.start.line,
      loc: locToObject(node.loc)
    }
    const increment = increase(this, 'f', id)
    const body = path.get('body')
    if (body.isBlockStatement()) {
      body.node.body.unshift(t.expressionStatement(increment))
    } else if (body.isExpression()) {
      const sid = nextStatementId(this, body.node.loc || path.node.loc)
      body.replaceWith(t.sequenceExpression([
        increment,
        increase(this, 's', sid),
        body.node
      ]))
    } else {
      throw new Error(`wtf?? Can’t cover function with ${body.node.type}`)
    }
  }

  //
  // `a ? b : c` => `a ? (++coverage, b) : (++coverage, c)`.
  // Also adds branch coverage.
  //
  function coverConditionalExpression (path) {
    instrumentStatement(this, path.get('consequent'))
    instrumentStatement(this, path.get('alternate'))
    if (path.node.loc) {
      const node = path.node
      const loc1 = node.consequent.loc || node.loc
      const loc2 = node.alternate.loc || loc1
      const id = nextBranchId(this, node.loc.start.line, 'cond-expr', [ loc1, loc2 ])
      instrument(path.get('consequent'), increase(this, 'b', id, 0))
      instrument(path.get('alternate'), increase(this, 'b', id, 1))
    }
  }

  //
  // `a || b` => `a || (++coverage, b)`. Required due to short circuiting.
  // Also adds branch coverage.
  //
  function coverLogicalExpression (path) {
    instrumentStatement(this, path.get('right'))
    if (!path.node.loc) return
    const node = path.node
    const loc1 = node.left.loc || node.loc
    const loc2 = node.right.loc || loc1
    const id = nextBranchId(this, node.loc.start.line, 'binary-expr', [ loc1, loc2 ])
    instrument(path.get('left'), increase(this, 'b', id, 0))
    instrument(path.get('right'), increase(this, 'b', id, 1))
  }

  //
  // `(function (a = x) { })` => `(function (a = (++coverage, x)) { })`.
  // Because default may not be evaluated.
  //
  function coverAssignmentPattern (path) {
    instrumentStatement(this, path.get('right'))
  }

  // If the coverage for this file is sealed, make the guarded function noop.
  // It is here to fix some very weird edge case in `fixtures/imports.js`
  const guard = (f) => function (path, state) {
    if (skip(state)) return
    if (getData(this).sealed) return
    return f.call(this, path)
  }

  const coverWith = (process.env.BABEL_PLUGIN__COVERAGE__TEST
    // Defer execution so we can measure coverage easily.
    ? (f) => guard(function () { return f().apply(this, arguments) })
    // Execute immediately so it runs faster at runtime.
    // NOTE: This case should have already been covered due to
    //       self-instrumentation to generate `lib-cov`.
    : (f) => guard(f())
  )

  return {
    visitor: {
      //
      // Shamelessly copied from istanbul.
      //
      ExpressionStatement: coverWith(() => coverStatement),
      BreakStatement: coverWith(() => coverStatement),
      ContinueStatement: coverWith(() => coverStatement),
      DebuggerStatement: coverWith(() => coverStatement),
      ReturnStatement: coverWith(() => coverStatement),
      ThrowStatement: coverWith(() => coverStatement),
      TryStatement: coverWith(() => coverStatement),
      VariableDeclarator: coverWith(() => coverVariableDeclarator),
      IfStatement: coverWith(() => coverIfStatement),
      ForStatement: coverWith(() => coverForStatement),
      ForInStatement: coverWith(() => coverLoopStatement),
      ForOfStatement: coverWith(() => coverLoopStatement),
      WhileStatement: coverWith(() => coverLoopStatement),
      DoWhileStatement: coverWith(() => coverStatement),
      SwitchStatement: coverWith(() => coverSwitchStatement),
      ArrowFunctionExpression: coverWith(() => coverFunction),
      FunctionExpression: coverWith(() => coverFunction),
      FunctionDeclaration: coverWith(() => coverFunction),
      LabeledStatement: coverWith(() => coverStatement),
      ConditionalExpression: coverWith(() => coverConditionalExpression),
      LogicalExpression: coverWith(() => coverLogicalExpression),
      AssignmentPattern: coverWith(() => coverAssignmentPattern),
      ExportDefaultDeclaration: coverWith(() => coverStatement),

      Program: {
        enter (path, state) {
          if (skip(state)) return
          // Save the variable name used for tracking coverage.
          getData(this).id = path.scope.generateUidIdentifier('__cover__')
        },
        exit (path, state) {
          if (skip(state)) return
          // Prepends the coverage runtime.
          const realPath = getRealpath(this.file.opts.filename)
          const initialJson = JSON.stringify(getData(this).base)
          const hash = createHash('md5').update(initialJson).digest('hex')
          getData(this).sealed = true
          path.node.body.unshift(...coverageTemplate({
            GET_INITIAL_FILE_COVERAGE: path.scope.generateUidIdentifier('__coverage__getInitialState'),
            FILE_COVERAGE: path.scope.generateUidIdentifier('__coverage__file'),
            COVER: getData(this).id,
            PATH: t.stringLiteral(realPath),
            INITIAL: t.stringLiteral(initialJson),
            HASH: t.stringLiteral(hash)
          }))
        }
      }
    }
  }
}

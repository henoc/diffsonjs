# diffsonjs

[![travis_ci](https://img.shields.io/travis/henoc/diffsonjs.svg)](https://travis-ci.org/henoc/diffsonjs)
[![codecov](https://img.shields.io/codecov/c/github/henoc/diffsonjs.svg)](https://codecov.io/gh/henoc/diffsonjs)
[![npm](https://img.shields.io/npm/v/diffsonjs.svg)](https://www.npmjs.com/package/diffsonjs)

A javascript JSON diff and patch implementation of the [RFC-6902](https://tools.ietf.org/html/rfc6902). This library refers to [diffson](https://github.com/gnieh/diffson).

## Install

```bash
npm install diffsonjs
```

## Usage

```js
var diffsonjs = require('diffsonjs');

var left = {a: 1, b: true};
var right = {a: 2};

var delta = diffsonjs.diff(left, right);
console.log(delta);
// [
//   { op: 'replace', path: '/a', value: 2 },
//   { op: 'remove', path: '/b' }
// ]

var result = diffsonjs.patch(left, delta);
console.log(result);
// {a: 2}
```

## API

### diff(json1, json2, options?)

Compute the diff between two json objects.

#### diff options

```ts
interface DiffOptions {
    omitArrayDiffs?: boolean // default false, different arrays are represented by repleacement.
    remember?: boolean // default false, set the previous value as `oldValue` property for replacement or movement.
    equals?: (left: unknown, right: unknown) => boolean // if it exists, use it instead of the normal json comparison function.
    hashCode?: (value: any) => number // if it exists, it is used to speed up comparison of arrays.
}
```

### patch(json, delta, options?)

Apply a patch to json and return the result.

#### patch options

```ts
interface PatchOptions {
    equals?: (left: unknown, right: unknown) => boolean // if it exists, use it for tests.
}
```

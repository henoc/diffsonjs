import {assert} from "chai";
import { diff } from "../src";

describe("diff", () => {
    it("returns an empty array for the same values", () => {
        assert.deepEqual(diff(true, true), []);
    });

    it("returns a whole replacement for the two whole different values", () => {
        assert.deepEqual(diff(true, 1), [{op: "replace", path: "", value: 1}]);
    });

    it("contains an add operation for each added field", () => {
        assert.deepEqual(
            diff({a: 1}, {a: 1, b: 2}),
            [{op: "add", path: "/b", value: 2}]
        );
        assert.deepEqual(
            diff({a: 1}, {a: 1, b: false, c: null}),
            [{op: "add", path: "/b", value: false},
            {op: "add", path: "/c", value: null}]
        );
        assert.deepEqual(
            diff({a: 1, b: {a: true}}, {a: 1, b: {a: true, b: "new"}}),
            [{op: "add", path: "/b/b", value: "new"}]
        );
    });

    it("contains a remove operation for each removed field", () => {
        assert.deepEqual(
            diff({a: 1, b: 2}, {a: 1}),
            [{op: "remove", path: "/b"}]
        );
        assert.deepEqual(
            diff({a: 1, b: false, c: null}, {a: 1}),
            [{op: "remove", path: "/b"},
            {op: "remove", path: "/c"}]
        );
        assert.deepEqual(
            diff({a: 1, b: {a: true, b: "new"}}, {a: 1, b: {a: true}}),
            [{op: "remove", path: "/b/b"}]
        );
    });

    it("contains a replace operation for each replaced field", () => {
        assert.deepEqual(
            diff({a: 20}, {a: 40}),
            [{op: "replace", path: "/a", value: 40}]
        );
        assert.deepEqual(
            diff({a: {b: "p"}}, {a: {b: null}}),
            [{op: "replace", path: "/a/b", value: null}]
        );
    });

    it("contains an add operation for each added element in array", () => {
        assert.deepEqual(
            diff([], [1,2,3]),
            [
                {op: "add", path: "/-", value: 1},
                {op: "add", path: "/-", value: 2},
                {op: "add", path: "/-", value: 3}
            ]
        );
        assert.deepEqual(
            diff([1,2,3], [1,2,4,5,6,3]),
            [
                {op: "add", path: "/2", value: 4},
                {op: "add", path: "/3", value: 5},
                {op: "add", path: "/4", value: 6}
            ]
        );
    });

    it("contains an remove operation for each removed element in array", () => {
        assert.deepEqual(
            diff([1,2,3],[]),
            [
                {op: "remove", path: "/2"},
                {op: "remove", path: "/1"},
                {op: "remove", path: "/0"}
            ]
        );
        assert.deepEqual(
            diff([1,2,4,5,6,3],[1,2,3]),
            [
                {op: "remove", path: "/4"},
                {op: "remove", path: "/3"},
                {op: "remove", path: "/2"}
            ]
        );
    });

    it("contains a replace operation for each replaced element in array", () => {
        assert.deepEqual(
            diff([1,2,3],[1,4,3]),
            [
                {op: "replace", path: "/1", value: 4}
            ]
        );
        assert.deepEqual(
            diff([1,{a:2},3],[1,{a:4},3]),
            [
                {op: "replace", path: "/1/a", value: 4}
            ]
        )
    });

    it("returns array diffs", () => {
        assert.deepEqual(
            diff(
                {a: [1,2,3,4,5,6,7,8,9,10]},
                {a: [1,4,5,11,6,7]}
            ),
            [
                {op: "remove", path: "/a/2"},
                {op: "remove", path: "/a/1"},
                {op: "add", path: "/a/3", value: 11},
                {op: "remove", path: "/a/8"},
                {op: "remove", path: "/a/7"},
                {op: "remove", path: "/a/6"}
            ]
        );
    });

    it("remembers old values when remember is true", () => {
        assert.deepEqual(
            diff({a: 1, b: 2}, {b: "c"}, {remember: true}),
            [
                {op: "remove", path: "/a", oldValue: 1},
                {op: "replace", path: "/b", value: "c", oldValue: 2}
            ]
        );
        assert.deepEqual(
            diff([1,2,3],[1], {remember: true}),
            [
                {op: "remove", path: "/2", oldValue: 3},
                {op: "remove", path: "/1", oldValue: 2}
            ]
        );
    });

    it("skips to check the inner differences of arrays when omitArrayDiffs is true", () => {
        assert.deepEqual(
            diff({a: [1,2,3]}, {a: [1,4,3]}, {omitArrayDiffs: true}),
            [
                {op: "replace", path: "/a", value: [1,4,3]}
            ]
        );
    });
});

import {assert} from "chai";
import { diff } from "../src";

describe("diff", () => {
    it("returns an empty array for the same values", () => {
        assert.deepEqual(diff(true, true), []);
    });

    it("returns a whole replacement for the two whole different values", () => {
        assert.deepEqual(diff(true, 1), [{operator: "replace", pointer: "", value: 1}]);
    });

    it("contains an add operation for each added field", () => {
        assert.deepEqual(
            diff({a: 1}, {a: 1, b: 2}),
            [{operator: "add", pointer: "/b", value: 2}]
        );
        assert.deepEqual(
            diff({a: 1}, {a: 1, b: false, c: null}),
            [{operator: "add", pointer: "/b", value: false},
            {operator: "add", pointer: "/c", value: null}]
        );
        assert.deepEqual(
            diff({a: 1, b: {a: true}}, {a: 1, b: {a: true, b: "new"}}),
            [{operator: "add", pointer: "/b/b", value: "new"}]
        );
    });

    it("contains a remove operation for each removed field", () => {
        assert.deepEqual(
            diff({a: 1, b: 2}, {a: 1}),
            [{operator: "remove", pointer: "/b"}]
        );
        assert.deepEqual(
            diff({a: 1, b: false, c: null}, {a: 1}),
            [{operator: "remove", pointer: "/b"},
            {operator: "remove", pointer: "/c"}]
        );
        assert.deepEqual(
            diff({a: 1, b: {a: true, b: "new"}}, {a: 1, b: {a: true}}),
            [{operator: "remove", pointer: "/b/b"}]
        );
    });

    it("contains a replace operation for each replaced field", () => {
        assert.deepEqual(
            diff({a: 20}, {a: 40}),
            [{operator: "replace", pointer: "/a", value: 40}]
        );
        assert.deepEqual(
            diff({a: {b: "p"}}, {a: {b: null}}),
            [{operator: "replace", pointer: "/a/b", value: null}]
        );
    });

    it("contains an add operation for each added element in array", () => {
        assert.deepEqual(
            diff([], [1,2,3]),
            [
                {operator: "add", pointer: "/-", value: 1},
                {operator: "add", pointer: "/-", value: 2},
                {operator: "add", pointer: "/-", value: 3}
            ]
        );
        assert.deepEqual(
            diff([1,2,3], [1,2,4,5,6,3]),
            [
                {operator: "add", pointer: "/2", value: 4},
                {operator: "add", pointer: "/3", value: 5},
                {operator: "add", pointer: "/4", value: 6}
            ]
        );
    });

    it("contains an remove operation for each removed element in array", () => {
        assert.deepEqual(
            diff([1,2,3],[]),
            [
                {operator: "remove", pointer: "/2"},
                {operator: "remove", pointer: "/1"},
                {operator: "remove", pointer: "/0"}
            ]
        );
        assert.deepEqual(
            diff([1,2,4,5,6,3],[1,2,3]),
            [
                {operator: "remove", pointer: "/4"},
                {operator: "remove", pointer: "/3"},
                {operator: "remove", pointer: "/2"}
            ]
        );
    });

    it("contains a replace operation for each replaced element in array", () => {
        assert.deepEqual(
            diff([1,2,3],[1,4,3]),
            [
                {operator: "replace", pointer: "/1", value: 4}
            ]
        );
        assert.deepEqual(
            diff([1,{a:2},3],[1,{a:4},3]),
            [
                {operator: "replace", pointer: "/1/a", value: 4}
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
                {operator: "remove", pointer: "/a/2"},
                {operator: "remove", pointer: "/a/1"},
                {operator: "add", pointer: "/a/3", value: 11},
                {operator: "remove", pointer: "/a/8"},
                {operator: "remove", pointer: "/a/7"},
                {operator: "remove", pointer: "/a/6"}
            ]
        );
    });

    it("remembers old values when remember is true", () => {
        assert.deepEqual(
            diff({a: 1, b: 2}, {b: "c"}, {remember: true}),
            [
                {operator: "remove", pointer: "/a", oldValue: 1},
                {operator: "replace", pointer: "/b", value: "c", oldValue: 2}
            ]
        );
        assert.deepEqual(
            diff([1,2,3],[1], {remember: true}),
            [
                {operator: "remove", pointer: "/2", oldValue: 3},
                {operator: "remove", pointer: "/1", oldValue: 2}
            ]
        );
    });

    it("skips to check the difference of arrays when arrayDiffs is false", () => {
        assert.deepEqual(
            diff({a: [1,2,3]}, {a: [1,4,3]}, {arrayDiffs: false}),
            [
                {operator: "replace", pointer: "/a", value: [1,4,3]}
            ]
        );
    });
});

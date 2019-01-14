import {assert} from "chai";
import { patch } from "../src/patch";

describe("patch", () => {
    it("returns a value with an added new property", () => {
        assert.deepEqual(
            patch({}, [{op: "add", path: "/a", value: 10}]),
            {a: 10}
        );
    });

    it("returns a value with an added empty named property", () => {
        assert.deepEqual(
            patch({a: {}}, [{op: "add", path: "/a/", value: 10}]),
            {a: {"": 10}}
        );
    });
    
    it("returns an array with an appended new item", () => {
        assert.deepEqual(
            patch([1,2,3], [{op: "add", path: "/-", value: 4}]),
            [1,2,3,4]
        );
    });
    
    it("returns a value with an added new inner property", () => {
        assert.deepEqual(
            patch({a: {}}, [{op: "add", path: "/a/a", value: 10}]),
            {a: {a: 10}}
        ); 
    });
    
    it("throws an error if the path is out of range", () => {
        assert.throw(() => {
            patch([1,2,3], [{op: "add", path: "/100", value: 4}]);
        }, /Invalid path/);
    });

    it("throws an error if some element is missing in the middle of the path", () => {
        assert.throw(() => {
            patch({}, [{op: "add", path: "/a/a", value: 10}]);
        }, /Invalid path/);
    });

    it("returns a correct value with a replacement operation", () => {
        assert.deepEqual(
            patch([1,2,3,4], [{op: "replace", path: "", value: 10}]),
            10
        );
        assert.deepEqual(
            patch({a: 10}, [{op: "replace", path: "/a", value: "b"}]),
            {a: "b"}
        );
        assert.deepEqual(
            patch([1,2,3,4], [{op: "replace", path: "/1", value: 10}]),
            [1,10,3,4]
        );
    });

    it("throws an error if replaces the '-' element of an array", () => {
        assert.throw(() => {
            patch([1,2,3], [{op: "replace", path: "/-", value: 4}])
        }, /Invalid path/);
    });

    it("throws an error if replaces an out of range element in an array", () => {
        assert.throw(() => {
            patch([1,2,3], [{op: "replace", path: "/100", value: 4}])
        }, /Invalid path/);
    });

    it("removes a property if provides a removal operation", () => {
        assert.deepEqual(
            patch({a: 1, b: 2}, [{op: "remove", path: "/a"}]),
            {b: 2}
        );
    });

    it("throws an error if removes an undefined property", () => {
        assert.throw(() => {
            patch({}, [{op: "remove", path: "/a"}])
        }, /Invalid path/);
    });

    it("returns a correct value with a movement operation", () => {
        assert.deepEqual(
            patch([{a: 10}, [2], "foo"], [{op: "move", from: "/0/a", path: "/1/-"}]),
            [{}, [2,10], "foo"]
        );
    });

    it("returns a correct value with a copy operation", () => {
        assert.deepEqual(
            patch({a: 1}, [{op: "copy", from: "", path: "/a"}]),
            {a: {a: 1}}
        );
    });

    it("returns the same value if tests scuceed", () => {
        assert.deepEqual(
            patch({a: {b: {c: 1}}}, [{op: "test", path: "/a/b", value: {c: 1}}]),
            {a: {b: {c: 1}}}
        );
    });

    it("throws an error if tests fail", () => {
        assert.throw(() => {
            patch({a: {b: {c: 1}}}, [{op: "test", path: "/a/b", value: "c"}])
        }, /Test fails/);
    });
});

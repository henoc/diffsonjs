import {assert} from "chai";
import ptr from "../src/json-pointer-helper";

describe("pointerEscape,Unescape", () => {
    it("returns correct escaped strings", () => {
        assert.equal(ptr.escape("test/test~~"), "test~1test~0~0");
    });

    it("returns correct unescaped strings", () => {
        assert.equal(ptr.unescape("test~1test~0~0"), "test/test~~");
    });

    it("returns correct decoded strings", () => {
        assert.deepEqual(ptr.decode("/a/a"), ["a", "a"]);
        assert.deepEqual(ptr.decode(""), []);
    });

    it("returns correct encoded pointers", () => {
        assert.equal(ptr.encode(["a", "b"]), "/a/b");
        assert.equal(ptr.encode([""]), "/");
        assert.equal(ptr.encode([]), "");
        assert.equal(ptr.encode(["/"]), "/~1");
    });
});

import { getLcs, IndexPair } from "../src/lcs";
import { assert } from "chai";
import { jsonEquals } from "../src";

describe("getLcs", () => {
    const lr: (l: number, r: number) => IndexPair = (leftIndex, rightIndex) => {return {leftIndex, rightIndex};};

    it("returns an empty mapping for an empty sequence and another sequence", () => {
        assert.deepEqual(getLcs([..."abcdef"], [...""]), []);
        assert.deepEqual(getLcs([...""], [..."abcdef"]), []);
    });

    it("returns a correct mapping for the same sequences", () => {
        assert.deepEqual(getLcs([..."abcdef"], [..."abcdef"]), [0,1,2,3,4,5].map(i => lr(i, i)));
    });

    it("returns a correct mapping for a sequence and a prefix", () => {
        assert.deepEqual(
            getLcs([..."abc"], [..."abcdef"]),
            [0,1,2].map(lr)
        );
        assert.deepEqual(
            getLcs([..."abcdef"], [..."abc"]),
            [0,1,2].map(lr)
        );
    });

    it("returns an empty mapping for two totally different sequences", () => {
        assert.deepEqual(
            getLcs([..."abcdef"], [..."ghijkl"]),
            []
        );
    });

    it("returns a correct mapping for a sequence and a subset", () => {
        assert.deepEqual(
            getLcs([..."abcdef"], [..."bce"]),
            [lr(1,0),lr(2,1),lr(4,2)]
        );
    });

    it("returns a correct mapping for a repeated character", () => {
        assert.deepEqual(
            getLcs([..."abcbdbebf"],[..."bbbb"]),
            [lr(1,0),lr(3,1),lr(5,2),lr(7,3)]
        );
    });

    it("returns a correct mapping for two sequences", () => {
        assert.deepEqual(
            getLcs([1,2,3,4,5,6,7,8,9,10], [1,4,5,11,6,7]),
            [lr(0,0),lr(3,1),lr(4,2),lr(5,4),lr(6,5)]
        );
    });

    it("returns a corret mapping with provided equals function", () => {
        assert.deepEqual(
            getLcs([1,2,3,4,5], [6,7,"a","b",8,9,10], (l,r) => typeof l === typeof r),
            [lr(0,0),lr(1,1),lr(2,4),lr(3,5),lr(4,6)]
        );
    });

    it("returns a correct mapping with provided hashCode function", () => {
        assert.deepEqual(
            getLcs([1,2,3,4,5,6,7,8,9,10], [1,4,5,11,6,7], jsonEquals, v => Number(v) % 3),
            [lr(0,0),lr(3,1),lr(4,2),lr(5,4),lr(6,5)]
        );
    });
});
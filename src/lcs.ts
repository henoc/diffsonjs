import { jsonEquals } from "./deepequal";

export type IndexPair = {leftIndex: number, rightIndex: number};

export function getLcs(left: unknown[], right: unknown[], equals: (left: unknown, right: unknown) => boolean = jsonEquals, hashCode?: (value: unknown) => number): IndexPair[] {
    let eq = (i: number, j: number) => equals(left[i], right[j]);
    if (hashCode) {
        const leftHashTable = left.map(item => hashCode(item));
        const rightHashTable = right.map(item => hashCode(item));
        eq = (i: number, j: number) => leftHashTable[i] !== rightHashTable[j] ? false : equals(left[i], right[j]);
    }
    const N = 2;
    const M = right.length + 1;
    const dp: IndexPair[][][] = new Array(N);
    for (let i = 0; i < N; i++) {
        dp[i] = new Array(M);
        for (let j = 0; j < M; j++) {
            dp[i][j] = [];
        }
    }
    const modN = (index: number) => index % N;
    for(let i = 0; i < left.length; i++) {
        for(let j = 0; j < right.length; j++) {
            if (eq(i, j)) {
                dp[modN(i + 1)][j + 1] = [...dp[modN(i)][j], {leftIndex: i, rightIndex: j}];
            } else {
                const pre1 = dp[modN(i)][j + 1];
                const pre2 = dp[modN(i + 1)][j];
                dp[modN(i + 1)][j + 1] = pre2.length > pre1.length ? [...pre2] : [...pre1];
            }
        }
    }
    return dp[modN(left.length)][right.length];
}

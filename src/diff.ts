import phelper from "./json-pointer-helper";
import { IndexPair, getLcs } from "./lcs";
import { jsonEquals } from "./deepequal";

export type DiffOperator = {
    path: string
} & ({
    op: "replace"
    value: any
    oldValue?: any
} | {
    op: "remove"
    oldValue?: any
} | {
    op: "add"
    value: any
} | {
    op: "move"
    from: string
} | {
    op: "copy"
    from: string
} | {
    op: "test"
    value: any
});

export interface DiffOptions {
    omitArrayDiffs?: boolean
    remember?: boolean
    equals?: (left: unknown, right: unknown) => boolean
    hashCode?: (value: any) => number
}

type IdxObject = {[key: string]: unknown};

function isObject(e: unknown): e is IdxObject {
    return typeof e === "object" && e !== null && !Array.isArray(e);
}

export function diff(left: unknown, right: unknown, options: DiffOptions = {}): DiffOperator[] {
    return anyDiff(left, right, "", options);
}

function anyDiff(left: unknown, right: unknown, pointer: string, options: DiffOptions): DiffOperator[] {
    const equals = options.equals || jsonEquals;
    if (equals(left, right)) return [];
    else if (isObject(left) && isObject(right)) return fieldsDiff(left, right, pointer, options);
    else if (Array.isArray(left) && Array.isArray(right) && !options.omitArrayDiffs) return arraysDiff(left, right, pointer, options);
    else return [{op: "replace", path: pointer, value: right, ...(options.remember ? {oldValue: left} : {})}];
}

function fieldsDiff(left: IdxObject, right: IdxObject, pointer: string, options: DiffOptions): DiffOperator[] {
    const equals = options.equals || jsonEquals;
    const ret: DiffOperator[] = [];
    const allKeys = [...Object.keys(left), ...Object.keys(right)].filter((x,i,self) => self.indexOf(x) === i);
    allKeys.sort();
    for (const key of allKeys) {
        if (key in left && key in right && !equals(left[key], right[key])) {
            ret.push(...anyDiff(left[key], right[key], phelper.append(pointer, key), options));
        } else if (key in left && !(key in right)) {
            ret.push({op: "remove", path: phelper.append(pointer, key), ...(options.remember ? {oldValue: left[key]} : {})});
        } else if (!(key in left) && key in right) {
            ret.push({op: "add", path: phelper.append(pointer, key), value: right[key]});
        }
    }
    return ret;
}

function arraysDiff(left: unknown[], right: unknown[], pointer: string, options: DiffOptions): DiffOperator[] {
    const equals = options.equals || jsonEquals;
    const ret: DiffOperator[] = [];
    const lcs: IndexPair[] = getLcs(left, right, equals, options.hashCode);
    let leftIndex = 0;
    let leftShift = 0;
    let rightIndex = 0;
    let csIndex = 0;
    while(true) {
        const nextCs = lcs[csIndex];
        if (nextCs && nextCs.leftIndex === leftIndex) {
            ret.push(...addAll(right, pointer, rightIndex, nextCs.rightIndex));
            leftShift += nextCs.rightIndex - rightIndex;
            rightIndex = nextCs.rightIndex;
            csIndex++;
        } else if (nextCs && nextCs.rightIndex === rightIndex) {
            ret.push(...removeAll(left, pointer, leftIndex, nextCs.leftIndex, leftShift, options.remember || false));
            leftShift -= nextCs.leftIndex - leftIndex;
            leftIndex = nextCs.leftIndex;
            csIndex++;
        } else if (left.length > leftIndex && right.length > rightIndex) {
            ret.push(...anyDiff(left[leftIndex], right[rightIndex], phelper.append(pointer, String(leftIndex + leftShift)), options));
        } else if (right.length <= rightIndex) {
            ret.push(...removeAll(left, pointer, leftIndex, left.length, leftShift, options.remember || false));
            break;
        } else {
            ret.push(...right.slice(rightIndex).map(value => {
                return {op: <"add">"add", path: phelper.append(pointer, "-"), value};
            }));
            break;
        }
        leftIndex++;
        rightIndex++;
    }
    return ret;
}

function addAll(array: unknown[], pointer: string, beginIndex: number, endIndex: number): DiffOperator[] {
    const ret: DiffOperator[] = [];
    for (let i = beginIndex; i < endIndex; i++) {
        ret.push({
            op: "add",
            path: phelper.append(pointer, String(i)),
            value: array[i]
        });
    }
    return ret;
}

function removeAll(array: unknown[], pointer: string, beginIndex: number, endIndex: number, shiftOnPointer: number, remember: boolean): DiffOperator[] {
    const ret: DiffOperator[] = [];
    for (let i = endIndex - 1; i >= beginIndex; i--) {
        ret.push({
            op: "remove",
            path: phelper.append(pointer, String(i + shiftOnPointer)),
            ...(remember ? {oldValue: array[i]} : {})
        });
    }
    return ret;
}

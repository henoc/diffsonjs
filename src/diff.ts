import equal from "fast-deep-equal";

export type DiffOperator = {
    pointer: string
} & ({
    operator: "replace"
    value: any
    oldValue?: any
} | {
    operator: "remove"
    oldValue?: any
} | {
    operator: "add"
    value: any
})

export interface DiffOptions {
    arrayDiffs?: boolean
    remember?: boolean
}

type IdxObject = {[key: string]: unknown};

function isObject(e: unknown): e is IdxObject {
    return typeof e === "object" && e !== null;
}

export function diff(left: unknown, right: unknown, pointer: string, options: DiffOptions): DiffOperator[] {
    if (equal(left, right)) return [];
    else if (isObject(left) && isObject(right)) return fieldsDiff(left, right, pointer, options);
    else if (Array.isArray(left) && Array.isArray(right) && options.arrayDiffs) return arraysDiff(left, right, pointer, options);
    else return [{operator: "replace", pointer, value: right, ...(options.remember ? {oldValue: left} : {})}];
}

export function fieldsDiff(left: IdxObject, right: IdxObject, pointer: string, options: DiffOptions): DiffOperator[] {
    const ret: DiffOperator[] = [];
    const allKeys = [...Object.keys(left), ...Object.keys(right)];
    allKeys.sort();
    for (const key of allKeys) {
        if (key in left && key in right && !equal(left[key], right[key])) {
            ret.push(...diff(left[key], right[key], `${pointer}/${key}`, options));
        } else if (key in left && !(key in right)) {
            ret.push({operator: "remove", pointer: `${pointer}/${key}`, ...(options.remember ? {oldValue: left[key]} : {})});
        } else if (!(key in left) && key in right) {
            ret.push({operator: "add", pointer: `${pointer}/${key}`, value: right[key]});
        }
    }
    return ret;
}

export function arraysDiff(left: unknown[], right: unknown[], pointer: string, options: DiffOptions): DiffOperator[] {
    type IndexPair = {leftIndex: number, rightIndex: number};
    const ret: DiffOperator[] = [];
    const commonSeqs: IndexPair[] = 123;
    let leftIndex = 0;
    let rightIndex = 0;
    let csIndex = 0;
    while(true) {
        const nextCs = commonSeqs[csIndex];
        if (nextCs && nextCs.leftIndex === leftIndex) {
            ret.push(...addAll(right, pointer, rightIndex, nextCs.rightIndex));
            rightIndex = nextCs.rightIndex;
            csIndex++;
        } else if (nextCs && nextCs.rightIndex === rightIndex) {
            ret.push(...removeAll(left, pointer, leftIndex, nextCs.leftIndex, options.remember || false));
            leftIndex = nextCs.leftIndex;
            csIndex++;
        } else if (left.length > leftIndex && right.length > rightIndex) {
            ret.push(...diff(left[leftIndex], right[rightIndex], pointer, options));
        } else if (right.length <= rightIndex) {
            removeAll(left, pointer, leftIndex, left.length, options.remember || false);
            break;
        } else {
            ret.push(...right.slice(rightIndex).map(value => {
                return {operator: <"add">"add", pointer: `${pointer}/-`, value};
            }));
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
            operator: "add",
            pointer: `${pointer}/${i}`,
            value: array[i]
        });
    }
    return ret;
}

function removeAll(array: unknown[], pointer: string, beginIndex: number, endIndex: number, remember: boolean): DiffOperator[] {
    const ret: DiffOperator[] = [];
    for (let i = beginIndex; i < endIndex; i++) {
        ret.push({
            operator: "remove",
            pointer: `${pointer}/${i}`,
            ...(remember ? {oldValue: array[i]} : {})
        });
    }
    return ret;
}

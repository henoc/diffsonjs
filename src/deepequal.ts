const isArray = Array.isArray;
const keyList = Object.keys;
const hasProp = Object.prototype.hasOwnProperty;

/**
 * Compare two json objects. Implementation referred to library, but `RegExp` and `Date` omitted.
 * @see https://github.com/epoberezkin/fast-deep-equal
 * @param left json value
 * @param right json value
 */
export function jsonEquals(left: unknown, right: unknown): boolean {
    if (left === right) return true;
    if (typeof left === "object" && typeof right === "object" && left && right) {
        let i: number, length: number, key: string;
        if (isArray(left) && isArray(right)) {
            length = left.length;
            if (length !== right.length) return false;
            for (i = length; i-- !== 0;) {
                if (!jsonEquals(left[i], right[i])) return false;
            }
            return true;
        }

        if (isArray(left) !== isArray(right)) return false;

        const keys = keyList(left as object);
        length = keys.length;

        if (length !== keyList(right as object).length) return false;

        for (i = length; i-- !== 0;) {
            if (!hasProp.call(right, keys[i])) return false;
        }

        for (i = length; i-- !== 0;) {
            key = keys[i];
            if (!jsonEquals((left as any)[key], (right as any)[key])) return false;
        }

        return true;
    }

    return left !== left && right !== right;
}

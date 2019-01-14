import { DiffOperator } from "./diff";
import { jsonEquals } from "./deepequal";
import phelper from "./json-pointer-helper";

export interface PatchOptions {
    equals?: (left: unknown, right: unknown) => boolean
}

/**
 * Apply diff operators and return modified json if it succeeds.
 * @throws `PatchError` if fails to apply the patch.
 */
export function patch(json: unknown, diffOps: DiffOperator[], patchOptions: PatchOptions = {}): any {
    let target = JSON.parse(JSON.stringify(json));
    const eq = patchOptions && patchOptions.equals || jsonEquals;
    const error = (diffOp: DiffOperator, json: any, reason: string) => {
        const err = new Error(`${reason} diffOp: ${JSON.stringify(diffOp)}, json: ${JSON.stringify(json)}`);
        err.name = "PatchError";
        return err;
    }
    
    diffOps.forEach(diffOp => {
        const addProcedure = (value: any) => {
            if (phelper.decode(diffOp.path).length === 0) { // root path
                target = value;
            } else if (!phelper.add(target, diffOp.path, value)) {
                throw error(diffOp, target, `Invalid path found.`);
            }
        }
        const removeProcedure = (path: string) => {
            if (phelper.decode(path).length === 0) {
                target = undefined;
            } else if (!phelper.remove(target, path)) {
                throw error(diffOp, target, `Invalid path found.`);
            }
        }
        const getOrException = (path: string) => {
            const ret = phelper.get(target, path);
            if (ret === undefined) throw error(diffOp, target, `Invalid path found.`);
            return ret;
        }
        let tmp: any;
        switch (diffOp.op) {
            case "add":
            addProcedure(diffOp.value);
            break;
            case "remove":
            removeProcedure(diffOp.path);
            break;
            case "replace":
            removeProcedure(diffOp.path);
            addProcedure(diffOp.value);
            break;
            case "move":
            tmp = phelper.get(target, diffOp.from);
            removeProcedure(diffOp.from);
            addProcedure(tmp);
            break;
            case "copy":
            tmp = getOrException(diffOp.from);
            addProcedure(JSON.parse(JSON.stringify(tmp)));
            break;
            case "test":
            tmp = getOrException(diffOp.path);
            if (!eq(tmp, diffOp.value)) {
                throw error(diffOp, target, `Test fails.`);
            }
            break;
            default:
            assertNever(diffOp);
        }
    });

    return target;
}

function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

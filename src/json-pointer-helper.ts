import plib from "jsonpointer";

const pointerHelper = {
    append(pointer: string, fragment: string): string {
        return `${pointer}/${this.escape(fragment)}`;
    },

    escape(fragment: string): string {
        return fragment.replace(/~/g, "~0").replace(/\//g, "~1");
    },

    unescape(framgent: string): string {
        return framgent.replace(/~1/g, "/").replace(/~0/g, "~");
    },

    decode(pointer: string): string[] {
        if (pointer === "") return [];
        else return pointer.split("/").map(framgent => this.unescape(framgent)).slice(1);
    },

    encode(fragments: string[]): string {
        if (fragments.length === 0) return "";
        else return "/" + fragments.map(fragment => this.escape(fragment)).join("/");
    },

    exists(obj: any, pointer: string): boolean {
        return !(plib.get(obj, pointer) === undefined);
    },

    set(obj: any, pointer: string, value: any): boolean {
        if (!this.exists(obj, pointer)) return false;
        plib.set(obj, pointer, value);
        return true;
    },

    get: (obj: any, pointer: string) => plib.get(obj, pointer),

    add(obj: any, pointer: string, value: any): boolean {
        const fragments = this.decode(pointer);
        if (fragments.length === 0) throw new Error("Cannot set the root object.");
        const lastFramgent = fragments[fragments.length - 1];
        const prefixFragments = fragments.slice(0, fragments.length - 1);
        const prefixValue = plib.get(obj, this.encode(prefixFragments));
        if (prefixValue === undefined) return false;
        if (typeof prefixValue === "object" && prefixValue !== null) {
            if (Array.isArray(prefixValue)) {
                const index = Number(lastFramgent);
                if (lastFramgent === "-" || index === prefixValue.length) {
                    prefixValue.push(value);
                    return true;
                } else if (!Number.isNaN(index) && 0 <= index && index < prefixValue.length) {
                    prefixValue.splice(index, 0, value);
                    return true;
                } else return false;
            } else {
                prefixValue[lastFramgent] = value;
                return true;
            }
        }
        return false;
    },

    remove(obj: any, pointer: string): boolean {
        const fragments = this.decode(pointer);
        if (fragments.length === 0) throw new Error("Cannot set the root object.");
        const lastFramgent = fragments[fragments.length - 1];
        const prefixFragments = fragments.slice(0, fragments.length - 1);
        const prefixValue = plib.get(obj, this.encode(prefixFragments));
        if (prefixValue === undefined) return false;
        if (typeof prefixValue === "object" && prefixValue !== null) {
            if (Array.isArray(prefixValue)) {
                const index = Number(lastFramgent);
                if (!Number.isNaN(index) && 0 <= index && index < prefixValue.length) {
                    prefixValue.splice(index, 1);
                    return true;
                } else return false;
            } else {
                if (lastFramgent in prefixValue) {
                    delete prefixValue[lastFramgent];
                    return true;
                } else return false;
            }
        }
        return false;
    }
}

export default pointerHelper;

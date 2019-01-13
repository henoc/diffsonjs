export function pointerAdd(pointer: string, fragment: string) {
    return `${pointer}/${pointerEscape(fragment)}`;
}

export function pointerEscape(fragment: string) {
    return fragment.replace("~", "~0").replace("/", "~1");
}

export function pointerUnescape(framgent: string) {
    return framgent.replace("~1", "/").replace("~0", "~");
}

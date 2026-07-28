class Utils {

    static getValue(object, path) {

        if (!object || !path)
            return "";

        return path
            .split(".")
            .reduce((obj, key) => obj?.[key], object);

    }

    static setNativeValue(element, value) {

        if (!element)
            return;

        const prototype =
            element instanceof HTMLTextAreaElement
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;

        const setter =
            Object.getOwnPropertyDescriptor(
                prototype,
                "value"
            )?.set;

        setter?.call(element, value);

        element.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

        element.dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );

    }

    static fillCurrentInput(value) {

        const element = document.activeElement;

        if (
            !element ||
            (
                element.tagName !== "INPUT" &&
                element.tagName !== "TEXTAREA"
            )
        )
            return false;

        this.setNativeValue(element, value);

        return true;

    }

    static sleep(ms) {

        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );

    }

    static triggerEnter(element) {

        element.dispatchEvent(

            new KeyboardEvent("keydown", {

                key: "Enter",
                code: "Enter",
                keyCode: 13,
                which: 13,
                bubbles: true

            })

        );

    }

    static flattenObject(obj, prefix = "", result = {}) {

        if (obj === null || obj === undefined)
            return result;

        if (Array.isArray(obj)) {

            obj.forEach((item, index) => {

                const key = prefix
                    ? `${prefix}.${index}`
                    : `${index}`;

                if (typeof item === "object" && item !== null) {

                    this.flattenObject(
                        item,
                        key,
                        result
                    );

                } else {

                    result[key] = item;

                }

            });

            return result;

        }

        for (const key in obj) {

            const value = obj[key];

            const current = prefix
                ? `${prefix}.${key}`
                : key;

            if (typeof value === "object" && value !== null) {

                this.flattenObject(
                    value,
                    current,
                    result
                );

            } else {

                result[current] = value;

            }

        }

        return result;

    }
    static copy(text) {

        navigator.clipboard.writeText(text);

    }

    static isFileInput(element) {

        return (
            element &&
            element.tagName === "INPUT" &&
            element.type === "file"
        );

    }

    static create(tag, className = "") {

        const element =
            document.createElement(tag);

        if (className)
            element.className = className;

        return element;

    }

    static debounce(callback, delay = 300) {

        let timer;

        return (...args) => {

            clearTimeout(timer);

            timer = setTimeout(() => {

                callback(...args);

            }, delay);

        };

    }

}
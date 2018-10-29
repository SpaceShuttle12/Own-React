//1. Create element stub
//2. create element simple implementation.
//3. create element with handle of false and true.
const TinyReact = (function () {
    function createElement(type, attributes = {}, ...children) {
        const childElements = [].concat(...children).map(
            child => {
                if (child != null && child !== true && child !== false) {
                    return child instanceof Object
                        ? child
                        : createElement("text", {
                            textContent: child
                        })
                }

            }

        );
        return {
            type,
            children: childElements,
            props: Object.assign({
                children: childElements
            }, attributes)
        }
    }
    return {
        createElement
    }
}())
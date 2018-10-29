//1. Create element stub
//2. create element simple implementation.
const TinyReact = (function () {
    function createElement(type, attributes = {}, ...children) {
        const childElements = [].concat(...children).map(
            child =>
                child instanceof Object
                    ? child
                    : createElement("text", {
                        textContent: child
                    })
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
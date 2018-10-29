//1. Create element stub
//2. create element simple implementation.
//3. create element with handle of false and true.
//4. create element removal of undefined nodes. 
const TinyReact = (function () {
    function createElement(type, attributes = {}, ...children) {

        const childElements = [].concat(...children).reduce(
            (acc, child) => {
                if (child != null && child !== true && child !== false) {
                    if (child instanceof Object) {
                        acc.push(child)
                    }
                    else {
                        acc.push(createElement("text", {
                            textContent: child
                        }))
                    }
                    // return child instanceof Object
                    //     ? child
                    //     : createElement("text", {
                    //         textContent: child
                    //     })
                }
                return acc;
            }, []
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
        createElement,

    }
}())
//1. Create element stub
//2. create element simple implementation.
//3. create element with handle of false and true.
//4. create element removal of undefined nodes. 
//5. render element on the document.
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
    const render = function (vDom, container, oldDom = container.firstChild) {
        if (!oldDom) {
            mountElement(vDom, container, oldDom);
        }
    }
    const mountElement = function (vDom, container, oldDom) {
        //Native Dom elements as well as function
        return mountSimpleNode(vDom, container, oldDom)
    }
    const mountSimpleNode = function (vDom, container, oldDomElement, parentComponent) {
        let newDomElement = null;
        const nextSibling = oldDomElement && oldDomElement.nextSibling;
        if (vDom.type === "text") {
            newDomElement = document.createTextNode(vDom.props.textContent);
        } else {
            newDomElement = document.createElement(vDom.type);
        }

        //setting reference to vDom to dom
        newDomElement._virtualElement = vDom;
        if (nextSibling) {
            container.insertBefore(newDomElement, nextSibling);
        } else {
            container.appendChild(newDomElement);
        }
        //TODO:Render children
        vDom.children.forEach(child => {
            mountElement(child, newDomElement);
        });
    }

    return {
        createElement,
        render
    }
}())
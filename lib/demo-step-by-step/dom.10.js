//1. Create element stub
//2. create element simple implementation.
//3. create element with handle of false and true.
//4. create element removal of undefined nodes. 
//5. render element on the document.
//6. set dom attributes and events.
//7. renderig two doms
//8.
//9. Rendering the functional component.
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
        diff(vDom, container, oldDom);
    }

    const diff = function (vDom, container, oldDom = container.firstChild) {
        let oldVDom = oldDom && oldDom._virtualElement;
        if (!oldDom) {
            mountElement(vDom, container, oldDom);
        }
        else if (typeof vDom.type === "function") {
            diffComponent(vDom, null, container, oldDom);
        }
        else if (oldVDom && oldVDom.type === vDom.type) {
            if (oldVDom.type === "text") {
                updateTextNode(oldDom, vDom, oldVDom);
            } else {

                updateDomElement(oldDom, vDom, oldVDom);
            }
            //Set a refrence to updated vDom
            oldDom._virtualElement = vDom;

            //recursively diff children
            //doing an index by index diffing (because we don't have keys yet )
            vDom.children.forEach((child, i) => {
                diff(child, oldDom, oldDom.childNodes[i])
            });

            //Remove all old nodes.
            let oldNodes = oldDom.childNodes;
            if (oldNodes.length > vDom.children.length) {
                for (let index = oldNodes.length - 1; index >= vDom.children.length; index -= 1) {
                    let nodeToBeRemoved = oldNodes[index];
                    unMountNode(nodeToBeRemoved, oldDom);
                }
            }
        }
    }

    function unMountNode(domElement, parentComponent) {
        domElement.remove();
    }

    function updateTextNode(domElement, newVirtualElement, oldVirtualElement) {
        if (newVirtualElement.props.textContent !== oldVirtualElement.props.textContent) {
            domElement.textContent = newVirtualElement.props.textContent;
        }
        //Set a reference to the new dom in oldDom
        domElement._virtualElement = newVirtualElement;
    }


    function diffComponent(newVirtualElement, oldComponent, container, domElement) {
        if (!oldComponent) {
            (newVirtualElement, container, domElement);
        }
    }


    const mountElement = function (vDom, container, oldDom) {
        //Native Dom elements as well as function
        //return mountSimpleNode(vDom, container, oldDom)
        if (isFunction(vDom)) {
            return mountComponent(vDom, container, oldDom);
        } else {
            return mountSimpleNode(vDom, container, oldDom);
        }

    }
    //This is a helper function to check whether the new Dom Element is function
    function isFunction(obj) {
        return obj && 'function' === typeof obj.type;
    }
    //This is a helper function to check whether 
    //the new Dom Element is functional component or a stateful component
    function isFunctionComponent(vNode) {
        let nodeType = vNode && vNode.type;
        return nodeType && isFunction(vNode)
            && !(nodeType.prototype && nodeType.prototype.render);
    }
    function buildFunctionalComponent(vNode, context) {
        return vNode.type(vNode.props || {});
    }
    function mountComponent(vDom, container, oldDomElement) {
        let nextVDom = null; let component = null; let newDomElement = null;
        if (isFunctionComponent(vDom)) {
            nextVDom = buildFunctionalComponent(vDom);
        }
        //recursively render child components
        if (isFunction(nextVDom)) {
            return mountComponent(nextVDom, container, oldDomElement);
        }
        else {
            newDomElement = mountElement(nextVDom, container, oldDomElement);
        }
        return newDomElement;
    }

    const mountSimpleNode = function (vDom, container, oldDomElement, parentComponent) {
        let newDomElement = null;
        const nextSibling = oldDomElement && oldDomElement.nextSibling;
        if (vDom.type === "text") {
            newDomElement = document.createTextNode(vDom.props.textContent);
        } else {
            newDomElement = document.createElement(vDom.type);
            updateDomElement(newDomElement, vDom);
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
    //TODO: Set DOM attributes and events
    function updateDomElement(domElement, newVirtualElement, oldVirtualElement = {}) {
        const newProps = newVirtualElement.props || {};
        const oldProps = oldVirtualElement.props || {};
        Object.keys(newProps).forEach(propName => {
            const newProp = newProps[propName];
            const oldProp = oldProps[propName];
            if (newProp !== oldProp) {
                if (propName.slice(0, 2) === "on") {
                    // prop is an event hadller
                    const eventName = propName.toLowerCase().slice(2);
                    domElement.addEventListener(eventName, newProp, false);
                    if (oldProp) {
                        domElement.removeEventListener(eventName, oldProp, false);
                    }
                    else if (propName === "value" || propName === "checked") {
                        // these are special attributes that cannot be set
                        // using setAttribute
                        domElement[propName] = newProp;
                    } else if (propName !== "children") {
                        // ignore the 'children' prop
                        if (propName === "className") {
                            domElement.setAttribute("class", newProps[propName]);
                        } else {
                            domElement.setAttribute(propName, newProps[propName])
                        }
                    }
                }
            }
        });
        // remove old Props
        Object.keys(oldProps).forEach(propName => {
            const newProp = newProps[propName];
            const oldProp = oldProps[propName];
            if (!newProp) {
                if (propName.slice(0, 2) === "on") {
                    // prop is an event handler
                    domElement.removeEventListener(propName, oldProp, false);
                } else if (propName !== "children") {
                    // ignore the 'children' prop
                    domElement.removeAttribute(propName);
                }

            }
        });
    }

    return {
        createElement,
        render
    }
}())
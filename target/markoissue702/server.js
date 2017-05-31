module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/home/arthur/Downloads/markoissue702/target/markoissue702/public";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 209);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Container = __webpack_require__(9);
var ArrayContainer = __webpack_require__(88);
var ok = __webpack_require__(1).ok;
var extend = __webpack_require__(5);
var inspect = __webpack_require__(36).inspect;
var EventEmitter = __webpack_require__(67).EventEmitter;

function trim(textNode) {
    if (textNode.preserveWhitespace === true) {
        return;
    }

    var text = textNode.argument.value;
    var isFirst = textNode.isFirst;
    var isLast = textNode.isLast;

    if (isFirst) {
        //First child
        text = text.replace(/^\r?\n\s*/g, '');
    }
    if (isLast) {
        //Last child
        text = text.replace(/\r?\n\s*$/g, '');
    }
    if (/^\r?\n\s*$/.test(text)) {
        //Whitespace between elements
        text = '';
    }
    text = text.replace(/\s+/g, ' ');
    textNode.argument.value = text;
}

class Node {
    constructor(type) {
        this.type = type;
        this.statement = false;
        this.container = null;
        this.pos = null; // The character index of the node in the original source file
        this.tagDef = null; // The tag definition associated with this Node
        this._codeGeneratorFuncs = null;
        this._flags = {};
        this._transformersApplied = {};
        this._preserveWhitespace = null;
        this._events = null;
        this._childTextNormalized = undefined;
        this.data = {};
        this._finalNode = false;
        this._trimStartEnd = false;
    }

    on(event, listener) {
        if (!this._events) {
            this._events = new EventEmitter();
        }

        this._events.on(event, listener);
    }

    emit(event, args) {
        if (this._events) {
            this._events.emit.apply(this._events, arguments);
        }
    }

    listenerCount(event) {
        if (this._events) {
            return this._events.listenerCount(event);
        } else {
            return 0;
        }
    }

    onBeforeGenerateCode(listener) {
        this.on('beforeGenerateCode', listener);
    }

    onAfterGenerateCode(listener) {
        this.on('afterGenerateCode', listener);
    }

    wrapWith(wrapperNode) {
        ok(this.container, 'Node does not belong to a container: ' + this);
        var replaced = this.container.replaceChild(wrapperNode, this);
        ok(replaced, 'Invalid state. Child does not belong to the container');
        wrapperNode.appendChild(this);
    }

    replaceWith(newNode) {
        ok(this.container, 'Node does not belong to a container: ' + this);
        var replaced = this.container.replaceChild(newNode, this);
        ok(replaced, 'Invalid state. Child does not belong to the container');
    }

    insertSiblingBefore(newNode) {
        ok(this.container, 'Node does not belong to a container: ' + this);
        this.container.insertChildBefore(newNode, this);
    }

    insertSiblingAfter(newNode) {
        ok(this.container, 'Node does not belong to a container: ' + this);
        this.container.insertChildAfter(newNode, this);
    }

    /**
     * Converts the provided `array` into a `ArrayContainer`. If the provided `array` is already an instance of a `Container` then it is simply returned.
     * @param  {[type]} array [description]
     * @return {[type]}       [description]
     */
    makeContainer(array) {
        if (array instanceof Container) {
            return array;
        }

        return new ArrayContainer(this, array);
    }

    prependChild(node) {
        ok(this.body, 'Node does not support child nodes: ' + this);
        this.body.prependChild(node);
    }

    appendChild(node) {
        ok(this.body, 'Node does not support child nodes: ' + this);
        this.body.appendChild(node);
    }

    insertBefore(newNode, referenceNode) {
        ok(this.body, 'Node does not support child nodes: ' + this);
        this.body.insertBefore(newNode, referenceNode);
    }

    forEachChild(callback, thisObj) {
        if (this.body) {
            this.body.forEach(callback, thisObj);
        }
    }

    moveChildrenTo(targetNode) {
        ok(this.body, 'Node does not support child nodes: ' + this);
        ok(this !== targetNode, 'Target node cannot be the same as the source node');

        this.body.moveChildrenTo(targetNode);
    }

    removeChildren() {
        this.body.removeChildren();
    }

    forEachNextSibling(callback, thisObj) {
        var container = this.container;

        if (container) {
            container.forEachNextSibling(this, callback, thisObj);
        }
    }

    get firstChild() {
        var body = this.body;
        return body && body.firstChild;
    }

    get previousSibling() {
        var container = this.container;

        if (container) {
            return container.getPreviousSibling(this);
        }
    }

    get nextSibling() {
        var container = this.container;

        if (container) {
            return container.getNextSibling(this);
        }
    }

    isTransformerApplied(transformer) {
        return this._transformersApplied[transformer.id] === true;
    }

    setTransformerApplied(transformer) {
        this._transformersApplied[transformer.id] = true;
    }

    toString() {
        return inspect(this);
    }

    toJSON() {
        let result = extend({}, this);
        delete result.container;
        delete result.statement;
        delete result.pos;
        delete result._transformersApplied;
        delete result._codeGeneratorFuncs;
        delete result._flags;
        delete result.data;
        delete result.tagDef;
        delete result._preserveWhitespace;
        delete result._events;
        delete result._finalNode;
        delete result._trimStartEnd;
        delete result._childTextNormalized;
        return result;
    }

    detach() {
        if (this.container) {
            this.container.removeChild(this);
            this.container = null;
        }
    }

    /**
     * Returns true if the current node represents a compound expression (e.g. )
     * @return {Boolean} [description]
     */
    isCompoundExpression() {
        return false;
    }

    isDetached() {
        return this.container == null;
    }

    /**
     * Used by the Node.js require('util').inspect function.
     * We default to inspecting on the simplified version
     * of this node that is the same version we use when
     * serializing to JSON.
     */
    inspect(depth, opts) {
        // We inspect in the simplified version of this object t
        return this.toJSON();
    }

    setType(newType) {
        this.type = newType;
    }

    setCodeGenerator(mode, codeGeneratorFunc) {
        if (arguments.length === 1) {
            codeGeneratorFunc = arguments[0];
            mode = null;
        }

        if (!this._codeGeneratorFuncs) {
            this._codeGeneratorFuncs = {};
        }
        this._codeGeneratorFuncs[mode || 'DEFAULT'] = codeGeneratorFunc;
    }

    getCodeGenerator(mode) {
        if (this._codeGeneratorFuncs) {
            return this._codeGeneratorFuncs[mode] || this._codeGeneratorFuncs.DEFAULT;
        } else {
            return undefined;
        }
    }

    setFlag(name) {
        this._flags[name] = true;
    }

    clearFlag(name) {
        delete this._flags[name];
    }

    isFlagSet(name) {
        return this._flags.hasOwnProperty(name);
    }

    get bodyText() {
        var bodyText = '';

        this.forEachChild((child) => {
            if (child.type === 'Text') {
                var childText = child.argument;
                if (childText && childText.type === 'Literal') {
                    bodyText += childText.value;
                }
            }
        });

        return bodyText;
    }

    get parentNode() {
        return this.container && this.container.node;
    }

    setPreserveWhitespace(isPreserved) {
        this._preserveWhitespace = isPreserved;
    }

    isPreserveWhitespace() {
        var preserveWhitespace = this._preserveWhitespace;
        if (preserveWhitespace == null) {
            preserveWhitespace = this.tagDef && this.tagDef.preserveWhitespace;
        }

        return preserveWhitespace === true;
    }

    setFinalNode(isFinal) {
        this._finalNode = true;
    }

    setTrimStartEnd(trimStartEnd) {
        this._trimStartEnd = trimStartEnd;
    }

    _normalizeChildTextNodes(context, forceTrim) {
        if (this._childTextNormalized) {
            return;
        }

        this._childTextNormalized = true;

        var trimStartEnd = this._trimStartEnd === true;

        var isPreserveWhitespace = false;

        if (!forceTrim) {
            if (context.isPreserveWhitespace() || this.preserveWhitespace === true || this.isPreserveWhitespace()) {
                isPreserveWhitespace = true;
            }
        }


        if (isPreserveWhitespace && trimStartEnd !== true) {
            return;
        }

        var body = this.body;
        if (!body) {
            return;
        }

        var isFirst = true;

        var currentTextLiteral = null;
        var literalTextNodes = [];

        body.forEach((curChild, i) => {
            if (curChild.noOutput) {
                // Skip over AST nodes that produce no HTML output
                return;
            }

            if (curChild.type === 'Text' && curChild.isLiteral()) {
                curChild.isFirst  = null;
                curChild.isLast  = null;

                if (currentTextLiteral &&
                        currentTextLiteral.preserveWhitespace === curChild.preserveWhitespace &&
                        currentTextLiteral.escape === curChild.escape) {
                    currentTextLiteral.argument.value += curChild.argument.value;
                    curChild.detach();
                } else {
                    currentTextLiteral = curChild;
                    literalTextNodes.push(currentTextLiteral);
                    if (isFirst) {
                        currentTextLiteral.isFirst = true;
                    }
                }
            } else {
                currentTextLiteral = null;
            }

            isFirst = false;
        });

        if (currentTextLiteral) {
            // Last child text
            currentTextLiteral.isLast = true;
        }

        if (trimStartEnd) {
            if (literalTextNodes.length) {
                // We will only trim the first and last nodes
                var firstTextNode = literalTextNodes[0];
                var lastTextNode = literalTextNodes[literalTextNodes.length - 1];

                if (firstTextNode.isFirst) {
                    firstTextNode.argument.value = firstTextNode.argument.value.replace(/^\s*/, '');
                }

                if (lastTextNode.isLast) {
                    lastTextNode.argument.value = lastTextNode.argument.value.replace(/\s*$/, '');
                }
            }
        }

        if (!isPreserveWhitespace) {
            literalTextNodes.forEach(trim);
        }

        literalTextNodes.forEach((textNode) => {
            if (textNode.argument.value === '') {
                textNode.detach();
            }
        });
    }

    get childCount() {
        ok(this.body, 'Node does not support child nodes: ' + this);
        return this.body.length;
    }
}

module.exports = Node;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("assert");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var isArray = Array.isArray;
const isValidJavaScriptVarName = __webpack_require__(27);

function walkValue(value, walker) {
    if (!value) {
        return value;
    } else if (value instanceof Node) {
        return walker.walk(value);
    } else if (isArray(value)) {
        let array = value;
        for (let i=0; i<array.length; i++) {
            let el = array[i];
            array[i] = walkValue(el, walker);
        }
        return array;
    } else if (typeof value === 'object') {
        let object = value;

        let keys = Object.keys(object);
        for (let i=0; i<keys.length; i++) {
            let key = keys[i];
            let oldValue = object[key];
            let newValue = walkValue(oldValue, walker);
            if (newValue !== oldValue) {
                object[key] = newValue;
            }
        }

        return object;
    } else {
        return value;
    }
}

class Literal extends Node {
    constructor(def) {
        super('Literal');
        this.value = def.value;
    }

    generateCode(codegen) {
        if (this.value != null) {
            if (isArray(this.value)) {
                for (var i=0; i<this.value.length; i++) {
                    this.value[i] = codegen.generateCode(this.value[i]);
                }
            } else if (typeof this.value === 'object') {
                if (!(this.value instanceof RegExp)) {
                    var newObject = {};
                    for (var k in this.value) {
                        if (this.value.hasOwnProperty(k)) {
                            newObject[k] = codegen.generateCode(this.value[k]);
                        }
                    }
                    this.value = newObject;
                }
            }
        }
        return this;
    }

    writeCode(writer) {
        var value = this.value;
        writer.writeLiteral(value);
    }

    toString() {
        var value = this.value;
        if (value === null) {
            return 'null';
        } else if (value === undefined) {
            return 'undefined';
        } else if (typeof value === 'string') {
            return JSON.stringify(value);
        } else if (value === true) {
            return 'true';
        } else if (value === false) {
            return 'false';
        }  else if (isArray(value)) {
            return '[' + value.join(', ') + ']';
        } else if (typeof value === 'number') {
            return value.toString();
        } else if (value instanceof RegExp) {
            return value.toString();
        } else if (typeof value === 'object') {
            let keys = Object.keys(value);
            if (keys.length === 0) {
                return '{}';
            }

            var result = '{ ';

            for (let i=0; i<keys.length; i++) {
                let k = keys[i];
                let v = value[k];

                if (i !== 0) {
                    result += ', ';
                }

                if (isValidJavaScriptVarName(k)) {
                    result += k + ': ';
                } else {
                    result += JSON.stringify(k) + ': ';
                }

                result += v;
            }

            return result + ' }';
        }
    }

    walk(walker) {
        walkValue(this.value, walker);
    }
}

module.exports = Literal;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports.Taglib = __webpack_require__(147);
exports.Tag = __webpack_require__(146);
exports.Attribute = __webpack_require__(142);
exports.Property = __webpack_require__(145);
exports.NestedVariable = __webpack_require__(144);
exports.ImportedVariable = __webpack_require__(143);
exports.Transformer = __webpack_require__(148);

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function extend(target, source) { //A simple function to copy properties from one object to another
    if (!target) { //Check if a target was provided, otherwise create a new empty object to return
        target = {};
    }

    if (source) {
        for (var propName in source) {
            if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                target[propName] = source[propName]; //Copy the property
            }
        }
    }

    return target;
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var types = __webpack_require__(4);

function isSupportedAttributeProperty(propertyName) {
    return exports.loadAttributeFromProps.isSupportedProperty(propertyName);
}

function isSupportedTagProperty(propertyName) {
    return exports.loadTagFromProps.isSupportedProperty(propertyName);
}

function createTaglib(taglibPath) {
    return new types.Taglib(taglibPath);
}

exports.createTaglib = createTaglib;
exports.loadAttributeFromProps = __webpack_require__(149);
exports.loadTagFromProps = __webpack_require__(152);
exports.loadTagFromFile = __webpack_require__(151);
exports.loadTaglibFromProps = __webpack_require__(154);
exports.loadTaglibFromFile = __webpack_require__(153);
exports.loadAttributes = __webpack_require__(150);
exports.isSupportedAttributeProperty = isSupportedAttributeProperty;
exports.isSupportedTagProperty = isSupportedTagProperty;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

function isCompoundExpression(expression) {
    if (typeof expression === 'string') {
        // TBD: Should we use Esprima to parse the expression string to see if it is a compount expression?
        return true;
    }

    return expression.isCompoundExpression();
}

module.exports = isCompoundExpression;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Container {
    constructor(node) {
        this.node = node;
    }

    toJSON() {
        return this.items;
    }
}

module.exports = Container;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class Identifier extends Node {
    constructor(def) {
        super('Identifier');
        this.name = def ? def.name : undefined;
    }

    generateCode(codegen) {
        return this;
    }

    writeCode(writer) {
        var name = this.name;
        writer.write(name);
    }

    toString() {
        return this.name;
    }
}

module.exports = Identifier;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var require;var nativeRequire = require;
var resolveFrom = __webpack_require__(21);
var deresolve = __webpack_require__(159);

const deresolveOptions = {
    shouldRemoveExt(ext) {
        return ext === '.js' || ext === '.json' || ext === '.es6';
    }
};

// This allows us to swap out a different implementation in the browser...
// We only need this to make Try Online work :/
exports.require = function(path) {
    return !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
};

exports.resolve = function(path) {
    return /*require.resolve*/(!(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
};

exports.resolveFrom = function(from, target) {
    return resolveFrom(from, target);
};

exports.deresolve = function(targetFilename, from) {
    return deresolve(targetFilename, from, deresolveOptions);
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const VDOMOptimizer = __webpack_require__(168);
const isStaticValue = __webpack_require__(169);

const OPTIMIZER_ADDED_KEY = Symbol();

function registerOptimizer(context) {
    var data = context.data;
    if (!data[OPTIMIZER_ADDED_KEY]) {
        data[OPTIMIZER_ADDED_KEY] = true;

        context.addOptimizer(new VDOMOptimizer());
    }
}

exports.registerOptimizer = registerOptimizer;
exports.isStaticValue = isStaticValue;
exports.registerOptimizer = registerOptimizer;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = function(message, cause) {
    var error;
    var argsLen = arguments.length;
    var E = Error;
    
    if (argsLen == 2) {
        error = message instanceof E ? message : new E(message);
        if (error.stack) {
            error.stack += '\nCaused by: ' + (cause.stack || cause);
        } else {
            error._cause = cause;    
        }
    } else if (argsLen == 1) {
        error = message instanceof E ? message : new E(message);
    }
    
    return error;
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Compiler = __webpack_require__(84);
var Walker = __webpack_require__(40);
var Parser = __webpack_require__(87);
var HtmlJsParser = __webpack_require__(85);
var Builder = __webpack_require__(81);
var extend = __webpack_require__(5);
var CompileContext = __webpack_require__(39);
var globalConfig = __webpack_require__(140);
var CompileContext = __webpack_require__(39);
var InlineCompiler = __webpack_require__(86);
var ok = __webpack_require__(1).ok;
var fs = __webpack_require__(8);
var taglibLoader = __webpack_require__(15);

var defaults = extend({}, globalConfig);

Object.defineProperty(exports, 'defaultOptions', {
    get: function() { return globalConfig;  },
    enumerable: true,
    configurable: false
});

Object.defineProperty(exports, 'config', {
    get: function() { return globalConfig;  },
    enumerable: true,
    configurable: false
});

var defaultParser = new Parser(new HtmlJsParser());
var rawParser = new Parser(
    new HtmlJsParser({
        ignorePlaceholders: true
    }),
    {
        raw: true
    });

function configure(newConfig) {
    if (!newConfig) {
        newConfig = {};
    }

    extend(globalConfig, defaults);
    extend(globalConfig, newConfig);
}

var defaultCompiler = new Compiler({
    parser: defaultParser,
    builder: Builder.DEFAULT_BUILDER
});

function createBuilder(options) {
    return new Builder(options);
}

function createWalker(options) {
    return new Walker(options);
}

function _compile(src, filename, userOptions, callback) {
    ok(filename, '"filename" argument is required');
    ok(typeof filename === 'string', '"filename" argument should be a string');

    var options = {};

    extend(options, globalConfig);

    if (userOptions) {
        extend(options, userOptions);
    }

    var compiler = defaultCompiler;

    var context = new CompileContext(src, filename, compiler.builder, options);

    if (callback) {
        let compiled;

        try {
            compiled = compiler.compile(src, context);
        } catch(e) {
            return callback(e);
        }

        callback(null, userOptions.sourceOnly ? compiled.code : compiled);
    } else {
        let compiled = compiler.compile(src, context);
        return userOptions.sourceOnly ? compiled.code : compiled;
    }
}

function compile(src, filename, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = options || {};
    options.sourceOnly = options.sourceOnly !== false;

    return _compile(src, filename, options, callback);
}

function compileForBrowser(src, filename, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = extend({output: 'vdom', meta: false, browser: true, sourceOnly: false}, options);

    return compile(src, filename, options, callback);
}

function compileFile(filename, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = options || {};
    options.sourceOnly = options.sourceOnly !== false;

    if (callback) {
        fs.readFile(filename, {encoding: 'utf8'}, function(err, templateSrc) {
            if (err) {
                return callback(err);
            }

            _compile(templateSrc, filename, options, callback);
        });
    } else {
        let templateSrc = fs.readFileSync(filename, {encoding: 'utf8'});
        return _compile(templateSrc, filename, options, callback);
    }
}

function compileFileForBrowser(filename, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = extend({output: 'vdom', meta: false, browser: true, sourceOnly: false}, options);
    return compileFile(filename, options, callback);
}


function createInlineCompiler(filename, userOptions) {
    var options = {};

    extend(options, globalConfig);

    if (userOptions) {
        extend(options, userOptions);
    }

    var compiler = defaultCompiler;
    var context = new CompileContext('', filename, compiler.builder, options);
    return new InlineCompiler(context, compiler);
}

function checkUpToDate(templateFile, templateJsFile) {
    return false; // TODO Implement checkUpToDate
}

function getLastModified(path, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    callback(null, -1); // TODO Implement getLastModified
}

function clearCaches() {
    exports.taglibLookup.clearCache();
    exports.taglibFinder.clearCache();
    exports.taglibLoader.clearCache();
}

function parseRaw(templateSrc, filename) {
    var context = new CompileContext(templateSrc, filename, Builder.DEFAULT_BUILDER);
    var parsed = rawParser.parse(templateSrc, context);

    if (context.hasErrors()) {
        var errors = context.getErrors();

        var message = 'An error occurred while trying to compile template at path "' + filename + '". Error(s) in template:\n';
        for (var i = 0, len = errors.length; i < len; i++) {
            let error = errors[i];
            message += (i + 1) + ') ' + error.toString() + '\n';
        }
        var error = new Error(message);
        error.errors = errors;
        throw error;
    }

    return parsed;
}

exports.createBuilder = createBuilder;
exports.compileFile = compileFile;
exports.compile = compile;
exports.compileForBrowser = compileForBrowser;
exports.compileFileForBrowser = compileFileForBrowser;
exports.parseRaw = parseRaw;
exports.createInlineCompiler = createInlineCompiler;

exports.checkUpToDate = checkUpToDate;
exports.getLastModified = getLastModified;
exports.createWalker = createWalker;
exports.builder = Builder.DEFAULT_BUILDER;
exports.configure = configure;
exports.clearCaches = clearCaches;

var taglibLookup = __webpack_require__(48);
exports.taglibLookup = taglibLookup;
exports.taglibLoader = taglibLoader;
exports.taglibFinder = __webpack_require__(46);

function buildTaglibLookup(dirname) {
    return taglibLookup.buildLookup(dirname);
}

exports.buildTaglibLookup = buildTaglibLookup;

function registerTaglib(taglibProps, taglibPath) {
    var taglib = taglibLoader.createTaglib(taglibPath);
    taglibLoader.loadTaglibFromProps(taglib, taglibProps);
    taglibLookup.registerTaglib(taglib);
}

registerTaglib(__webpack_require__(63), /*require.resolve*/(63));
registerTaglib(__webpack_require__(65), /*require.resolve*/(65));
registerTaglib(__webpack_require__(64), /*require.resolve*/(64));
registerTaglib(__webpack_require__(66), /*require.resolve*/(66));
registerTaglib(__webpack_require__(61), /*require.resolve*/(61));
registerTaglib(__webpack_require__(62), /*require.resolve*/(62));
registerTaglib(__webpack_require__(54), /*require.resolve*/(54));

exports.registerTaglib = function(filePath) {
    ok(typeof filePath === 'string', '"filePath" shouldbe a string');
    var taglib = taglibLoader.loadTaglibFromFile(filePath);
    taglibLookup.registerTaglib(taglib);
    clearCaches();
};

exports.isVDOMSupported = true;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var cache = __webpack_require__(24);

var types = __webpack_require__(4);
var loaders = __webpack_require__(6);
var DependencyChain = __webpack_require__(23);

function loadTaglibFromProps(taglib, taglibProps) {
    return loaders.loadTaglibFromProps(taglib, taglibProps);
}

function loadTaglibFromFile(filePath) {
    return loaders.loadTaglibFromFile(filePath);
}

function clearCache() {
    cache.clear();
}

function createTaglib(filePath) {
    return new types.Taglib(filePath);
}

function loadTag(tagProps, filePath) {
    var tag = new types.Tag(filePath);
    loaders.loadTagFromProps(tag, tagProps, new DependencyChain(filePath ? [filePath] : []));
    return tag;
}

exports.clearCache = clearCache;
exports.createTaglib = createTaglib;
exports.loadTaglibFromProps = loadTaglibFromProps;
exports.loadTaglibFromFile = loadTaglibFromFile;
exports.loadTag = loadTag;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

function nextComponentIdProvider(out) {
    var prefix = out.global.componentIdPrefix || 's'; // "s" is for server (we use "b" for the browser)
    var nextId = 0;

    return function nextComponentId() {
        return prefix + (nextId++);
    };
}

function attachBubblingEvent(componentDef, handlerMethodName, extraArgs) {
    if (handlerMethodName) {
        if (extraArgs) {
            var component = componentDef.$__component;
            var eventIndex = component.$__bubblingDomEventsExtraArgsCount++;

            // If we are not going to be doing a rerender in the browser
            // then we need to actually store the extra args with the UI component
            // so that they will be serialized down to the browser.
            // If we are rerendering in the browser then we just need to
            // increment $__bubblingDomEventsExtraArgsCount to keep track of
            // where the extra args will be found when the UI component is
            // rerendered in the browser

            if (componentDef.$__willRerenderInBrowser === false) {
                if (eventIndex === 0) {
                    component.$__bubblingDomEvents = [extraArgs];
                } else {
                    component.$__bubblingDomEvents.push(extraArgs);
                }
            }

            return handlerMethodName + ' ' + componentDef.id + ' ' + eventIndex;

        } else {
            return handlerMethodName + ' ' + componentDef.id;
        }
    }
}

exports.$__nextComponentIdProvider = nextComponentIdProvider;
exports.$__isServer = true;
exports.$__attachBubblingEvent = attachBubblingEvent;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var extend = __webpack_require__(5);

var STYLE_ATTR = 'style';
var CLASS_ATTR = 'class';

var escape = __webpack_require__(33);
var escapeXml = escape.escapeXml;
var escapeXmlAttr = escape.escapeXmlAttr;
var attrHelper = __webpack_require__(58);
var attrsHelper = __webpack_require__(59);

var classList;






/**
 * Internal method to escape special XML characters
 * @private
 */
exports.x = escapeXml;
/**
 * Internal method to escape special XML characters within an attribute
 * @private
 */
exports.xa = escapeXmlAttr;

/**
 * Escapes the '</' sequence in the body of a <script> body to avoid the `<script>` being
 * ended prematurely.
 *
 * For example:
 * var evil = {
 * 	name:  '</script><script>alert(1)</script>'
 * };
 *
 * <script>var foo = ${JSON.stringify(evil)}</script>
 *
 * Without escaping the ending '</script>' sequence the opening <script> tag would be
 * prematurely ended and a new script tag could then be started that could then execute
 * arbitrary code.
 */
var escapeEndingScriptTagRegExp = /<\/script/g;
exports.xs = function escapeScriptHelper(val) {
    return (typeof val === 'string') ? val.replace(escapeEndingScriptTagRegExp, '\\u003C/script') : val;
};

/**
 * Escapes the '</' sequence in the body of a <style> body to avoid the `<style>` being
 * ended prematurely.
 *
 * For example:
 * var color = '</style><script>alert(1)</script>';
 *
 * <style>#foo { background-color:${color} }</style>
 *
 * Without escaping the ending '</style>' sequence the opening <style> tag would be
 * prematurely ended and a script tag could then be started that could then execute
 * arbitrary code.
 */
var escapeEndingStyleTagRegExp = /<\/style/g;
exports.xc = function escapeScriptHelper(val) {
    return (typeof val === 'string') ? val.replace(escapeEndingStyleTagRegExp, '\\003C/style') : val;
};

/**
 * Internal method to render a single HTML attribute
 * @private
 */
exports.a = attrHelper;

/**
 * Internal method to render multiple HTML attributes based on the properties of an object
 * @private
 */
exports.as = attrsHelper;

/**
 * Internal helper method to handle the "style" attribute. The value can either
 * be a string or an object with style propertes. For example:
 *
 * sa('color: red; font-weight: bold') ==> ' style="color: red; font-weight: bold"'
 * sa({color: 'red', 'font-weight': 'bold'}) ==> ' style="color: red; font-weight: bold"'
 */

var dashedNames = {};

exports.sa = function(style) {
    if (!style) {
        return '';
    }

    var type = typeof style;

    if (type === 'string') {
        return attrHelper(STYLE_ATTR, style, false);
    } else if (type === 'object') {
        var styles = '';
        for (var name in style) {
            var value = style[name];
            if (value != null) {
                if (typeof value === 'number' && value) {
                    value += 'px';
                }
                var nameDashed = dashedNames[name];
                if (!nameDashed) {
                    nameDashed = dashedNames[name] = name.replace(/([A-Z])/g, '-$1').toLowerCase();
                }
                styles += nameDashed + ':' + value + ';';
            }
        }
        return styles ? ' ' + STYLE_ATTR + '="' + styles +'"' : '';
    } else {
        return '';
    }
};

/**
 * Internal helper method to handle the "class" attribute. The value can either
 * be a string, an array or an object. For example:
 *
 * ca('foo bar') ==> ' class="foo bar"'
 * ca({foo: true, bar: false, baz: true}) ==> ' class="foo baz"'
 * ca(['foo', 'bar']) ==> ' class="foo bar"'
 */
exports.ca = function(classNames) {
    if (!classNames) {
        return '';
    }

    if (typeof classNames === 'string') {
        return attrHelper(CLASS_ATTR, classNames, false);
    } else {
        return attrHelper(CLASS_ATTR, classList(classNames), false);
    }
};


function classList(arg) {
    var len, name, value, str = '';

    if (arg) {
        if (typeof arg === 'string') {
            if (arg) {
                str += ' ' + arg;
            }
        } else if (typeof (len = arg.length) === 'number') {
            for (var i=0; i<len; i++) {
                value = classList(arg[i]);
                if (value) {
                    str += ' ' + value;
                }
            }
        } else if (typeof arg === 'object') {
            for (name in arg) {
                value = arg[name];
                if (value) {
                    str += ' ' + name;
                }
            }
        }
    }

    return (str && str.slice(1)) || null;
}

var commonHelpers = __webpack_require__(182);
extend(exports, commonHelpers);
exports.cl = classList;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 18;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

/**
 * Invokes a provided callback for each name/value pair
 * in a JavaScript object.
 *
 * <p>
 * <h2>Usage</h2>
 * <js>
 * raptor.forEachEntry(
 *     {
 *         firstName: "John",
 *         lastName: "Doe"
 *     },
 *     function(name, value) {
 *         console.log(name + '=' + value);
 *     },
 *     this);
 * )
 * // Output:
 * // firstName=John
 * // lastName=Doe
 * </js>
 * @param  {Object} o A JavaScript object that contains properties to iterate over
 * @param  {Function} fun The callback function for each property
 * @param  {Object} thisp The "this" object to use for the callback function
 * @return {void}
 */
module.exports = function(o, fun, thisp) {
    for (var k in o)
    {
        if (o.hasOwnProperty(k))
        {
            fun.call(thisp, k, o[k]);
        }
    }
};

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("property-handlers");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("resolve-from");

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var Literal = __webpack_require__(3);
var HtmlAttributeCollection = __webpack_require__(109);
var generateHTMLCode = __webpack_require__(113);
var generateVDOMCode = __webpack_require__(116);
var vdomUtil = __webpack_require__(12);

function beforeGenerateCode(event) {
    var tagName = event.node.tagName;
    var context = event.context;

    var tagDef = typeof tagName === 'string' ? context.getTagDef(tagName) : undefined;
    if (tagDef && tagDef.htmlType === 'svg') {
        context.pushFlag('SVG');
    }

    if (tagName === 'script') {
        context.pushFlag('SCRIPT_BODY');
    }
    if (tagName === 'style') {
        context.pushFlag('STYLE_BODY');
    }
}

function afterGenerateCode(event) {
    var tagName = event.node.tagName;
    var context = event.context;

    var tagDef = typeof tagName === 'string' ? context.getTagDef(tagName) : undefined;

    if (tagDef && tagDef.htmlType === 'svg') {
        context.popFlag('SVG');
    }

    if (tagName === 'script') {
        context.popFlag('SCRIPT_BODY');
    }
    if (tagName === 'style') {
        context.popFlag('STYLE_BODY');
    }
}

class HtmlElement extends Node {
    constructor(def) {
        super('HtmlElement');
        this.tagName = null;
        this.tagNameExpression = null;
        this.setTagName(def.tagName);
        this.tagString = def.tagString;
        this._attributes = def.attributes;
        this._properties = def.properties;
        this.body = this.makeContainer(def.body);
        this.argument = def.argument;

        if (!(this._attributes instanceof HtmlAttributeCollection)) {
            this._attributes = new HtmlAttributeCollection(this._attributes);
        }

        this.openTagOnly = def.openTagOnly;
        this.selfClosed = def.selfClosed;
        this.dynamicAttributes = undefined;
        this.bodyOnlyIf = undefined;

        this.on('beforeGenerateCode', beforeGenerateCode);
        this.on('afterGenerateCode', afterGenerateCode);
    }

    generateHTMLCode(codegen) {
        if (codegen.context.isMacro(this.tagName)) {
            // At code generation time, if node tag corresponds to a registered macro
            // then invoke the macro based on node HTML element instead of generating
            // the code to render an HTML element.
            return codegen.builder.invokeMacroFromEl(this);
        }

        return generateHTMLCode(this, codegen);
    }

    generateVDOMCode(codegen) {
        if (codegen.context.isMacro(this.tagName)) {
            // At code generation time, if node tag corresponds to a registered macro
            // then invoke the macro based on node HTML element instead of generating
            // the code to render an HTML element.
            return codegen.builder.invokeMacroFromEl(this);
        }

        return generateVDOMCode(this, codegen, vdomUtil);
    }

    addDynamicAttributes(expression) {
        if (!this.dynamicAttributes) {
            this.dynamicAttributes = [];
        }

        this.dynamicAttributes.push(expression);
    }

    getAttribute(name) {
        return this._attributes != null && this._attributes.getAttribute(name);
    }

    getAttributeValue(name) {
        var attr = this._attributes != null && this._attributes.getAttribute(name);
        if (attr) {
            return attr.value;
        }
    }

    addAttribute(attr) {
        this._attributes.addAttribute(attr);
    }

    setAttributeValues(attrs) {
        if (!attrs) {
            return;
        }

        for(var attrName in attrs) {
            var attrValue = attrs[attrName];
            this.setAttributeValue(attrName, attrValue);
        }
    }

    setAttributeValue(name, value, escape) {
        this._attributes.setAttributeValue(name, value, escape);
    }

    setPropertyValue(name, value) {
        if (!this._properties) {
            this._properties = {};
        }
        this._properties[name] = value;
    }

    getProperties() {
        return this._properties;
    }

    replaceAttributes(newAttributes) {
        this._attributes.replaceAttributes(newAttributes);
    }

    removeAttribute(name) {
        if (this._attributes) {
            this._attributes.removeAttribute(name);
        }
    }

    removeAllAttributes() {
        this._attributes.removeAllAttributes();
    }

    hasAttribute(name) {
        return this._attributes != null && this._attributes.hasAttribute(name);
    }

    getAttributes() {
        return this._attributes.all;
    }

    get attributes() {
        return this._attributes.all;
    }

    forEachAttribute(callback, thisObj) {
        var attributes = this._attributes.all.concat([]);

        for (let i=0, len=attributes.length; i<len; i++) {
            callback.call(thisObj, attributes[i]);
        }
    }

    setTagName(tagName) {
        this.tagName = null;
        this.tagNameExpression = null;

        if (tagName instanceof Node) {
            if (tagName instanceof Literal) {
                this.tagName = tagName.value;
                this.tagNameExpression = tagName;
            } else {
                this.tagNameExpression = tagName;
            }
        } else if (typeof tagName === 'string') {
            this.tagNameExpression = new Literal({value: tagName});
            this.tagName = tagName;
        }
    }

    isLiteralTagName() {
        return this.tagName != null;
    }

    toJSON() {
        return {
            type: this.type,
            tagName: this.tagName,
            attributes: this._attributes,
            tagString: this.tagString,
            argument: this.argument,
            body: this.body,
            bodyOnlyIf: this.bodyOnlyIf,
            dynamicAttributes: this.dynamicAttributes
        };
    }

    setBodyOnlyIf(condition) {
        this.bodyOnlyIf = condition;
    }

    walk(walker) {
        this.setTagName(walker.walk(this.tagNameExpression));
        this._attributes.walk(walker);
        this.body = walker.walk(this.body);
    }
}

module.exports = HtmlElement;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class DependencyChain {
    constructor(array) {
        this.array = array || [];
    }

    append(str) {
        return new DependencyChain(this.array.concat(str));
    }

    toString() {
        return '[' + this.array.join(' → ') + ']';
    }
}

module.exports = DependencyChain;

/***/ }),
/* 24 */
/***/ (function(module, exports) {

var cache = {};

function get(key) {
    return cache[key];
}

function put(key, value) {
    cache[key] = value;
}

function clear() {
    cache = {};
}

exports.get = get;
exports.put = put;
exports.clear = clear;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(8);
var stripJsonComments = __webpack_require__(35);
var fsReadOptions = { encoding: 'utf8' };

exports.readFileSync = function (path) {
    var json = fs.readFileSync(path, fsReadOptions);

    try {
        var taglibProps = JSON.parse(stripJsonComments(json));
        return taglibProps;
    } catch(e) {
        throw new Error('Unable to parse JSON file at path "' + path + '". Error: ' + e);
    }
};


/***/ }),
/* 26 */
/***/ (function(module, exports) {

var idRegExp = /^[$A-Z_][0-9A-Z_$]*$/i;

module.exports = function isValidJavaScriptIdentifier(varName) {
    return idRegExp.test(varName);
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var reservedWords = __webpack_require__(50);
var varNameRegExp = /^[$A-Z_][0-9A-Z_$]*$/i;

module.exports = function isValidJavaScriptVarName(varName) {
    if (reservedWords[varName]) {
        return false;
    }

    return varNameRegExp.test(varName);
};


/***/ }),
/* 28 */
/***/ (function(module, exports) {

function safeVarName(varName) {
    var parts = varName.split(/[\\/]/);
    if (parts.length >= 2) {
        // The varname looks like it was based on a path.
        // Let's just use the last two parts
        varName = parts.slice(-2).join('_');
    }

    return varName.replace(/[^A-Za-z0-9_]/g, '_').replace(/^[0-9]+/, function(match) {
        var str = '';
        for (var i=0; i<match.length; i++) {
            str += '_';
        }
        return str;
    });
}

module.exports = safeVarName;

/***/ }),
/* 29 */
/***/ (function(module, exports) {

var actualCreateOut;

function setCreateOut(createOutFunc) {
    actualCreateOut = createOutFunc;
}

function createOut(globalData) {
    return actualCreateOut(globalData);
}

createOut.$__setCreateOut = setCreateOut;

module.exports = createOut;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(189);
__webpack_require__(179);

if (!process.env.BUNDLE) {
    if (process.env.MARKO_HOT_RELOAD) {
        __webpack_require__(55).enable();
    }

    // If process was launched with browser refresh then automatically
    // enable browser-refresh
    __webpack_require__(80).enable();
}

function fixFlush() {
    try {
        var OutgoingMessage = __webpack_require__(69).OutgoingMessage;
        if (OutgoingMessage.prototype.flush && OutgoingMessage.prototype.flush.toString().indexOf('deprecated') !== -1) {
            // Yes, we are monkey-patching http. This method should never have been added and it was introduced on
            // the iojs fork. It was quickly deprecated and I'm 99% sure no one is actually using it.
            // See:
            // - https://github.com/marko-js/async-writer/issues/3
            // - https://github.com/nodejs/node/issues/2920
            //
            // This method causes problems since marko looks for the flush method and calls it found.
            // The `res.flush()` method is introduced by the [compression](https://www.npmjs.com/package/compression)
            // middleware, but, otherwise, it should typically not exist.
            delete __webpack_require__(69).OutgoingMessage.prototype.flush;
        }
    } catch(e) {}
}

fixFlush();

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var EventEmitter = __webpack_require__(68);
var StringWriter = __webpack_require__(184);
var BufferedWriter = __webpack_require__(183);
var defaultDocument = typeof document != 'undefined' && document;
var RenderResult = __webpack_require__(177);
var attrsHelper = __webpack_require__(59);
var escapeXml = __webpack_require__(33).escapeXml;

var voidWriter = { write:function(){} };

function State(root, stream, writer, events) {
    this.root = root;
    this.stream = stream;
    this.writer = writer;
    this.events = events;

    this.remaining = 0;
    this.lastCount = 0;
    this.last = undefined; // Array
    this.ended = false;
    this.finished = false;
    this.ids = 0;
}

function AsyncStream(global, writer, state, shouldBuffer) {
    var finalGlobal = this.attributes = global || {};
    var originalStream;

    if (state) {
        originalStream = state.stream;
    } else {
        var events = finalGlobal.events /* deprecated */ = writer && writer.on ? writer : new EventEmitter();

        if (writer) {
            originalStream = writer;
            if (shouldBuffer) {
                writer = new BufferedWriter(writer);
            }
        } else {
            writer = originalStream = new StringWriter();
        }

        state = new State(this, originalStream, writer, events);
    }

    this.global = finalGlobal;
    this.stream = originalStream;
    this._state = state;

    this.data = {};
    this.writer = writer;
    writer.stream = this;

    this._sync = false;
    this._stack = undefined;
    this.name = undefined;
    this._timeoutId = undefined;

    this._node = undefined;

    this._elStack = undefined; // Array

    this.$__componentArgs = null; // Component args
}

AsyncStream.DEFAULT_TIMEOUT = 10000;
AsyncStream.INCLUDE_STACK = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
AsyncStream.enableAsyncStackTrace = function() {
    AsyncStream.INCLUDE_STACK = true;
};

var proto = AsyncStream.prototype = {
    constructor: AsyncStream,
    $__document: defaultDocument,
    $__isOut: true,

    sync: function() {
        this._sync = true;
    },

    isSync: function() {
        return this._sync === true;
    },

    write: function(str) {
        if (str != null) {
            this.writer.write(str.toString());
        }
        return this;
    },

    $__getOutput: function() {
        return this._state.writer.toString();
    },

    /**
     * Legacy...
     */
    getOutput: function() {
        return this.$__getOutput();
    },

    toString: function() {
        return this._state.writer.toString();
    },

    $__getResult: function() {
        this._result = this._result || new RenderResult(this);
        return this._result;
    },

    beginAsync: function(options) {
        if (this._sync) {
            throw new Error('beginAsync() not allowed when using renderSync()');
        }

        var state = this._state;

        var currentWriter = this.writer;

        /* ┏━━━━━┓               this
           ┃ WAS ┃               ↓↑
           ┗━━━━━┛  prevWriter → currentWriter → nextWriter  */

        var newWriter = new StringWriter();
        var newStream = new AsyncStream(this.global, currentWriter, state);

        this.writer = newWriter;
        newWriter.stream = this;

        newWriter.next = currentWriter.next;
        currentWriter.next = newWriter;

        /* ┏━━━━━┓               newStream       this
           ┃ NOW ┃               ↓↑              ↓↑
           ┗━━━━━┛  prevWriter → currentWriter → newWriter → nextWriter  */

       var timeout;
       var name;

       state.remaining++;

       if (options != null) {
           if (typeof options === 'number') {
               timeout = options;
           } else {
               timeout = options.timeout;

               if (options.last === true) {
                   if (timeout == null) {
                       // Don't assign a timeout to last flush fragments
                       // unless it is explicitly given a timeout
                       timeout = 0;
                   }

                   state.lastCount++;
               }

               name = options.name;
           }
       }

       if (timeout == null) {
           timeout = AsyncStream.DEFAULT_TIMEOUT;
       }

       newStream.stack = AsyncStream.INCLUDE_STACK ? new Error().stack : null;
       newStream.name = name;

       if (timeout > 0) {
           newStream._timeoutId = setTimeout(function() {
               newStream.error(new Error('Async fragment ' + (name ? '(' + name + ') ': '') + 'timed out after ' + timeout + 'ms'));
           }, timeout);
       }

       state.events.emit('beginAsync', {
           writer: newStream, // Legacy
           parentWriter: this, // Legacy
           out: newStream,
           parentOut: this
       });

        return newStream;
    },

    end: function(data) {
        if (data) {
            this.write(data);
        }

        var currentWriter = this.writer;

        /* ┏━━━━━┓  this            nextStream
           ┃ WAS ┃  ↓↑              ↓↑
           ┗━━━━━┛  currentWriter → nextWriter → futureWriter  */

        // Prevent any more writes to the current steam
        this.writer = voidWriter;
        currentWriter.stream = null;

        // Flush the contents of nextWriter to the currentWriter
        this.flushNext(currentWriter);

        /* ┏━━━━━┓    this        ╵  nextStream
           ┃     ┃    ↓           ╵  ↓↑
           ┃ NOW ┃    voidWriter  ╵  currentWriter → futureWriter
           ┃     ┃  ──────────────┴────────────────────────────────
           ┗━━━━━┛    Flushed & garbage collected: nextWriter  */


       var state = this._state;

       if (state.finished) {
           return;
       }

       var remaining;

       if (this === state.root) {
           remaining = state.remaining;
           state.ended = true;
       } else {
           var timeoutId = this._timeoutId;

           if (timeoutId) {
               clearTimeout(timeoutId);
           }

           remaining = --state.remaining;
       }

       if (state.ended) {
           if (!state.lastFired && (state.remaining - state.lastCount === 0)) {
               state.lastFired = true;
               state.lastCount = 0;
               state.events.emit('last');
           }

           if (remaining === 0) {
               state.finished = true;

               if (state.writer.end) {
                   state.writer.end();
               } else {
                   state.events.emit('finish', this.$__getResult());
               }
           }
       }

       return this;
    },

    // flushNextOld: function(currentWriter) {
    //     if (currentWriter === this._state.writer) {
    //         var nextStream;
    //         var nextWriter = currentWriter.next;
    //
    //         // flush until there is no nextWriter
    //         // or the nextWriter is still attached
    //         // to a branch.
    //         while(nextWriter) {
    //             currentWriter.write(nextWriter.toString());
    //             nextStream = nextWriter.stream;
    //
    //             if(nextStream) break;
    //             else nextWriter = nextWriter.next;
    //         }
    //
    //         // Orphan the nextWriter and everything that
    //         // came before it. They have been flushed.
    //         currentWriter.next = nextWriter && nextWriter.next;
    //
    //         // If there is a nextStream,
    //         // set its writer to currentWriter
    //         // (which is the state.writer)
    //         if(nextStream) {
    //             nextStream.writer = currentWriter;
    //             currentWriter.stream = nextStream;
    //         }
    //     }
    // },

    flushNext: function(currentWriter) {
        // It is possible that currentWriter is the
        // last writer in the chain, so let's make
        // sure there is a nextWriter to flush.
        var nextWriter = currentWriter.next;
        if (nextWriter) {
            // Flush the contents of nextWriter
            // to the currentWriter
            currentWriter.write(nextWriter.toString());

            // Remove nextWriter from the chain.
            // It has been flushed and can now be
            // garbage collected.
            currentWriter.next = nextWriter.next;

            // It's possible that nextWriter is the last
            // writer in the chain and its stream already
            // ended, so let's make sure nextStream exists.
            var nextStream = nextWriter.stream;
            if (nextStream) {
                // Point the nextStream to currentWriter
                nextStream.writer = currentWriter;
                currentWriter.stream = nextStream;
            }
        }
    },

    on: function(event, callback) {
        var state = this._state;

        if (event === 'finish' && state.finished) {
            callback(this.$__getResult());
            return this;
        }

        state.events.on(event, callback);
        return this;
    },

    once: function(event, callback) {
        var state = this._state;

        if (event === 'finish' && state.finished) {
            callback(this.$__getResult());
            return this;
        }

        state.events.once(event, callback);
        return this;
    },

    onLast: function(callback) {
        var state = this._state;

        var lastArray = state.last;

        if (!lastArray) {
            lastArray = state.last = [];
            var i = 0;
            var next = function next() {
                if (i === lastArray.length) {
                    return;
                }
                var _next = lastArray[i++];
                _next(next);
            };

            this.once('last', function() {
                next();
            });
        }

        lastArray.push(callback);
        return this;
    },

    emit: function(type, arg) {
        var events = this._state.events;
        switch(arguments.length) {
            case 1:
                events.emit(type);
                break;
            case 2:
                events.emit(type, arg);
                break;
            default:
                events.emit.apply(events, arguments);
                break;
        }
        return this;
    },

    removeListener: function() {
        var events = this._state.events;
        events.removeListener.apply(events, arguments);
        return this;
    },

    prependListener: function() {
        var events = this._state.events;
        events.prependListener.apply(events, arguments);
        return this;
    },

    pipe: function(stream) {
        this._state.stream.pipe(stream);
        return this;
    },

    error: function(e) {
        var stack = this._stack;
        var name = this.name;

        var message;

        if (name) {
            message = 'Render async fragment error (' + name + ')';
        } else {
            message = 'Render error';
        }

        message += '. Exception: ' + (e.stack || e);

        if (stack) {
            message += '\nCreation stack trace: ' + stack;
        }

        e = new Error(message);

        try {
            this.emit('error', e);
        } finally {
            // If there is no listener for the error event then it will
            // throw a new here. In order to ensure that the async fragment
            // is still properly ended we need to put the end() in a `finally`
            // block
            this.end();
        }

        if (console) {
            console.error(message);
        }

        return this;
    },

    flush: function() {
        var state = this._state;

        if (!state.finished) {
            var writer = state.writer;
            if (writer && writer.flush) {
                writer.flush();
            }
        }
        return this;
    },

    createOut: function() {
        return new AsyncStream(this.global);
    },

    element: function(tagName, elementAttrs, openTagOnly) {
        var str = '<' + tagName +
            attrsHelper(elementAttrs) +
            '>';

        if (openTagOnly !== true) {
            str += '</' + tagName + '>';
        }

        this.write(str);
    },

    beginElement: function(name, elementAttrs) {

        var str = '<' + name +
            attrsHelper(elementAttrs) +
            '>';

        this.write(str);

        if (this._elStack) {
            this._elStack.push(name);
        } else {
            this._elStack = [name];
        }
    },

    endElement: function() {
        var tagName = this._elStack.pop();
        this.write('</' + tagName + '>');
    },

    text: function(str) {
        this.write(escapeXml(str));
    },

    $__getNode: function(doc) {
        var node = this._node;
        var curEl;
        var newBodyEl;
        var html = this.$__getOutput();

        if (!doc) {
            doc = this.$__document;
        }

        if (!node) {
            if (html) {
                newBodyEl = doc.createElement('body');
                newBodyEl.innerHTML = html;
                if (newBodyEl.childNodes.length == 1) {
                    // If the rendered component resulted in a single node then just use that node
                    node = newBodyEl.childNodes[0];
                } else {
                    // Otherwise, wrap the nodes in a document fragment node
                    node = doc.createDocumentFragment();
                    while ((curEl = newBodyEl.firstChild)) {
                        node.appendChild(curEl);
                    }
                }
            } else {
                // empty HTML so use empty document fragment (so that we're returning a valid DOM node)
                node = doc.createDocumentFragment();
            }
            this._node = node;
        }
        return node;
    },

    then: function(fn, fnErr) {
        var out = this;
        var promise = new Promise(function(resolve, reject) {
            out.on('error', reject);
            out.on('finish', function(result) {
                resolve(result);
            });
        });

        return Promise.resolve(promise).then(fn, fnErr);
    },

    catch: function(fnErr) {
        return this.then(undefined, fnErr);
    },

    c: function(componentArgs) {
        this.$__componentArgs = componentArgs;
    }
};

// alias:
proto.w = proto.write;

module.exports = AsyncStream;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var AsyncStream = __webpack_require__(31);
var makeRenderable = __webpack_require__(188);

function Template(path, renderFunc, options) {
    this.path = path;
    this._ = renderFunc;
    this.$__shouldBuffer = !options || options.shouldBuffer !== false;
    this.meta = undefined;
}

function createOut(globalData, parent, state, buffer) {
    return new AsyncStream(globalData, parent, state, buffer);
}

Template.prototype = {
    createOut: createOut,
    stream: function() {
        throw new Error('You must require("marko/stream")');
    }
};

makeRenderable(Template.prototype);

module.exports = Template;


/***/ }),
/* 33 */
/***/ (function(module, exports) {

var elTest = /[&<]/;
var elTestReplace = /[&<]/g;
var attrTest = /[&<\"\n]/;
var attrReplace = /[&<\"\n]/g;

var replacements = {
    '<': '&lt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '\n': '&#10;' //Preserve new lines so that they don't get normalized as space
};

function replaceChar(match) {
    return replacements[match];
}

function escapeString(str, regexpTest, regexpReplace) {
    return regexpTest.test(str) ? str.replace(regexpReplace, replaceChar) : str;
}

function escapeXmlHelper(value, regexpTest, regexpReplace) {
    // check for most common case first
    if (typeof value === 'string') {
        return escapeString(value, regexpTest, regexpReplace);
    } else if (value == null) {
        return '';
    } else if (typeof value === 'object') {
        if (value.toHTML) {
            return value.toHTML();
        }
    } else if (value === true || value === false || typeof value === 'number') {
        return value.toString();
    }

    return escapeString(value.toString(), regexpTest, regexpReplace);
}

function escapeXml(value) {
    return escapeXmlHelper(value, elTest, elTestReplace);
}

function escapeXmlAttr(value) {
    return escapeXmlHelper(value, attrTest, attrReplace);
}

exports.escapeString = escapeString;
exports.escapeXml = escapeXml;
exports.escapeXmlAttr = escapeXmlAttr;


/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = function copyProps(from, to) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
        var descriptor = Object.getOwnPropertyDescriptor(from, name);
        Object.defineProperty(to, name, descriptor);
    });
};

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = require("strip-json-comments");

/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 37 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 37;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const isArray = Array.isArray;
const Node = __webpack_require__(0);
const Literal = __webpack_require__(3);
const Identifier = __webpack_require__(10);
const ok = __webpack_require__(1).ok;
const Container = __webpack_require__(9);
const Comment = __webpack_require__(42);
const isValidJavaScriptVarName = __webpack_require__(27);

class CodeWriter {
    constructor(options, builder) {
        ok(builder, '"builder" is required');
        options = options || {};
        this.builder = builder;
        this.root = null;
        this._indentStr = options.indent != null ? options.indent : '  ';
        this._indentSize = this._indentStr.length;

        this._code = '';
        this.currentIndent = '';
    }

    getCode() {
        return this._code;
    }

    writeBlock(body) {
        if (!body) {
            this.write('{}');
            return;
        }

        if (typeof body === 'function') {
            body = body();
        }

        if (!body ||
            (Array.isArray(body) && body.length === 0) ||
            (body instanceof Container && body.length === 0)) {
            this.write('{}');
            return;
        }

        this.write('{\n')
            .incIndent();

        this.writeStatements(body);

        this.decIndent()
            .writeLineIndent()
            .write('}');
    }

    writeStatements(nodes) {
        if (!nodes) {
            return;
        }

        ok(nodes, '"nodes" expected');
        let firstStatement = true;

        var writeNode = (node) => {
            if (Array.isArray(node) || (node instanceof Container)) {
                node.forEach(writeNode);
                return;
            } else {
                if (firstStatement) {
                    firstStatement = false;
                } else {
                    this._write('\n');
                }

                this.writeLineIndent();

                if (typeof node === 'string') {
                    this._write(node);
                } else {
                    node.statement = true;
                    this.write(node);
                }

                if (this._code.endsWith('\n')) {
                    // Do nothing
                } else if (this._code.endsWith(';')) {
                    this._code += '\n';
                }  else if (this._code.endsWith('\n' + this.currentIndent) || node instanceof Comment) {
                    // Do nothing
                } else {
                    this._code += ';\n';
                }
            }
        };

        if (nodes instanceof Node) {
            writeNode(nodes);
        } else {
            nodes.forEach(writeNode);
        }
    }

    write(code) {
        if (code == null || code === '') {
            return;
        }

        if (code instanceof Node) {
            let node = code;
            if (!node.writeCode) {
                throw new Error('Node does not have a `writeCode` method: ' + JSON.stringify(node, null, 4));
            }
            node.writeCode(this);
        } else if (isArray(code) || code instanceof Container) {
            code.forEach(this.write, this);
            return;
        } else if (typeof code === 'string') {
            this._code += code;
        }  else if (typeof code === 'boolean' || typeof code === 'number') {
            this._code += code.toString();
        } else {
            throw new Error('Illegal argument: ' + JSON.stringify(code));
        }

        return this;
    }

    _write(code) {
        this._code += code;
        return this;
    }

    incIndent(count) {
        if (count != null) {
            for (let i=0; i<count; i++) {
                this.currentIndent += ' ';
            }
        } else {
            this.currentIndent += this._indentStr;
        }

        return this;
    }

    decIndent(count) {
        if (count == null) {
            count = this._indentSize;
        }

        this.currentIndent = this.currentIndent.substring(
            0,
            this.currentIndent.length - count);

        return this;
    }

    writeLineIndent() {
        this._code += this.currentIndent;
        return this;
    }

    writeIndent() {
        this._code += this._indentStr;
        return this;
    }

    isLiteralNode(node) {
        return node instanceof Literal;
    }

    isIdentifierNode(node) {
        return node instanceof Identifier;
    }

    writeLiteral(value) {
        if (value === null) {
            this.write('null');
        } else if (value === undefined) {
            this.write('undefined');
        } else if (typeof value === 'string') {
            this.write(JSON.stringify(value));
        } else if (value === true) {
            this.write('true');
        } else if (value === false) {
            this.write('false');
        }  else if (isArray(value)) {
            if (value.length === 0) {
                this.write('[]');
                return;
            }

            this.write('[\n');
            this.incIndent();

            for (let i=0; i<value.length; i++) {
                let v = value[i];

                this.writeLineIndent();

                if (v instanceof Node) {
                    this.write(v);
                } else {
                    this.writeLiteral(v);
                }

                if (i < value.length - 1) {
                    this.write(',\n');
                } else {
                    this.write('\n');
                }
            }

            this.decIndent();
            this.writeLineIndent();
            this.write(']');
        } else if (typeof value === 'number') {
            this.write(value.toString());
        } else if (value instanceof RegExp) {
            this.write(value.toString());
        } else if (typeof value === 'object') {
            let keys = Object.keys(value);
            if (keys.length === 0) {
                this.write('{}');
                return;
            }

            this.incIndent();
            this.write('{\n');
            this.incIndent();

            for (let i=0; i<keys.length; i++) {
                let k = keys[i];
                let v = value[k];

                this.writeLineIndent();

                if (isValidJavaScriptVarName(k)) {
                    this.write(k + ': ');
                } else {
                    this.write(JSON.stringify(k) + ': ');
                }

                if (v instanceof Node) {
                    this.write(v);
                } else {
                    this.writeLiteral(v);
                }

                if (i < keys.length - 1) {
                    this.write(',\n');
                } else {
                    this.write('\n');
                }
            }

            this.decIndent();
            this.writeLineIndent();
            this.write('}');
            this.decIndent();
        }
    }
}

module.exports = CodeWriter;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;
var path = __webpack_require__(2);
var complain = __webpack_require__(196);
var taglibLookup = __webpack_require__(48);
var charProps = __webpack_require__(195);

var UniqueVars = __webpack_require__(158);
var PosInfo = __webpack_require__(157);
var CompileError = __webpack_require__(83);
var path = __webpack_require__(2);
var Node = __webpack_require__(0);
var macros = __webpack_require__(163);
var extend = __webpack_require__(5);
var Walker = __webpack_require__(40);
var EventEmitter = __webpack_require__(67).EventEmitter;
var utilFingerprint = __webpack_require__(160);
var htmlElements = __webpack_require__(161);
var markoModules = __webpack_require__(11);

const markoPkgVersion = __webpack_require__(176).version;

const FLAG_PRESERVE_WHITESPACE = 'PRESERVE_WHITESPACE';



function getTaglibPath(taglibPath) {
    if (typeof window === 'undefined') {
        return path.relative(process.cwd(), taglibPath);
    } else {
        return taglibPath;
    }
}

function removeExt(filename) {
    var ext = path.extname(filename);
    if (ext) {
        return filename.slice(0, 0 - ext.length);
    } else {
        return filename;
    }
}

function requireResolve(builder, path) {
    var requireResolveNode = builder.memberExpression(
        builder.identifier('require'),
        builder.identifier('resolve'));


    return builder.functionCall(requireResolveNode, [ path ]);
}

const helpers = {
    'attr': 'a',
    'attrs': 'as',
    'classAttr': 'ca',
    'classList': 'cl',
    'const': 'const',
    'createElement': 'e',
    'createInlineTemplate': {
        vdom: { module: 'marko/runtime/vdom/helper-createInlineTemplate'},
        html: { module: 'marko/runtime/html/helper-createInlineTemplate'}
    },
    'escapeXml': 'x',
    'escapeXmlAttr': 'xa',
    'escapeScript': 'xs',
    'escapeStyle': 'xc',
    'forEach': 'f',
    'forEachProp': { module: 'marko/runtime/helper-forEachProperty' },
    'forEachPropStatusVar': { module: 'marko/runtime/helper-forEachPropStatusVar' },
    'forEachWithStatusVar': { module: 'marko/runtime/helper-forEachWithStatusVar' },
    'forRange': { module: 'marko/runtime/helper-forRange' },
    'include': 'i',
    'loadNestedTag': { module: 'marko/runtime/helper-loadNestedTag' },
    'loadTag': 't',
    'loadTemplate': { module: 'marko/runtime/helper-loadTemplate' },
    'mergeNestedTagsHelper': { module: 'marko/runtime/helper-mergeNestedTags' },
    'merge': { module: 'marko/runtime/helper-merge' },
    'renderComponent': { module: 'marko/components/taglib/helpers/renderComponent' },
    'str': 's',
    'styleAttr': {
        vdom: { module: 'marko/runtime/vdom/helper-styleAttr'},
        html: 'sa'
    },
    'createText': 't'
};

class CompileContext extends EventEmitter {
    constructor(src, filename, builder, options) {
        super();
        ok(typeof src === 'string', '"src" string is required');
        ok(filename, '"filename" is required');

        this.src = src;
        this.filename = filename;
        this.builder = builder;

        this.dirname = path.dirname(filename);
        this.taglibLookup = taglibLookup.buildLookup(this.dirname);
        this.data = {};
        this._dataStacks = {};
        this.meta = {};

        this.options = options || {};

        const writeVersionComment = this.options.writeVersionComment;

        this.outputType = this.options.output || 'html';
        this.compilerType = this.options.compilerType || 'marko';
        this.compilerVersion = this.options.compilerVersion || markoPkgVersion;
        this.writeVersionComment = writeVersionComment !== 'undefined' ? writeVersionComment : true;

        this._vars = {};
        this._uniqueVars = new UniqueVars();
        this._staticVars = {};
        this._staticCode = null;
        this._uniqueStaticVars = new UniqueVars();
        this._srcCharProps = null;
        this._flags = {};
        this._errors = [];
        this._macros = null;
        this._preserveWhitespace = null;
        this._preserveComments = null;
        this.inline = this.options.inline === true;
        this.useMeta = this.options.meta !== false;
        this._moduleRuntimeTarget = this.outputType === 'vdom' ? 'marko/vdom' : 'marko/html';
        this.unrecognizedTags = [];
        this._parsingFinished = false;

        this._helpersIdentifier = null;

        if (this.options.preserveWhitespace) {
            this.setPreserveWhitespace(true);
        }

        this._helpers = {};
        this._imports = {};
        this._fingerprint = undefined;
        this._optimizers = undefined;
    }

    setInline(isInline) {
        this.inline = isInline === true;
    }

    getPosInfo(pos) {
        var srcCharProps = this._srcCharProps || (this._srcCharProps = charProps(this.src));
        let line = srcCharProps.lineAt(pos)+1;
        let column = srcCharProps.columnAt(pos);
        return new PosInfo(this.filename, line, column);
    }

    getNodePos(node) {
        if (node.pos) {
            return this.getPosInfo(node.pos);
        } else {
            return new PosInfo(this.filename);
        }
    }

    setFlag(name) {
        this.pushFlag(name);
    }

    clearFlag(name) {
        delete this._flags[name];
    }

    isFlagSet(name) {
        return this._flags.hasOwnProperty(name);
    }

    pushFlag(name) {
        if (this._flags.hasOwnProperty(name)) {
            this._flags[name]++;
        } else {
            this._flags[name] = 1;
        }
    }

    popFlag(name) {
        if (!this._flags.hasOwnProperty(name)) {
            throw new Error('popFlag() called for "' + name + '" when flag was not set');
        }

        if (--this._flags[name] === 0) {
            delete this._flags[name];
        }
    }

    pushData(key, data) {
        var dataStack = this._dataStacks[key];
        if (!dataStack) {
            dataStack = this._dataStacks[key] = [];
        }

        dataStack.push(data);

        return {
            pop: () => {
                this.popData(key);
            }
        };
    }

    popData(key) {
        var dataStack = this._dataStacks[key];

        if (!dataStack || dataStack.length === 0) {
            throw new Error('No data pushed for "' + key + '"');
        }

        dataStack.pop();

        if (dataStack.length === 0) {
            delete this.data[key];
        }
    }

    getData(name) {
        var dataStack = this._dataStacks[name];
        if (dataStack) {
            return dataStack[dataStack.length - 1];
        }

        return this.data[name];
    }

    deprecate(message, node) {
        var currentNode = node || this._currentNode;
        var location = currentNode && currentNode.pos;

        if (location != null) {
            location = this.getPosInfo(location).toString();
        }

        complain(message, { location });
    }

    addError(errorInfo) {
        if (errorInfo instanceof Node) {
            let node = arguments[0];
            let message = arguments[1];
            let code = arguments[2];
            let pos = arguments[3];
            errorInfo = {
                node,
                message,
                code,
                pos
            };
        } else if (typeof errorInfo === 'string') {
            let message = arguments[0];
            let code = arguments[1];
            let pos = arguments[2];

            errorInfo = {
                message,
                code,
                pos
            };
        }

        if(errorInfo && !errorInfo.node) {
            errorInfo.node = this._currentNode;
        }

        this._errors.push(new CompileError(errorInfo, this));
    }

    hasErrors() {
        return this._errors.length !== 0;
    }

    getErrors() {
        return this._errors;
    }

    getRequirePath(targetFilename) {
        return markoModules.deresolve(targetFilename, this.dirname);
    }

    importModule(varName, path) {
        if (typeof path !== 'string') {
            throw new Error('"path" should be a string');
        }

        var varId = this._imports[path];

        if (!varId) {
            var builder = this.builder;
            var requireFuncCall = this.builder.require(builder.literal(path));
            this._imports[path] = varId = this.addStaticVar(varName, requireFuncCall);
        }

        return varId;
    }

    addVar(name, init) {
        var actualVarName = this._uniqueVars.addVar(name, init);
        this._vars[actualVarName] = init;
        return this.builder.identifier(actualVarName);
    }

    getVars() {
        return this._vars;
    }

    addStaticVar(name, init) {
        var actualVarName = this._uniqueStaticVars.addVar(name, init);
        this._staticVars[actualVarName] = init;
        return this.builder.identifier(actualVarName);
    }

    getStaticVars() {
        return this._staticVars;
    }

    addStaticCode(code) {
        if (!code) {
            return;
        }

        if (typeof code === 'string') {
            // Wrap the String code in a Code AST node so that
            // the code will be indented properly
            code = this.builder.code(code);
        }

        if (this._staticCode == null) {
            this._staticCode = [code];
        } else {
            this._staticCode.push(code);
        }
    }

    getStaticCode() {
        return this._staticCode;
    }

    getTagDef(tagName) {
        var taglibLookup = this.taglibLookup;

        if (typeof tagName === 'string') {
            return taglibLookup.getTag(tagName);
        } else {
            let elNode = tagName;
            if (elNode.tagDef) {
                return elNode.tagDef;
            }

            return taglibLookup.getTag(elNode.tagName);
        }
    }

    addErrorUnrecognizedTag(tagName, elNode) {
        this.addError({
            node: elNode,
            message: 'Unrecognized tag: ' + tagName + ' - More details: https://github.com/marko-js/marko/wiki/Error:-Unrecognized-Tag'
        });
    }

    createNodeForEl(tagName, attributes, argument, openTagOnly, selfClosed) {
        var elDef;
        var builder = this.builder;

        if (typeof tagName === 'object') {
            elDef = tagName;
            tagName = elDef.tagName;
            attributes = elDef.attributes;
        } else {
            elDef = { tagName, argument, attributes, openTagOnly, selfClosed };
        }

        if (elDef.tagName === '') {
            elDef.tagName = tagName = 'assign';
        }

        if (!attributes) {
            attributes = elDef.attributes = [];
        } else if (typeof attributes === 'object') {
            if (!Array.isArray(attributes)) {
                attributes = elDef.attributes = Object.keys(attributes).map((attrName) => {
                    var attrDef = {
                        name: attrName
                    };

                    var val = attributes[attrName];
                    if (val == null) {

                    } if (val instanceof Node) {
                        attrDef.value = val;
                    } else {
                        extend(attrDef, val);
                    }

                    return attrDef;
                });
            }
        } else {
            throw new Error('Invalid attributes');
        }

        var node;
        var elNode = builder.htmlElement(elDef);
        elNode.pos = elDef.pos;

        this._currentNode = elNode;

        var tagDef;

        var taglibLookup = this.taglibLookup;

        if (typeof tagName === 'string' && tagName.startsWith('@')) {
            // NOTE: The tag definition can't be determined now since it will be
            //       determined by the parent custom tag.
            node = builder.customTag(elNode);
            node.body = node.makeContainer(node.body.items);
        } else {
            if (typeof tagName === 'string') {
                tagDef = taglibLookup.getTag(tagName);
                if (!tagDef &&
                        !this.isMacro(tagName) &&
                        tagName.indexOf(':') === -1 &&
                        !htmlElements.isRegisteredElement(tagName, this.dirname)) {

                    if (this._parsingFinished) {
                        this.addErrorUnrecognizedTag(tagName, elNode);
                    } else {
                        // We don't throw an error right away since the tag
                        // may be a macro that gets registered later
                        this.unrecognizedTags.push({
                            node: elNode,
                            tagName: tagName
                        });
                    }

                }
            }

            if (tagDef) {
                var nodeFactoryFunc = tagDef.getNodeFactory();
                if (nodeFactoryFunc) {
                    var newNode = nodeFactoryFunc(elNode, this);
                    if (!(newNode instanceof Node)) {
                        throw new Error('Invalid node returned from node factory for tag "' + tagName + '".');
                    }

                    if (newNode != node) {
                        // Make sure the body container is associated with the correct node
                        if (newNode.body && newNode.body !== node) {
                            newNode.body = newNode.makeContainer(newNode.body.items);
                        }
                        node = newNode;
                    }
                }
            }

            if (!node) {
                node = elNode;
            }
        }

        if (tagDef && tagDef.noOutput) {
            node.noOutput = true;
        }

        node.pos = elDef.pos;

        var foundAttrs = {};

        // Validate the attributes
        attributes.forEach((attr) => {
            let attrName = attr.name;
            if (!attrName) {
                // Attribute will be name for placeholder attributes. For example: <div ${data.myAttrs}>
                return;
            }
            let attrDef = taglibLookup.getAttribute(tagName, attrName);
            if (!attrDef) {
                if (tagDef) {
                    if (node.removeAttribute) {
                        node.removeAttribute(attrName);
                    }

                    // var isAttrForTaglib = compiler.taglibs.isTaglib(attrUri);
                    //Tag doesn't allow dynamic attributes
                    this.addError({
                        node: node,
                        message: 'The tag "' + tagName + '" in taglib "' + getTaglibPath(tagDef.taglibId) + '" does not support attribute "' + attrName + '"'
                    });

                }
                return;
            }

            if (attrDef.setFlag) {
                node.setFlag(attrDef.setFlag);
            }

            attr.def = attrDef;

            foundAttrs[attrName] = true;
        });

        if (tagDef) {
            // Add default values for any attributes. If an attribute has a declared
            // default value and the attribute was not found on the element
            // then add the attribute with the specified default value
            tagDef.forEachAttribute((attrDef) => {
                var attrName = attrDef.name;

                if (attrDef.hasOwnProperty('defaultValue') && !foundAttrs.hasOwnProperty(attrName)) {
                    attributes.push({
                        name: attrName,
                        value: builder.literal(attrDef.defaultValue)
                    });
                } else if (attrDef.required === true) {
                    // TODO Only throw an error if there is no data argument provided (just HTML attributes)
                    if (!foundAttrs.hasOwnProperty(attrName)) {
                        this.addError({
                            node: node,
                            message: 'The "' + attrName + '" attribute is required for tag "' + tagName + '" in taglib "' + getTaglibPath(tagDef.taglibId) + '".'
                        });
                    }
                }
            });

            node.tagDef = tagDef;
        }

        return node;
    }

    isMacro(name) {
        if (!this._macros) {
            return false;
        }

        return this._macros.isMacro(name);
    }

    getRegisteredMacro(name) {
        if (!this._macros) {
            return undefined;
        }

        return this._macros.getRegisteredMacro(name);
    }

    registerMacro(name, params) {
        if (!this._macros) {
            this._macros = macros.createMacrosContext();
        }

        return this._macros.registerMacro(name, params);
    }

    importTemplate(relativePath, varName) {
        ok(typeof relativePath === 'string', '"path" should be a string');
        var builder = this.builder;
		varName = varName || removeExt(path.basename(relativePath)) + '_template';

        var templateVar;

        if (this.options.browser || this.options.requireTemplates) {
            // When compiling a Marko template for the browser we just use `require('./template.marko')`
            templateVar = this.addStaticVar(varName, builder.require(builder.literal(relativePath)));
        } else {
            // When compiling a Marko template for the server we just use `loadTemplate(require.resolve('./template.marko'))`
            let loadTemplateArg = requireResolve(builder, builder.literal(relativePath));
            let loadFunctionCall = builder.functionCall(this.helper('loadTemplate'), [ loadTemplateArg ]);
            templateVar = this.addStaticVar(varName, loadFunctionCall);
        }

        this.pushMeta('tags', builder.literal(relativePath), true);

        return templateVar;
    }

    addDependency(path, type, options) {
        var dependency;
        if(typeof path === 'object') {
            dependency = path;
        } else {
            dependency = (type ? type+':' : '') + path;
        }
        this.pushMeta('deps', dependency, true);
    }

    pushMeta(key, value, unique) {
        var property;

        property = this.meta[key];

        if(!property) {
            this.meta[key] = [value];
        } else if(!unique || !property.some(e => JSON.stringify(e) === JSON.stringify(value))) {
            property.push(value);
        }
    }

    setMeta(key, value) {
        this.meta[key] = value;
    }

    setPreserveWhitespace(preserveWhitespace) {
        this._preserveWhitespace = preserveWhitespace;
    }

    beginPreserveWhitespace() {
        this.pushFlag(FLAG_PRESERVE_WHITESPACE);
    }

    endPreserveWhitespace() {
        this.popFlag(FLAG_PRESERVE_WHITESPACE);
    }

    isPreserveWhitespace() {
        if (this.isFlagSet(FLAG_PRESERVE_WHITESPACE) || this._preserveWhitespace === true) {
            return true;
        }
    }

    setPreserveComments(preserveComments) {
        this._preserveComments = preserveComments;
    }

    isPreserveComments() {
        return this._preserveComments === true;
    }

    createWalker(options) {
        return new Walker(options);
    }

    /**
     * Statically resolves a path if it is a literal string. Otherwise, it returns the input expression.
     */
    resolvePath(pathExpression) {
        ok(pathExpression, '"pathExpression" is required');

        if (pathExpression.type === 'Literal') {
            let path = pathExpression.value;
            if (typeof path === 'string') {
                return this.addStaticVar(path, this.builder.requireResolve(pathExpression));
            }
        }
        return pathExpression;
    }

    resolveTemplate(pathExpression) {
        ok(pathExpression, '"pathExpression" is required');

        if (pathExpression.type === 'Literal') {
            let path = pathExpression.value;
            if (typeof path === 'string') {
                return this.importTemplate(path);
            }
        }

        return pathExpression;
    }

    getStaticNodes(additionalVars) {
        let builder = this.builder;
        let staticNodes = [];
        let staticVars = this.getStaticVars();

        let staticVarNodes = Object.keys(staticVars).map((varName) => {
            var varInit = staticVars[varName];
            return builder.variableDeclarator(varName, varInit);
        });

        if(additionalVars) {
            staticVarNodes = additionalVars.concat(staticVarNodes);
        }

        if (staticVarNodes.length) {
            staticNodes.push(this.builder.vars(staticVarNodes));
        }

        var staticCodeArray = this.getStaticCode();

        if (staticCodeArray) {
            staticNodes = staticNodes.concat(staticCodeArray);
        }

        return staticNodes;
    }

    get helpersIdentifier() {
        if (!this._helpersIdentifier) {
            var target = this.outputType === 'vdom' ? 'marko/runtime/vdom/helpers' : 'marko/runtime/html/helpers';
            this._helpersIdentifier = this.importModule('marko_helpers', target);
        }
        return this._helpersIdentifier;
    }

    helper(name) {
        var helperIdentifier = this._helpers[name];
        if (!helperIdentifier) {
            var helperInfo = helpers[name];

            if (helperInfo && typeof helperInfo === 'object') {
                if (!helperInfo.module) {
                    helperInfo = helperInfo[this.outputType];
                }
            }

            if (!helperInfo) {
                throw new Error('Invalid helper: ' + name);
            }

            if (typeof helperInfo === 'string') {
                let methodName = helperInfo;
                var methodIdentifier = this.builder.identifier(methodName);

                helperIdentifier = this.addStaticVar(
                    'marko_' + name,
                    this.builder.memberExpression(this.helpersIdentifier, methodIdentifier));
            } else if (helperInfo && helperInfo.module) {
                helperIdentifier = this.addStaticVar(
                    'marko_' + name,
                    this.builder.require(this.builder.literal(helperInfo.module)));
            } else {
                throw new Error('Invalid helper: ' + name);
            }

            this._helpers[name] = helperIdentifier;
        }

        return helperIdentifier;
    }

    getFingerprint(len) {
        var fingerprint = this._fingerprint;
        if (!fingerprint) {
            this._fingerprint = fingerprint = utilFingerprint(this.src);
        }

        if (len == null || len >= this._fingerprint) {
            return fingerprint;
        } else {
            return fingerprint.substring(0, len);
        }
    }

    addOptimizer(optimizer) {
        if (this._optimizers) {
            this._optimizers.push(optimizer);
        } else {
            this._optimizers = [optimizer];
        }
    }

    optimize(rootNode) {
        if (this._optimizers) {
            this._optimizers.forEach((optimizer) => {
                optimizer.optimize(rootNode, this);
            });
        }
    }

    getModuleRuntimeTarget() {
        return this._moduleRuntimeTarget;
    }
}

CompileContext.prototype.util = {
    isValidJavaScriptIdentifier: __webpack_require__(26),
    isJavaScriptReservedWord: __webpack_require__(162)
};

module.exports = CompileContext;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isArray = Array.isArray;
var Container = __webpack_require__(9);

function noop() {}

class Walker {
    constructor(options) {
        this._enter = options.enter || noop;
        this._exit = options.exit || noop;
        this._enterArray = options.enterArray || noop;
        this._exitArray = options.exitArray || noop;
        this._stopped = false;
        this._reset();
        this._stack = [];
    }

    _reset() {
        this._skipped = false;
        this._replaced = undefined;
        this._removed = false;
    }

    skip() {
        this._skipped = true;
    }

    stop() {
        this._stopped = true;
    }

    replace(newNode) {
        this._replaced = newNode;
    }

    remove() {
        this._removed = true;
    }

    _walkArray(array) {
        var hasRemoval = false;

        array = this._enterArray(array) || array;

        array.forEach((node, i) => {
            var transformed = this.walk(node);
            if (transformed == null) {
                array[i] = null;
                hasRemoval = true;
            } else if (transformed !== node) {
                array[i] = transformed;
            }
        });

        if (hasRemoval) {
            for (let i=array.length-1; i>=0; i--) {
                if (array[i] == null) {
                    array.splice(i, 1);
                }
            }
        }

        array = this._exitArray(array) || array;

        return array;
    }

    _walkContainer(nodes) {
        nodes.forEach((node) => {
            var transformed = this.walk(node);
            if (!transformed) {
                node.container.removeChild(node);
            } else if (transformed !== node) {
                node.container.replaceChild(transformed, node);
            }
        });
    }

    walk(node) {
        if (!node || this._stopped || typeof node === 'string') {
            return node;
        }

        this._reset();

        var parent = this._stack.length ? this._stack[this._stack.length - 1] : undefined;

        this._stack.push(node);

        var replaced = this._enter(node, parent);
        if (replaced === undefined) {
            replaced = this._replaced;
        }

        if (this._removed) {
            replaced = null;
        }

        if (replaced !== undefined) {
            this._stack.pop();
            return replaced;
        }

        if (this._skipped || this._stopped) {
            this._stack.pop();
            return node;
        }

        if (isArray(node)) {
            let array = node;
            let newArray = this._walkArray(array);
            this._stack.pop();
            return newArray;
        } else if (node instanceof Container) {
            let container = node;
            this._walkContainer(container);
            this._stack.pop();
            return container;
        } else {
            if (node.walk) {
                node.walk(this);
            }
        }

        if (this._stopped) {
            this._stack.pop();
            return node;
        }

        this._reset();

        replaced = this._exit(node, parent);
        if (replaced === undefined) {
            replaced = this._replaced;
        }

        if (this._removed) {
            replaced = null;
        }

        if (replaced !== undefined) {
            this._stack.pop();
            return replaced;
        }

        this._stack.pop();
        return node;
    }
}

module.exports = Walker;



/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var isCompoundExpression = __webpack_require__(7);

function writeCodeForOperand(node, writer) {
    var wrap = isCompoundExpression(node);

    if (wrap) {
        writer.write('(');
    }

    writer.write(node);

    if (wrap) {
        writer.write(')');
    }
}

function operandToString(node) {
    var wrap = isCompoundExpression(node);

    var result = '';

    if (wrap) {
        result += '(';
    }

    result += node.toString();

    if (wrap) {
        result += ')';
    }

    return result;
}

class BinaryExpression extends Node {
    constructor(def) {
        super('BinaryExpression');
        this.left = def.left;
        this.operator = def.operator;
        this.right = def.right;
    }

    generateCode(codegen) {
        this.left = codegen.generateCode(this.left);
        this.right = codegen.generateCode(this.right);

        var left = this.left;
        var right = this.right;
        var operator = this.operator;

        if (!left || !right) {
            throw new Error('Invalid BinaryExpression: ' + this);
        }

        var builder = codegen.builder;

        if (left.type === 'Literal' && right.type === 'Literal') {
            if (operator === '+') {
                return builder.literal(left.value + right.value);
            } else if (operator === '-') {
                return builder.literal(left.value - right.value);
            } else if (operator === '*') {
                return builder.literal(left.value * right.value);
            } else if (operator === '/') {
                return builder.literal(left.value / right.value);
            }
        }

        return this;
    }

    writeCode(writer) {
        var left = this.left;
        var operator = this.operator;
        var right = this.right;

        if (!left || !right) {
            throw new Error('Invalid BinaryExpression: ' + this);
        }

        writeCodeForOperand(left, writer);
        writer.write(' ');
        writer.write(operator);
        writer.write(' ');
        writeCodeForOperand(right, writer);
    }

    isCompoundExpression() {
        return true;
    }

    toJSON() {
        return {
            type: 'BinaryExpression',
            left: this.left,
            operator: this.operator,
            right: this.right
        };
    }

    walk(walker) {
        this.left = walker.walk(this.left);
        this.right = walker.walk(this.right);
    }

    toString() {
        var left = this.left;
        var operator = this.operator;
        var right = this.right;

        if (!left || !right) {
            throw new Error('Invalid BinaryExpression: ' + this);
        }

        return operandToString(left) + ' ' + operator + ' ' + operandToString(right);
    }
}

module.exports = BinaryExpression;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Node = __webpack_require__(0);

function _isMultilineComment(comment) {
    return comment && comment.indexOf('\n') !== -1;
}

class Comment extends Node {
    constructor(def) {
        super('Comment');

        const comment = def.comment;

        if (_isMultilineComment(comment)) {
            this.comment = `/*\n${comment}\n*/`;
        } else {
            this.comment = `// ${comment}`;
        }
    }

    generateCode(codegen) {
        return this;
    }

    writeCode(writer) {
        var name = this.comment;
        writer.write(name);
    }

    toString() {
        return this.comment;
    }
}

module.exports = Comment;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var HtmlElement = __webpack_require__(22);
var removeDashes = __webpack_require__(167);
var safeVarName = __webpack_require__(28);
var ok = __webpack_require__(1).ok;
var Node = __webpack_require__(0);

var CUSTOM_TAG_KEY = Symbol('CustomTag');

function getNestedVariables(elNode, tagDef, codegen) {
    var variableNames = [];
    if (tagDef.forEachVariable) {
        tagDef.forEachVariable((nestedVar) => {
            var varName;
            if (nestedVar.nameFromAttribute) {
                var possibleNameAttributes = nestedVar.nameFromAttribute.split(/\s+or\s+|\s*,\s*/i);
                for (var i = 0, len = possibleNameAttributes.length; i < len; i++) {
                    var attrName = possibleNameAttributes[i];
                    var keep = false;
                    if (attrName.endsWith('|keep')) {
                        keep = true;
                        attrName = attrName.slice(0, 0 - '|keep'.length);
                        possibleNameAttributes[i] = attrName;
                    }
                    varName = elNode.getAttributeValue(attrName);
                    if (varName) {
                        if (varName.type !== 'Literal' || typeof varName.value !== 'string') {
                            codegen.addError('The value of the ' + attrName + ' is expected to be a string');
                            codegen.addError('Attribute ' + possibleNameAttributes.join(' or ') + ' is required');
                            varName = '_var';    // Let it continue with errors
                        }

                        varName = varName.value;

                        if (!keep) {
                            elNode.removeAttribute(attrName);
                        }
                        break;
                    }
                }
                if (!varName) {
                    codegen.addError('Attribute ' + possibleNameAttributes.join(' or ') + ' is required');
                    varName = '_var';    // Let it continue with errors
                }
            } else {
                varName = nestedVar.name;
                if (!varName) {
                    codegen.addError('Variable name is required');
                    varName = '_var';    // Let it continue with errors
                }
            }
            variableNames.push(codegen.builder.identifier(varName));
        });
    }

    if (elNode.additionalNestedVars.length) {
        elNode.additionalNestedVars.forEach((varName) => {
            variableNames.push(codegen.builder.identifier(varName));
        });
    }

    return variableNames;
}

function getAllowedAttributesString(tagName, context) {
    var attrNames = [];

    var tagDef = context.taglibLookup.getTag(tagName);
    if (tagDef) {
        tagDef.forEachAttribute((attrDef) => {
            attrNames.push(attrDef.name);
        });

        return attrNames.length ? attrNames.join(', ') : '(none)';
    } else {
        return null;
    }
}

function checkIfNestedTagCanBeAddedDirectlyToInput(nestedTag, parentCustomTag) {
    if (!nestedTag._isDirectlyNestedTag) {
        return false;
    }

    var isRepeated = nestedTag.tagDef.isRepeated;
    if (!isRepeated) {
        return true;
    }

    let tagName = nestedTag.tagDef.name;
    let previousMatchingNestedTags = parentCustomTag._foundNestedTagsByName[tagName];
    if (!previousMatchingNestedTags) {
        return true;
    }

    for (let i=0; i<previousMatchingNestedTags.length; i++) {
        let previousNestedTag = previousMatchingNestedTags[i];
        if (!previousNestedTag._isDirectlyNestedTag) {
            return false;
        }
    }

    return true;
}

function getNextNestedTagVarName(tagDef, context) {
    var key = 'customTag' + tagDef.name;

    var nestedTagVarInfo = context.data[key] || (context.data[key] = {
        next: 0
    });


    return safeVarName(tagDef.name) + (nestedTagVarInfo.next++);
}

function getNextRenderBodyVar(context) {
    var key = 'CustomTag_renderBodyVar';
    var nextVarInfo = context.data[key] || (context.data[key] = {
        next: 0
    });

    return 'renderBodyConditional'+ (nextVarInfo.next++);
}

function processDirectlyNestedTags(node, codegen) {
    node.forEachChild((child) => {
        if (child.type === 'CustomTag') {
            let customTag = child;

            var tagDef = customTag.resolveTagDef(codegen);
            if (tagDef.isNestedTag) {
                customTag._isDirectlyNestedTag = true;
            }
        } else if (child.type === 'If') {
            if (child.nextSibling && child.nextSibling.type === 'Else') {
                return;
            }

            let ifNode = child;

            let childChild = child.childCount === 1 && child.firstChild;
            if (childChild && childChild.type === 'CustomTag') {
                let customTag = childChild;

                let tagDef = customTag.resolveTagDef(codegen);
                if (tagDef.isNestedTag && !tagDef.isRepeated) {
                    let condition = codegen.generateCode(ifNode.test);
                    customTag._isDirectlyNestedTag = true;
                    customTag._condition = condition;
                    ifNode.replaceWith(customTag);
                }
            }
        }
    });
}

function merge(props1, props2, context) {
    if (!props2) {
        return props1;
    }

    if (!(props2 instanceof Node)) {
        if (Object.keys(props2).length === 0) {
            return props1;
        }
    }

    if (props1 instanceof Node) {
        let mergeVar = context.helper('merge');
        if (!(props2 instanceof Node)) {
            props2 = context.builder.literal(props2);
        }

        return context.builder.functionCall(mergeVar, [
            props2, // Input props from the attributes take precedence
            props1
        ]);
    } else {
        if (props2 instanceof Node) {
            let mergeVar = context.helper('merge');

            return context.builder.functionCall(mergeVar, [
                props2, // Input props from the attributes take precedence
                props1

            ]);
        } else {
            if (props1._arg) {
                let mergeVar = context.helper('merge');
                props1._arg = context.builder.functionCall(mergeVar, [
                    context.builder.literal(props2), // Input props from the attributes take precedence
                    props1._arg
                ]);
                return props1;
            } else {
                return Object.assign(props1, props2);
            }
        }
    }
}

class CustomTag extends HtmlElement {
    constructor(el, tagDef) {
        super(el);
        this.type = 'CustomTag';
        this.tagDef = tagDef;
        this.additionalNestedVars = [];
        this._nestedTagVar = null;
        this._inputProps = null;
        this._isDirectlyNestedTag = false;
        this._condition = null;
        this._foundNestedTagsByName = {};
        this._hasDynamicNestedTags = false;
        this._additionalProps = null;
        this._rendererPath = null;
        this.dynamicAttributes = undefined;
    }

    buildInputProps(codegen) {
        var inputProps = this._inputProps;
        if (inputProps) {
            return inputProps;
        }

        var context = codegen.context;
        var tagDef = this.resolveTagDef(codegen);
        inputProps = {};

        function handleAttr(attrName, attrValue, attrDef) {
            if (!attrDef) {
                return; // Skip over attributes that are not supported
            }

            if (attrValue == null) {
                attrValue = context.builder.literalTrue();
            }

            var propName;
            var parentPropName;

            if (attrDef.dynamicAttribute) {
                // Dynamic attributes are allowed attributes
                // that are not declared (i.e. "*" attributes)
                //
                if (attrDef.removeDashes === true || attrDef.preserveName === false) {
                    propName = removeDashes(attrName);
                } else {
                    propName = attrName;
                }

                if (attrDef.targetProperty) {
                    parentPropName = attrDef.targetProperty;
                }
            } else {
                // Attributes map to properties and we allow the taglib
                // author to control how an attribute name resolves
                // to a property name.
                if (attrDef.targetProperty) {
                    propName = attrDef.targetProperty;
                    if (Array.isArray(propName)) {
                        let propChain = propName;
                        if (propChain.length === 1) {
                            propName = propChain[0];
                        } else if (propChain.length === 2) {
                            parentPropName = propChain[0];
                            propName = propChain[1];
                        } else {
                            throw new Error('Invalid "target-property". Expected array with two elements in the following form: ["PARENT_PROPERTY_NAME", "CHILD_PROPERTY_NAME"]');
                        }
                    }
                } else if (attrDef.preserveName === true) {
                    propName = attrName;
                } else {
                    propName = removeDashes(attrName);
                }
            }

            if (attrDef.type === 'path') {
                attrValue = context.resolvePath(attrValue);
            } else if (attrDef.type === 'template') {
                attrValue = context.resolveTemplate(attrValue);
            }

            if (parentPropName) {
                let parent = inputProps[parentPropName] || (inputProps[parentPropName] = {});
                parent[propName] = attrValue;
            } else {
                inputProps[propName] = attrValue;
            }
        }

        if (tagDef.forEachAttribute) {
            // Add default values for any attributes from the tag definition. These added properties may get overridden
            // by get overridden from the attributes found on the actual HTML element.
            tagDef.forEachAttribute(function (attrDef) {
                if (attrDef.hasOwnProperty('defaultValue')) {
                    handleAttr(
                        attrDef.name,
                        context.builder.literal(attrDef.defaultValue),
                        attrDef);
                }
            });
        }

        let tagName = tagDef.isNestedTag ? tagDef.name : this.tagName;

        // Loop over the attributes found on the HTML element and add the corresponding properties
        // to the input object for the custom tag
        this.forEachAttribute((attr) => {
            var attrName = attr.name;
            if (!attrName) {
                return; // Skip attributes with no names
            }

            var attrDef = attr.def || context.taglibLookup.getAttribute(tagName, attrName) || tagDef.getAttribute(attr.name);

            if (!attrDef) {
                var errorMessage = 'Unsupported attribute of "' + attrName + '" found on the <' + this.tagName + '> custom tag.';
                let allowedAttributesString = getAllowedAttributesString(tagName, context);
                if (allowedAttributesString) {
                    errorMessage += ' Allowed attributes: ' + allowedAttributesString;
                }

                context.addError(this,  errorMessage);
                return; // Skip over attributes that are not supported
            }

            handleAttr(attrName, attr.value, attrDef);
        });


        if (tagDef.forEachImportedVariable) {
            // Imported variables are used to add input properties to a custom tag based on data/variables
            // found in the compiled template
            tagDef.forEachImportedVariable(function(importedVariable) {
                let propName = importedVariable.targetProperty;
                let propExpression = importedVariable.expression;

                inputProps[propName] = propExpression;
            });
        }

        this._inputProps = inputProps;

        return inputProps;
    }

    resolveTagDef(codegen) {
        var context = codegen.context;
        var tagDef = this.tagDef;
        if (!tagDef) {
            if (this.tagName && this.tagName.startsWith('@')) {
                var parentCustomTag = context.getData(CUSTOM_TAG_KEY);

                if (!parentCustomTag) {
                    codegen.addError('Invalid usage of the <' + this.tagName + '> nested tag. Tag not nested within a custom tag.');
                    return null;
                }

                var parentTagDef = parentCustomTag.tagDef;
                if (!parentTagDef) {
                    throw new Error('"tagDef" is expected for CustomTag: ' + parentCustomTag.tagName);
                }

                var nestedTagName = this.tagName.substring(1);

                var fullyQualifiedName = parentCustomTag.tagDef.name + ':' + nestedTagName;
                tagDef = this.tagDef = context.getTagDef(fullyQualifiedName);
                if (!tagDef) {
                    // This nested tag is not declared, but we will allow it to go through
                    var taglibLoader = __webpack_require__(15);
                    tagDef = this.tagDef = taglibLoader.loadTag({
                        name: fullyQualifiedName,
                        attributes: {
                            '*': {
                                targetProperty: null
                            }
                        }
                    }, context.filename);

                    tagDef.isNestedTag = true;
                    tagDef.isRepeated = false;
                    tagDef.targetProperty = nestedTagName;
                }
            } else {
                throw new Error('"tagDef" is required for CustomTag');
            }
            this.tagDef = tagDef;
        }
        return tagDef;
    }

    addNestedVariable(name) {
        ok(name, '"name" is required');
        this.additionalNestedVars.push(name);
    }

    addNestedTag(nestedTag) {
        var tagName = nestedTag.tagDef.name;

        var byNameArray = this._foundNestedTagsByName[tagName] ||
            (this._foundNestedTagsByName[tagName] = []);

        byNameArray.push(nestedTag);
    }

    addProps(additionalProps) {
        if (!this._additionalProps) {
            this._additionalProps = {};
        }

        Object.assign(this._additionalProps, additionalProps);
    }

    hasProp(name) {
        return this._additionalProps && this._additionalProps.hasOwnProperty(name);
    }

    addProp(name, value) {
        if (!this._additionalProps) {
            this._additionalProps = {};
        }
        this._additionalProps[name] = value;
    }

    setRendererPath(path) {
        ok(typeof path === 'string', '"path" should be a string');
        this._rendererPath = path;
    }

    getNestedTagVar(context) {
        if (!this._nestedTagVar) {
            var tagDef = this.tagDef;
            var builder = context.builder;

            var nextNestedTagVarName = getNextNestedTagVarName(tagDef, context);

            this._nestedTagVar = builder.identifier(nextNestedTagVarName);
        }

        return this._nestedTagVar;
    }

    generateRenderTagCode(codegen, tagVar, tagArgs) {
        return codegen.builder.functionCall(tagVar, tagArgs);
    }

    generateCode(codegen) {
        if (this.type !== 'CustomTag') {
            throw new Error(this.type);
        }
        var builder = codegen.builder;
        var context = codegen.context;

        var tagDef = this.resolveTagDef(codegen);

        if (!tagDef) {
            // The tag def was not able to be resolved and an error should have already
            // been added to the context
            return null;
        }

        var parentCustomTag;

        context.pushData(CUSTOM_TAG_KEY, this);
        processDirectlyNestedTags(this, codegen);
        var body = codegen.generateCode(this.body);
        context.popData(CUSTOM_TAG_KEY);

        var isNestedTag = tagDef.isNestedTag === true;
        if (isNestedTag) {
            parentCustomTag = context.getData(CUSTOM_TAG_KEY);
            if (!parentCustomTag) {
                if (tagDef.parentTagName) {
                    codegen.addError(`Invalid usage of the <${this.tagName}> nested tag. Tag not nested within a <${tagDef.parentTagName}> tag.`);
                } else {
                    codegen.addError(`Invalid usage of the <${this.tagName}> nested tag. Tag not nested within a custom tag.`);
                }

                return null;
            }

            parentCustomTag.addNestedTag(this);

            if (checkIfNestedTagCanBeAddedDirectlyToInput(this, parentCustomTag)) {
                let inputProps = this.buildInputProps(codegen);

                if (body && body.length) {
                    inputProps.renderBody = codegen.builder.renderBodyFunction(body);
                }

                if (tagDef.isRepeated) {
                    var currentValue = parentCustomTag.getAttributeValue(tagDef.targetProperty);
                    if (currentValue) {
                        currentValue.value.push(inputProps);
                    } else {
                        parentCustomTag.setAttributeValue(tagDef.targetProperty, builder.literal([
                            inputProps
                        ]));
                    }
                } else {
                    let nestedTagValue = builder.literal(inputProps);
                    if (this._condition) {
                        nestedTagValue = builder.binaryExpression(this._condition, '&&', nestedTagValue);
                    }
                    parentCustomTag.setAttributeValue(tagDef.targetProperty, nestedTagValue);
                }

                return null;
            } else {
                this._isDirectlyNestedTag = false;
                parentCustomTag._hasDynamicNestedTags = true;
            }
        }

        var hasDynamicNestedTags = this._hasDynamicNestedTags;

        var bodyOnlyIf = this.bodyOnlyIf;
        // let parentTagVar;

        var nestedVariableNames = getNestedVariables(this, tagDef, codegen);

        var inputProps = this.buildInputProps(codegen);

        var renderBodyFunction;

        if (body && body.length) {
            if (tagDef.bodyFunction) {
                let bodyFunction = tagDef.bodyFunction;
                let bodyFunctionName = bodyFunction.name;
                let bodyFunctionParams = bodyFunction.params.map(function(param) {
                    return builder.identifier(param);
                });

                inputProps[bodyFunctionName] = builder.functionDeclaration(bodyFunctionName, bodyFunctionParams, body);
            } else {
                renderBodyFunction = context.builder.renderBodyFunction(body);
                if (hasDynamicNestedTags) {
                    renderBodyFunction.params.push(this._nestedTagVar);
                } else {
                    if (nestedVariableNames && nestedVariableNames.length) {
                        renderBodyFunction.params = renderBodyFunction.params.concat(nestedVariableNames);
                    }
                }
            }
        }

        var renderBodyFunctionVarIdentifier;
        var renderBodyFunctionVar;
        // Store the renderBody function with the input, but only if the body does not have
        // nested tags
        if (renderBodyFunction) {
            if (bodyOnlyIf) {
                // Move the renderBody function into a local variable
                renderBodyFunctionVarIdentifier = builder.identifier(getNextRenderBodyVar(context));
                renderBodyFunctionVar = builder.var(renderBodyFunctionVarIdentifier, renderBodyFunction);
                inputProps.renderBody = renderBodyFunctionVarIdentifier;
            } else {
                inputProps.renderBody = renderBodyFunction;
            }
        } else {
            bodyOnlyIf = null;
        }

        var argExpression;

        if (this.argument) {
            argExpression = builder.parseExpression(this.argument);
        }

        var additionalProps = this._additionalProps;

        if (additionalProps) {
            inputProps = merge(additionalProps, inputProps, context);
        }

        if (argExpression) {
            inputProps = merge(argExpression, inputProps, context);
        }

        if (this.dynamicAttributes) {
            this.dynamicAttributes.forEach((dynamicAttributesExpression) => {
                inputProps = merge(dynamicAttributesExpression, inputProps, context);
            });
        }

        if (!(inputProps instanceof Node)) {
            inputProps = builder.literal(inputProps);
        }

        if (hasDynamicNestedTags) {
            inputProps = builder.functionCall(context.helper('mergeNestedTagsHelper'), [ inputProps ]);
        }

        var rendererPath = this._rendererPath || tagDef.renderer;
        var rendererRequirePath;
        var requireRendererFunctionCall;

        if (rendererPath) {
            rendererRequirePath = context.getRequirePath(rendererPath);
            requireRendererFunctionCall = builder.require(JSON.stringify(rendererRequirePath));
        } else {
            requireRendererFunctionCall = builder.literal(null);
        }

        var finalNode;

        var tagVarName = tagDef.name + (tagDef.isNestedTag ? '_nested_tag' : '_tag');

        if (tagDef.template) {
            var templateRequirePath = context.getRequirePath(tagDef.template);
            var templateVar = context.importTemplate(templateRequirePath, tagDef.name + '_template');

            let loadTag = builder.functionCall(context.helper('loadTag'), [templateVar]);
            let tagVar = codegen.addStaticVar(tagVarName, loadTag);

            finalNode = this.generateRenderTagCode(codegen, tagVar, [ inputProps, builder.identifierOut() ]);
        } else {
            if (rendererRequirePath) {
                codegen.pushMeta('tags', builder.literal(rendererRequirePath), true);
            }

            let loadTag;
            let tagArgs;

            if (isNestedTag) {
                let loadTagArgs = [ builder.literal(tagDef.targetProperty) ];

                if (tagDef.isRepeated) {
                    loadTagArgs.push(builder.literal(1)); // isRepeated
                }

                loadTag = builder.functionCall(context.helper('loadNestedTag'), loadTagArgs);

                tagArgs = [inputProps, parentCustomTag.getNestedTagVar(context) ];
            } else {
                loadTag = builder.functionCall(context.helper('loadTag'), [
                    requireRendererFunctionCall // The first param is the renderer
                ]);

                tagArgs = [inputProps, builder.identifierOut() ];
            }

            let tagVar = codegen.addStaticVar(tagVarName, loadTag);

            if (isNestedTag) {
                finalNode = builder.functionCall(tagVar, tagArgs);
            } else {
                finalNode = this.generateRenderTagCode(codegen, tagVar, tagArgs);
            }
        }

        if (bodyOnlyIf && renderBodyFunctionVar) {
            var ifStatement = builder.ifStatement(
                bodyOnlyIf,
                [

                    builder.functionCall(renderBodyFunctionVarIdentifier, [builder.identifierOut()])
                ],
                builder.elseStatement([
                    finalNode
                ]));

            return [
                renderBodyFunctionVar,
                ifStatement
            ];
        } else {
            return finalNode;
        }
    }

    addDynamicAttributes(expression) {
        if (!this.dynamicAttributes) {
            this.dynamicAttributes = [];
        }

        this.dynamicAttributes.push(expression);
    }
}

module.exports = CustomTag;


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var Literal = __webpack_require__(3);
var isCompoundExpression = __webpack_require__(7);

class Html extends Node {
    constructor(def) {
        super('Html');
        this.argument = def.argument;
    }

    _append(appendArgument) {
        var argument = this.argument;

        if (Array.isArray(argument)) {
            var len = argument.length;
            var last = argument[len-1];

            if (last instanceof Literal && appendArgument instanceof Literal) {
                last.value += appendArgument.value;
            } else {
                this.argument.push(appendArgument);
            }
        } else {
            if (argument instanceof Literal && appendArgument instanceof Literal) {
                argument.value += appendArgument.value;
            } else {
                this.argument = [ this.argument, appendArgument ];
            }
        }
    }

    append(html) {
        var appendArgument = html.argument;
        if (!appendArgument) {
            return;
        }

        if (Array.isArray(appendArgument)) {
            appendArgument.forEach(this._append, this);
        } else {
            this._append(appendArgument);
        }
    }

    generateHTMLCode() {
        return this;
    }

    writeCode(writer) {
        var argument = this.argument;

        if (Array.isArray(argument)) {
            let args = argument;

            for (let i=0, len=args.length; i<len; i++) {
                let arg = args[i];

                if (i === 0) {
                    writer.write('out.w(');
                } else {
                    writer.write(' +\n');
                    writer.writeLineIndent();
                    writer.writeIndent();
                }

                if (isCompoundExpression(arg)) {
                    writer.write(['(', arg, ')']);
                } else {
                    writer.write(arg);
                }
            }

            writer.write(')');
        } else {
            writer.write('out.w(');
            writer.write(argument);
            writer.write(')');
        }
    }

    walk(walker) {
        this.argument = walker.walk(this.argument);
    }
}

module.exports = Html;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;
var Node = __webpack_require__(0);
var Literal = __webpack_require__(3);

var generateHTMLCode = __webpack_require__(131);
var generateVDOMCode = __webpack_require__(133);
var vdomUtil = __webpack_require__(12);

class Text extends Node {
    constructor(def) {
        super('Text');
        this.argument = def.argument;
        this.escape = def.escape !== false;
        this.normalized = false;
        this.isFirst = false;
        this.isLast = false;
        this.preserveWhitespace = def.preserveWhitespace === true;

        ok(this.argument, 'Invalid argument');
    }

    generateHTMLCode(codegen) {
        return generateHTMLCode(this, codegen);
    }

    generateVDOMCode(codegen) {
        return generateVDOMCode(this, codegen, vdomUtil);
    }

    isLiteral() {
        return this.argument instanceof Node && this.argument.type === 'Literal';
    }

    isWhitespace() {
        var argument = this.argument;
        return (argument instanceof Literal) &&
            (typeof argument.value === 'string') &&
            (argument.value.trim() === '');
    }

    toJSON() {
        return {
            type: this.type,
            argument: this.argument
        };
    }
}

module.exports = Text;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var taglibLoader = __webpack_require__(15);
var nodePath = __webpack_require__(2);
var lassoPackageRoot = __webpack_require__(71);
var resolveFrom = __webpack_require__(21);
var scanTagsDir = __webpack_require__(47);
var DependencyChain = __webpack_require__(23);
var lassoCachingFS = __webpack_require__(70);

var findCache = {};
var excludedDirs = {};
var excludedPackages = {};
var taglibsForNodeModulesDirCache = {};

/**
 * Reset all internal state to the default state. This
 * was added for testing purposes.
 */
function reset() {
    lassoCachingFS.clearCaches();
    findCache = {};
    excludedDirs = {};
    excludedPackages = {};
    taglibsForNodeModulesDirCache = {};
}

function existsCached(path) {
    return lassoCachingFS.existsSync(path);
}

function getModuleRootPackage(dirname) {
    try {
        return lassoPackageRoot.getRootPackage(dirname);
    } catch(e) {
        return undefined;
    }
}

function getAllDependencyNames(pkg) {
    var map = {};

    if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach((name) => {
            map[name] = true;
        });
    }

    if (pkg.peerDependencies) {
        Object.keys(pkg.peerDependencies).forEach((name) => {
            map[name] = true;
        });
    }

    if (pkg.devDependencies) {
        Object.keys(pkg.devDependencies).forEach((name) => {
            map[name] = true;
        });
    }

    return Object.keys(map);
}

function find(dirname, registeredTaglibs) {
    var found = findCache[dirname];
    if (found) {
        return found;
    }

    found = [];

    var added = {};

    var helper = {
        alreadyAdded: function(taglibPath) {
            return added.hasOwnProperty(taglibPath);
        },
        addTaglib: function(taglib) {
            if (added[taglib.path]) {
                return;
            }

            added[taglib.path] = true;
            found.push(taglib);
        },
        foundTaglibPackages: {}
    };

    var rootDirname = process.cwd(); // Don't search up past this directory
    var rootPkg = getModuleRootPackage(dirname);
    if (rootPkg) {
        rootDirname = rootPkg.__dirname; // Use the package's root directory as the top-level directory
    }


    // First walk up the directory tree looking for marko.json files or components/ directories
    let curDirname = dirname;
    while(true) {
        if(!excludedDirs[curDirname]) {
            let taglibPath = nodePath.join(curDirname, 'marko.json');
            let taglib;

            if (existsCached(taglibPath)) {
                taglib = taglibLoader.loadTaglibFromFile(taglibPath);
                helper.addTaglib(taglib);
            }

            if (!taglib || taglib.tagsDir === undefined) {
                let componentsPath = nodePath.join(curDirname, 'components');

                if (existsCached(componentsPath) && !excludedDirs[componentsPath] && !helper.alreadyAdded(componentsPath)) {
                    let taglib = taglibLoader.createTaglib(componentsPath);
                    scanTagsDir(componentsPath, nodePath.dirname(componentsPath), './components', taglib, new DependencyChain([componentsPath]));
                    helper.addTaglib(taglib);
                }
            }

        }

        if (curDirname === rootDirname) {
            break;
        }

        let parentDirname = nodePath.dirname(curDirname);
        if (!parentDirname || parentDirname === curDirname) {
            break;
        }
        curDirname = parentDirname;
    }

    if (rootPkg) {
        // Now look for `marko.json` from installed packages
        getAllDependencyNames(rootPkg).forEach((name) => {
            if (!excludedPackages[name]) {
                let taglibPath = resolveFrom(rootPkg.__dirname, name + '/marko.json');
                if (taglibPath) {
                    var taglib = taglibLoader.loadTaglibFromFile(taglibPath);
                    helper.addTaglib(taglib);
                }
            }
        });
    }

    found = found.concat(registeredTaglibs);

    findCache[dirname] = found;

    return found;
}

function clearCache() {
    lassoCachingFS.clearCaches();
    findCache = {};
    taglibsForNodeModulesDirCache = {};
}

function excludeDir(dir) {
    excludedDirs[dir] = true;
}

function excludePackage(name) {
    excludedPackages[name] = true;
}

exports.reset = reset;
exports.find = find;
exports.clearCache = clearCache;
exports.excludeDir = excludeDir;
exports.excludePackage = excludePackage;

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const nodePath = __webpack_require__(2);
const fs = __webpack_require__(8);
const stripJsonComments = __webpack_require__(35);
const tagDefFromCode = __webpack_require__(155);
const loaders = __webpack_require__(6);
const fsReadOptions = { encoding: 'utf8' };
const extend = __webpack_require__(5);
const types = __webpack_require__(4);

const tagFileTypes = [
    'template',
    'renderer',
    'transformer',
    'code-generator',
    'node-factory',
];

const searchFiles = [
    { name:'index.marko', type:'template' },
    { name:'renderer', type:'renderer' },
    { name:'index', type:'renderer' },
    { name:'template.marko', type:'template' },
    { name:'template.html', type:'template' },
    { name:'code-generator', type:'code-generator' },
    { name:'node-factory', type:'node-factory' },
    { name:'transformer', type:'transformer' },
];

function createDefaultTagDef() {
    return {
        attributes: {
            '*': {
                type: 'string',
                targetProperty: null,
                preserveName: false
            }
        }
    };
}

function getFileMap(dirname) {
    let fileMap = {};
    let files = fs.readdirSync(dirname);

    files.forEach(file => {
        let extName = nodePath.extname(file);
        let baseName = file.slice(0, -1*extName.length);
        let fullPath = nodePath.join(dirname, file);
        fileMap[baseName] = fileMap[baseName] || {};
        fileMap[baseName][extName] = fullPath;
        fileMap[file] = fileMap[file] || {};
        fileMap[file].__path = fullPath;
    });

    return fileMap;
}

function getPath(filename, fileMap) {
    let file = fileMap[filename];

    if(!file) return;
    if(file.__path) return file.__path;
    if(file.js) return file['.js'];

    return file[Object.keys(file)[0]];
}

function findAndSetFile(tagDef, tagDirname) {
    if(!fs.statSync(tagDirname).isDirectory()) {
        return;
    }

    let fileMap = getFileMap(tagDirname);

    for(let i = 0; i < searchFiles.length; i++) {
        let name = searchFiles[i].name;
        let type = searchFiles[i].type;
        let path = getPath(name, fileMap);

        if(path) {
            tagDef[type] = path;
            return true;
        }
    }
}

function hasFile(tagDef) {
    for(let i = 0; i < tagFileTypes.length; i++) {
        if(tagDef[tagFileTypes[i]]) return true;
    }
    return false;
}

/**
 * @param {String} tagsConfigPath path to tag definition file
 * @param {String} tagsConfigDirname path to directory of tags config file (should be path.dirname(tagsConfigPath))
 * @param {String|Object} dir the path to directory to scan
 * @param {String} taglib the taglib that is being loaded
 */
module.exports = function scanTagsDir(tagsConfigPath, tagsConfigDirname, dir, taglib, dependencyChain) {
    let prefix;

    if (typeof dir === 'object') {
        prefix = dir.prefix;
        dir = dir.path;
    }

    if (prefix == null) {
        // no prefix by default
        prefix = '';
    }

    dir = nodePath.resolve(tagsConfigDirname, dir);
    let children = fs.readdirSync(dir);

    let rendererJSFile;

    for (let i=0, len=children.length; i<len; i++) {
        rendererJSFile = null;
        let childFilename = children[i];
        if (childFilename === 'node_modules') {
            continue;
        }

        let tagName;
        let tagDef = null;
        let tagDirname;
        let tagJsonPath;

        let ext = nodePath.extname(childFilename);
        if (ext === '.marko') {
            tagName = childFilename.slice(0, 0 - ext.length);
            tagDirname = dir;
            tagDef = createDefaultTagDef();
            tagDef.template = nodePath.join(dir, childFilename);
        } else {
            tagName = prefix + childFilename;

            tagDirname = nodePath.join(dir, childFilename);
            tagJsonPath = nodePath.join(tagDirname, 'marko-tag.json');

            let hasTagJson = false;
            if (fs.existsSync(tagJsonPath)) {
                hasTagJson = true;
                // marko-tag.json exists in the directory, use that as the tag definition
                try {
                    tagDef = JSON.parse(stripJsonComments(fs.readFileSync(tagJsonPath, fsReadOptions)));
                } catch(e) {
                    throw new Error('Unable to parse JSON file at path "' + tagJsonPath + '". Error: ' + e);
                }
            } else {
                tagJsonPath = null;
                tagDef = createDefaultTagDef();
            }

            if (!hasFile(tagDef)) {
                let fileWasSet = findAndSetFile(tagDef, tagDirname);
                if(!fileWasSet) {
                    if (hasTagJson) {
                        throw new Error('Invalid tag file: ' + tagJsonPath + '. Neither a renderer or a template was found for tag. ' + JSON.stringify(tagDef, null, 2));
                    } else {
                        // Skip this directory... there doesn't appear to be anything in it
                        continue;
                    }
                }
            }

            if (!hasTagJson && (tagDef.renderer || tagDef.template)) {
                let templateCode = fs.readFileSync(tagDef.renderer || tagDef.template, fsReadOptions);
                let extractedTagDef = tagDefFromCode.extractTagDef(templateCode);
                if (extractedTagDef) {
                    extend(tagDef, extractedTagDef);
                }
            }
        }

        let tagDependencyChain;

        if (tagJsonPath) {
            tagDependencyChain = dependencyChain.append(tagJsonPath);
        } else {
            tagDependencyChain = dependencyChain.append(tagDirname);
        }

        let tag = new types.Tag(tagJsonPath || tagDirname);
        loaders.loadTagFromProps(tag, tagDef, tagDependencyChain);
        tag.name = tag.name || tagName;
        taglib.addTag(tag);
    }
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.registerTaglib = registerTaglib;
exports.buildLookup = buildLookup;
exports.clearCache = clearCache;

var taglibLoader;
var taglibFinder;
var TaglibLookup;

exports.registeredTaglibs = [];

var lookupCache = {};

function handleImports(lookup, taglib) {
	if (taglib.imports) {
		for (var i=0; i<taglib.imports.length; i++) {
			var importedTaglib = taglib.imports[i];

			if (!lookup.hasTaglib(importedTaglib)) {
				lookup.addTaglib(importedTaglib);
			}
		}
	}
}

function buildLookup(dirname) {
	var taglibs = taglibFinder.find(dirname, exports.registeredTaglibs);

	var lookupCacheKey = taglibs
		.map(function(taglib) {
			return taglib.id;
		})
		.join(',');

	var lookup = lookupCache[lookupCacheKey];
	if (lookup === undefined) {
		lookup = new TaglibLookup();
		// The taglibs "closer" to the template will be earlier in the list
		// and the taglibs "farther" from the template will be later. We
		// want closer taglibs to take precedence (especially when de-duping)
		// so we loop from beginning to end. We used to loop from the end
		// to the beginning, but that appears to have been a mistake.
        for (var i=0; i<taglibs.length; i++) {
			var taglib = taglibs[i];
			lookup.addTaglib(taglib);
			handleImports(lookup, taglib);
		}

		lookupCache[lookupCacheKey] = lookup;
	}

	return lookup;
}

function registerTaglib(taglib) {
    if (typeof taglib === 'string') {
        let taglibPath = taglib;
        taglib = taglibLoader.loadFromFile(taglibPath);
    }

    exports.registeredTaglibs.push(taglib);
}

function clearCache() {
	lookupCache = {};
}

taglibLoader = __webpack_require__(15);
taglibFinder = __webpack_require__(46);
TaglibLookup = __webpack_require__(156);

/***/ }),
/* 49 */
/***/ (function(module, exports) {

var splitLinesRegExp = /\r?\n/;
var initialIndentationRegExp = /^\s+/;

function removeInitialEmptyLines(lines) {
    var i;

    for (i=0; i<lines.length; i++) {
        if (lines[i].trim() !== '') {
            break;
        }
    }

    if (i !== 0) {
        lines = lines.slice(i);
    }

    return lines;
}

function removeTrailingEmptyLines(lines) {
    var i;
    var last = lines.length-1;

    for (i=last; i>=0; i--) {
        if (lines[i].trim() !== '') {
            break;
        }
    }

    if (i !== last) {
        lines = lines.slice(0, i+1);
    }

    return lines;
}

function adjustIndent(str, newIndentation) {
    if (!str) {
        return str;
    }

    var lines = str.split(splitLinesRegExp);
    lines = removeInitialEmptyLines(lines);
    lines = removeTrailingEmptyLines(lines);

    if (lines.length === 0) {
        return '';
    }

    var initialIndentationMatches = initialIndentationRegExp.exec(lines[0]);

    var indentation = initialIndentationMatches ? initialIndentationMatches[0] : '';
    if (!indentation && !newIndentation) {
        return str;
    }

    lines.forEach((line, i) => {
        if (line.startsWith(indentation)) {
            line = line.substring(indentation.length);
        }

        lines[i] = line;
    });

    return newIndentation ?
        lines.join('\n' + newIndentation) :
        lines.join('\n');
}

module.exports = adjustIndent;

/***/ }),
/* 50 */
/***/ (function(module, exports) {

module.exports = {
    'abstract': true,
    'arguments': true,
    'await': true, // Not really a reserved word but we add it here anyway
    'boolean': true,
    'break': true,
    'byte': true,
    'case': true,
    'catch': true,
    'char': true,
    'class': true,
    'const': true,
    'continue': true,
    'debugger': true,
    'default': true,
    'delete': true,
    'do': true,
    'double': true,
    'else': true,
    'enum*': true,
    'eval': true,
    'export': true,
    'extends': true,
    'false': true,
    'final': true,
    'finally': true,
    'float': true,
    'for': true,
    'function': true,
    'goto': true,
    'if': true,
    'implements': true,
    'import': true,
    'in': true,
    'instanceof': true,
    'int': true,
    'interface': true,
    'let': true,
    'long': true,
    'native': true,
    'new': true,
    'null': true,
    'package': true,
    'private': true,
    'protected': true,
    'public': true,
    'return': true,
    'short': true,
    'static': true,
    'super': true,
    'switch': true,
    'synchronized': true,
    'this': true,
    'throw': true,
    'throws': true,
    'transient': true,
    'true': true,
    'try': true,
    'typeof': true,
    'var': true,
    'void': true,
    'volatile': true,
    'while': true,
    'with': true,
    'yield': true
};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ok = __webpack_require__(1).ok;

const esprima = __webpack_require__(198);

function parseExpression(src, builder, isExpression) {
    ok(typeof src === 'string', '"src" should be a string expression');
    ok(builder, '"builder" is required');

    function convert(node) {
        if (Array.isArray(node)) {
            let nodes = node;
            for (let i=0; i<nodes.length; i++) {
                var converted = convert(nodes[i]);
                if (converted == null) {
                    return null;
                }
                nodes[i] = converted;
            }
            return nodes;
        }

        switch(node.type) {
            case 'ArrayExpression': {
                let elements = convert(node.elements);
                if (!elements) {
                    return null;
                }
                return builder.arrayExpression(elements);
            }
            case 'AssignmentExpression': {
                let left = convert(node.left);
                if (!left) {
                    return null;
                }

                let right = convert(node.right);
                if (!right) {
                    return null;
                }

                return builder.assignment(left, right, node.operator);
            }
            case 'BinaryExpression': {
                let left = convert(node.left);
                if (!left) {
                    return null;
                }

                let right = convert(node.right);
                if (!right) {
                    return null;
                }

                return builder.binaryExpression(left, node.operator, right);
            }
            case 'BlockStatement': {
                let body = convert(node.body);
                if (!body) {
                    return null;
                }

                return body;
            }
            case 'CallExpression': {
                let callee = convert(node.callee);

                if (!callee) {
                    return null;
                }

                let args = convert(node.arguments);
                if (!args) {
                    return null;
                }

                return builder.functionCall(callee, args);
            }
            case 'ConditionalExpression': {
                let test = convert(node.test);

                if (!test) {
                    return null;
                }

                let consequent = convert(node.consequent);

                if (!consequent) {
                    return null;
                }

                let alternate = convert(node.alternate);

                if (!alternate) {
                    return null;
                }

                return builder.conditionalExpression(test, consequent, alternate);
            }
            case 'ExpressionStatement': {
                return convert(node.expression);
            }
            case 'FunctionDeclaration':
            case 'FunctionExpression': {
                let name = null;

                if (node.id) {
                    name = convert(node.id);
                    if (name == null) {
                        return null;
                    }
                }

                let params = convert(node.params);
                if (!params) {
                    return null;
                }

                let body = convert(node.body);
                if (!body) {
                    return null;
                }

                return builder.functionDeclaration(name, params, body);
            }
            case 'Identifier': {
                return builder.identifier(node.name);
            }
            case 'Literal': {
                let literalValue;

                if (node.regex) {
                    literalValue = new RegExp(node.regex.pattern, node.regex.flags);
                } else {
                    literalValue = node.value;
                }

                return builder.literal(literalValue);
            }
            case 'LogicalExpression': {
                let left = convert(node.left);
                if (!left) {
                    return null;
                }

                let right = convert(node.right);
                if (!right) {
                    return null;
                }

                return builder.logicalExpression(left, node.operator, right);
            }
            case 'MemberExpression': {
                let object = convert(node.object);
                if (!object) {
                    return null;
                }

                let property = convert(node.property);
                if (!property) {
                    return null;
                }

                return builder.memberExpression(object, property, node.computed);
            }
            case 'NewExpression': {
                let callee = convert(node.callee);

                if (!callee) {
                    return null;
                }

                let args = convert(node.arguments);
                if (!args) {
                    return null;
                }

                return builder.newExpression(callee, args);
            }
            case 'Program': {
                if (node.body && node.body.length === 1) {
                    return convert(node.body[0]);
                }
                return null;
            }
            case 'ObjectExpression': {
                let properties = convert(node.properties);
                if (!properties) {
                    return null;
                }
                return builder.objectExpression(properties);
            }
            case 'Property': {
                let key = convert(node.key);
                if (!key) {
                    return null;
                }
                let value = convert(node.value);
                if (!value) {
                    return null;
                }
                return builder.property(key, value);
            }
            case 'ReturnStatement': {
                var argument = node.argument;

                if (argument != null) {
                    argument = convert(node.argument);
                    if (!argument) {
                        return null;
                    }
                }

                return builder.returnStatement(argument);
            }
            case 'ThisExpression': {
                return builder.thisExpression();
            }
            case 'UnaryExpression': {
                let argument = convert(node.argument);
                if (!argument) {
                    return null;
                }

                return builder.unaryExpression(argument, node.operator, node.prefix);
            }
            case 'UpdateExpression': {
                let argument = convert(node.argument);
                if (!argument) {
                    return null;
                }

                return builder.updateExpression(argument, node.operator, node.prefix);
            }
            case 'VariableDeclarator': {
                var id = convert(node.id);
                if (!id) {
                    return null;
                }

                var init;

                if (node.init) {
                    init = convert(node.init);
                    if (!init) {
                        return null;
                    }
                }

                return builder.variableDeclarator(id, init);
            }
            case 'VariableDeclaration': {
                var kind = node.kind;

                var declarations = convert(node.declarations);

                if (!declarations) {
                    return null;
                }
                return builder.vars(declarations, kind);
            }
            default:
                return null;
        }
    }

    let jsAST;
    try {
        if (isExpression) {
            src = '(' + src + ')';
        }
        jsAST = esprima.parse(src);
    } catch(e) {
        if (e.index == null) {
            // Doesn't look like an Esprima parse error... just rethrow the exception
            throw e;
        }
        var errorIndex = e.index;
        var errorMessage = '\n' + e.description;
        if (errorIndex != null && errorIndex >= 0) {
            if (isExpression) {
                errorIndex--; // Account for extra paren added to start
            }
            errorMessage += ': ';
            errorMessage += src + '\n'+ new Array(errorMessage.length + errorIndex + 1).join(" ") + '^';
        }
        var wrappedError = new Error(errorMessage);
        wrappedError.index = errorIndex;
        wrappedError.src = src;
        wrappedError.code = 'ERR_INVALID_JAVASCRIPT_EXPRESSION';
        throw wrappedError;
    }

    var converted = convert(jsAST);
    if (converted == null) {
        converted = builder.expression(src);
    }

    return converted;
}

module.exports = parseExpression;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var AttributePlaceholder = __webpack_require__(91);

module.exports = function replacePlaceholderEscapeFuncs(node, context) {
    var walker = context.createWalker({
        exit: function(node, parent) {
            if (node.type === 'FunctionCall' &&
                node.callee.type === 'Identifier') {

                if (node.callee.name === '$noEscapeXml') {
                    return new AttributePlaceholder({escape: false, value: node.args[0]});
                } else if (node.callee.name === '$escapeXml') {
                    return new AttributePlaceholder({escape: true, value: node.args[0]});
                }
            }
        }
    });

    return walker.walk(node);
};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var warp10 = __webpack_require__(208);
var escapeEndingScriptTagRegExp = /<\//g;

function flattenHelper(components, flattened, typesArray, typesLookup) {
    for (var i = 0, len = components.length; i < len; i++) {
        var componentDef = components[i];
        var id = componentDef.id;
        var component = componentDef.$__component;
        var rerenderInBrowser = componentDef.$__willRerenderInBrowser;
        var state = component.state;
        var input = component.input;
        var typeName = component.typeName;
        var customEvents = component.$__customEvents;
        var scope = component.$__scope;
        var bubblingDomEvents = component.$__bubblingDomEvents;

        component.$__state = undefined; // We don't use `delete` to avoid V8 deoptimization
        component.$__input = undefined; // We don't use `delete` to avoid V8 deoptimization
        component.typeName = undefined;
        component.id = undefined;
        component.$__customEvents = undefined;
        component.$__scope = undefined;
        component.$__bubblingDomEvents = undefined;
        component.$__bubblingDomEventsExtraArgsCount = undefined;

        if (!typeName) {
            continue;
        }

        var typeIndex = typesLookup[typeName];
        if (typeIndex === undefined) {
            typeIndex = typesArray.length;
            typesArray.push(typeName);
            typesLookup[typeName] = typeIndex;
        }

        var children = componentDef.$__children;

        if (children !== null) {
            // Depth-first search (children should be initialized before parent)
            flattenHelper(children, flattened, typesArray, typesLookup);
            componentDef.$__children = null;
        }

        var hasProps = false;

        let componentKeys = Object.keys(component);
        for (let i=0, len=componentKeys.length; i<len; i++) {
            let key = componentKeys[i];

            if (component[key] !== undefined) {
                hasProps = true;
                break;
            }
        }

        var undefinedPropNames;

        if (state) {
            // Update state properties with an `undefined` value to have a `null`
            // value so that the property name will be serialized down to the browser.
            // This ensures that we add the proper getter/setter for the state property.

            let stateKeys = Object.keys(state);
            for (let i=0, len=stateKeys.length; i<len; i++) {
                let key = stateKeys[i];

                if (state[key] === undefined) {
                    if (undefinedPropNames) {
                        undefinedPropNames.push(key);
                    } else {
                        undefinedPropNames = [key];
                    }
                }
            }
        }

        var extra = {
            b: bubblingDomEvents,
            d: componentDef.$__domEvents,
            e: customEvents,
            p: customEvents && scope, // Only serialize scope if we need to attach custom events
            r: componentDef.$__roots,
            s: state,
            u: undefinedPropNames,
            w: hasProps ? component : undefined,
            _: rerenderInBrowser ? 1 : undefined
        };

        flattened.push([
            id,                  // 0 = id
            typeIndex,           // 1 = type
            input,               // 2 = input
            extra                // 3
        ]);
    }
}

function getRenderedComponents(out, shouldIncludeAll) {
    var componentDefs;
    var globalComponentsContext;
    var outGlobal = out.global;

    if (shouldIncludeAll === true) {
        globalComponentsContext = outGlobal.components;

        if (globalComponentsContext === undefined) {
            return undefined;
        }
    } else {
        let componentsContext = out.data.components;
        if (componentsContext === undefined) {
            return undefined;
        }
        let rootComponentDef = componentsContext.$__componentStack[0];
        componentDefs = rootComponentDef.$__children;

        if (componentDefs === null) {
            return undefined;
        }

        rootComponentDef.$__children = null;
    }

    var flattened = [];
    var typesLookup = {};
    var typesArray = [];

    if (shouldIncludeAll === true) {
        let roots = globalComponentsContext.$__roots;
        for (let i=0, len=roots.length; i<len; i++) {
            let root = roots[i];
            let children = root.$__children;
            if (children !== null) {
                flattenHelper(children, flattened, typesArray, typesLookup);
            }
        }
    } else {
        flattenHelper(componentDefs, flattened, typesArray, typesLookup);
    }

    if (flattened.length === 0) {
        return undefined;
    }

    return {w: flattened, t: typesArray};
}

function writeInitComponentsCode(out, shouldIncludeAll) {
    var renderedComponents = getRenderedComponents(out, shouldIncludeAll);
    if (renderedComponents === undefined) {
        return;
    }

    var cspNonce = out.global.cspNonce;
    var nonceAttr = cspNonce ? ' nonce='+JSON.stringify(cspNonce) : '';

    out.write('<script' + nonceAttr + '>' +
        '(function(){var w=window;w.$components=(w.$components||[]).concat(' +
        warp10.stringify(renderedComponents).replace(escapeEndingScriptTagRegExp, '\\u003C/') +
         ')||w.$components})()</script>');
}

exports.writeInitComponentsCode = writeInitComponentsCode;

/**
 * Returns an object that can be sent to the browser using JSON.stringify. The parsed object should be
 * passed to require('marko-components').initComponents(...);
 *
 * @param  {ComponentsContext|AsyncWriter} componentsContext A ComponentsContext or an AsyncWriter
 * @return {Object} An object with information about the rendered components that can be serialized to JSON. The object should be treated as opaque
 */
exports.getRenderedComponents = function(out) {
    var renderedComponents = getRenderedComponents(out, true);
    return warp10.stringifyPrepare(renderedComponents);
};

exports.r = __webpack_require__(174);

exports.c = function() { /* no op for defining a component on teh server */ };

// registerComponent is a no-op on the server.
// Fixes https://github.com/marko-js/marko-components/issues/111
exports.rc = function(typeName) { return typeName; };


/***/ }),
/* 54 */
/***/ (function(module, exports) {

module.exports = {
	"<*>": {
		"@w-bind": {
			"type": "string",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@w-scope": {
			"type": "expression",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@w-config": {
			"type": "expression",
			"preserve-name": true,
			"deprecated": true
		},
		"@for-key": {
			"type": "string",
			"preserve-name": true
		},
		"@key": {
			"type": "string",
			"preserve-name": true,
			"autocomplete": [
				{
					"displayText": "key=\"<method>\"",
					"snippet": "key=\"${1:method}\"",
					"descriptionMoreURL": "http://markojs.com/docs/marko-components/get-started/#referencing-nested-components"
				},
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko-components/get-started/#referencing-nested-components"
				}
			]
		},
		"@for-ref": {
			"type": "string",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@ref": {
			"type": "string",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@w-for": {
			"type": "string",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@w-id": {
			"type": "string",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@on*": {
			"pattern": true,
			"type": "statement",
			"allow-expressions": true,
			"preserve-name": true,
			"set-flag": "hasComponentEvents",
			"autocomplete": [
				{
					"displayText": "on<event>(\"<method>\")",
					"snippet": "on${1:Click}(\"handle${2:Button}${1:Click}\")",
					"descriptionMoreURL": "http://markojs.com/docs/marko-components/get-started/#adding-dom-event-listeners"
				}
			]
		},
		"@w-on*": {
			"pattern": true,
			"type": "string",
			"allow-expressions": true,
			"preserve-name": true,
			"set-flag": "hasComponentEvents",
			"autocomplete": [],
			"deprecated": true
		},
		"@w-body": {
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@w-preserve": {
			"type": "flag",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@w-preserve-body": {
			"type": "flag",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@w-preserve-if": {
			"preserve-name": true,
			"autocomplete": []
		},
		"@w-preserve-body-if": {
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"@no-update": {
			"type": "flag",
			"preserve-name": true,
			"autocomplete": [
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko-components/#preserving-dom-nodes-during-re-render"
				}
			]
		},
		"@no-update-body": {
			"type": "flag",
			"preserve-name": true,
			"autocomplete": [
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko-components/#preserving-dom-nodes-during-re-render"
				}
			]
		},
		"@no-update-if": {
			"preserve-name": true,
			"autocomplete": [
				{
					"snippet": "no-update-if(${1:condition})",
					"descriptionMoreURL": "http://markojs.com/docs/marko-components/#preserving-dom-nodes-during-re-render"
				}
			]
		},
		"@no-update-body-if": {
			"preserve-name": true,
			"autocomplete": [
				{
					"snippet": "no-update-body-if(${1:condition})",
					"descriptionMoreURL": "http://markojs.com/docs/marko-components/#preserving-dom-nodes-during-re-render"
				}
			]
		},
		"@w-preserve-attrs": {
			"type": "string",
			"preserve-name": true,
			"autocomplete": [],
			"deprecated": true
		},
		"transformer": "./components-transformer.js"
	},
	"<_component>": {
		"code-generator": "./component-tag.js",
		"autocomplete": []
	},
	"<component-globals>": {
		"renderer": "./component-globals-tag.js",
		"no-output": true,
		"autocomplete": []
	},
	"<init-components>": {
		"renderer": "./init-components-tag.js",
		"no-output": true,
		"@immediate": "boolean"
	},
	"<w-preserve>": {
		"renderer": "./preserve-tag.js",
		"@id": "string",
		"@if": "expression",
		"@body-only": "expression",
		"autocomplete": [],
		"deprecated": true
	},
	"<no-update>": {
		"renderer": "./preserve-tag.js",
		"@id": "string",
		"@if": "expression",
		"@body-only": "expression",
		"autocomplete": []
	},
	"<widget-types>": {
		"code-generator": "./widget-types-tag.js",
		"@*": "string",
		"autocomplete": [],
		"deprecated": true
	},
	"<body>": {
		"transformer": "./body-transformer.js"
	},
	"transformer": "./components-transformer.js"
};

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__filename) {__webpack_require__(190);

const nodePath = __webpack_require__(2);
const fs = __webpack_require__(8);
const nodeRequire = __webpack_require__(175);

var compiler;
var marko;
var runtime;
var components;

var modifiedId = 1;
var HOT_RELOAD_KEY = Symbol('HOT_RELOAD');

function cleaResolvePathCache() {
    var modulePathCache = __webpack_require__(72).Module._pathCache;
    if (!modulePathCache) {
        console.log('[marko/hot-reload] WARNING: Missing: require("module").Module._pathCache [' + __filename + ']');
        return;
    }

    var keys = Object.keys(modulePathCache);
    keys.forEach(function(key) {
        delete modulePathCache[key];
    });
}

function tryReloadTemplate(path) {
    path = path.replace(/\.js$/, '');

    try {
        return marko.load(path);
    } catch(e) {
        return undefined;
    }
}

exports.enable = function() {
    if (runtime.__hotReloadEnabled) {
        // Marko has already been monkey-patched. Nothing to do!
        return;
    }

    runtime.__hotReloadEnabled = true;

    // We set an environment variable so that _all_ marko modules
    // installed in the project will have hot reload enabled.
    process.env.MARKO_HOT_RELOAD = 'true';

    function createHotReloadProxy(func, template, methodName) {
        var hotReloadData = template[HOT_RELOAD_KEY];
        if (!hotReloadData) {
            hotReloadData = template[HOT_RELOAD_KEY] = {
                modifiedId: modifiedId,
                latest: template,
                originals: {}
            };
        }

        hotReloadData.originals[methodName] = func;

        var templatePath = template.path;

        function hotReloadProxy() {
            if (hotReloadData.modifiedId !== modifiedId) {
                hotReloadData.modifiedId = modifiedId;
                hotReloadData.latest = tryReloadTemplate(templatePath) || template;

                if (hotReloadData.latest !== template) {
                    template.meta = hotReloadData.latest.meta;
                    console.log('[marko/hot-reload] Template successfully reloaded: ' + templatePath);
                }
            }

            var latest = hotReloadData.latest;
            var originals = latest[HOT_RELOAD_KEY] && latest[HOT_RELOAD_KEY].originals;
            if (!originals) {
                originals = latest;
            }

            var targetFunc = originals._;
            return targetFunc.apply(latest, arguments);
        }

        return hotReloadProxy;
    }

    var oldCreateTemplate = runtime.t;

    runtime.t = function hotReloadCreateTemplate(path) {
        var originalTemplate = oldCreateTemplate.apply(runtime, arguments);
        var actualRenderFunc;

        Object.defineProperty(originalTemplate, '_', {
            get: function() {
                return actualRenderFunc;
            },

            set: function(renderFunc) {
                actualRenderFunc = createHotReloadProxy(renderFunc, originalTemplate, '_');
            }
        });

        return originalTemplate;
    };
};

/**
 * Checks whether a path ends with a custom Marko extension
 */
function _endsWithMarkoExtension(path, requireExtensions) {
    for (var i = 0; i < requireExtensions.length; i++) {
        if (path.endsWith(requireExtensions[i])) {
            return true;
        }
    }
    return false;
}

function normalizeExtension(extension) {
    if (extension.charAt(0) !== '.') {
        extension = '.' + extension;
    }
    return extension;
}

exports.handleFileModified = function(path, options) {
    if (!fs.existsSync(path)) {
        console.log('[marko/hot-reload] WARNING cannot resolve template path: ', path);
        return;
    }

    options = options || {};

    // Default hot-reloaded extensions
    var requireExtensions = ['.marko', '.marko.html', '.marko.xml'];

    if (options.extension) {
        requireExtensions.push(options.extension);
    }

    if (options.extensions) {
        requireExtensions = requireExtensions.concat(options.extensions);
    }

    var nodeRequireExtensions = nodeRequire.getExtensions();
    if (nodeRequireExtensions) {
        requireExtensions = requireExtensions.concat(nodeRequireExtensions);
    }

    for (var i = 0; i < requireExtensions.length; i++) {
        requireExtensions[i] = normalizeExtension(requireExtensions[i]);
    }

    var basename = nodePath.basename(path);

    function handleFileModified() {
        console.log('[marko/hot-reload] File modified: ' + path);
        runtime.cache = {};
        compiler.clearCaches();
        cleaResolvePathCache();
        modifiedId++;
    }

    if (basename === 'marko-tag.json' || basename === 'marko.json') {
        handleFileModified();
        // If we taglib was modified then uncache *all* templates so that they will
        // all be reloaded
        Object.keys(__webpack_require__.c).forEach((filename) => {
            if (filename.endsWith('.marko') || filename.endsWith('.marko.js')) {
                delete __webpack_require__.c[filename];
            }
        });
    } else if (_endsWithMarkoExtension(path, requireExtensions)) {
        handleFileModified();
        delete __webpack_require__.c[path];
        delete __webpack_require__.c[path + '.js'];
    } else if (basename === 'component.js') {
        handleFileModified();
        var dir = nodePath.dirname(path);
        var templatePath = nodePath.join(dir, 'index.marko');
        delete __webpack_require__.c[path];
        delete __webpack_require__.c[templatePath];
        delete __webpack_require__.c[templatePath + '.js'];
    }
};

compiler = __webpack_require__(14);
marko = __webpack_require__(185);
runtime = __webpack_require__(60);
components = __webpack_require__(53);
/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(60);

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var defaultResolveFrom = __webpack_require__(21);
var env = process.env.NODE_ENV;
var production = !env || env !== 'development';

function getDeps(template, context) {
    if (!template.meta && template.template) {
        template = template.template;
    }

    if (typeof template.createOut !== 'function') {
        return [];
    }

    if (production && template.deps) {
        return template.deps;
    }

    var deps = template.deps = [];

    if (!template.meta) {
        console.error('Metadata not set for template at ', template.path);
        return [];
    }

    var meta = template.meta;
    var root = path.dirname(template.path);


    if (meta.tags) {
        meta.tags.forEach(tagPath => {
            var resolveFrom = context.resolveFrom || defaultResolveFrom;
            var tag = resolveFrom(root, tagPath);
            var ext = path.extname(tag);
            var req = context.require || !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());

            try {
                tag = req.resolve(tag.slice(0, 0 - ext.length) + '.js');
            } catch(e) {}

            var tagDeps = getDeps(req(tag), context);
            deps.push.apply(deps, tagDeps);
        });
    }

    if (meta.deps) {
        deps.push.apply(deps, meta.deps.map(d => resolveDep(d, root, context)));
    }

    template.deps = dedupeDeps(deps);

    return deps;
}

function resolveDep(dep, root, context) {
    if (typeof dep === 'string') {
        dep = parseDependencyString(dep);
    }

    if (dep.path) {
        var resolveFrom = (context && context.resolveFrom) || defaultResolveFrom;
        dep.path = resolveFrom(root, dep.path);

        if(dep.path && !dep.type) {
            dep.type = dep.path.slice(dep.path.lastIndexOf('.')+1);
        }
    }

    if (dep.virtualPath) {
        dep.virtualPath = path.resolve(root, dep.virtualPath);
    }

    return dep;
}

function parseDependencyString(string) {
    var match = /^(?:([\w-]+)(?:\:\s*|\s+))?(.*?(?:\.(\w+))?)$/.exec(string);
    return {
        type: match[1] || match[3],
        path: match[2]
    };
}

function dedupeDeps(deps) {
    return deps;
}

function patch(Template) {
    Template.prototype.getDependencies = function(context) {
        context = context || {};

        return getDeps(this, context);
    };
}

exports.getDeps = getDeps;
exports.resolveDep = resolveDep;
exports.patch = patch;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var escape = __webpack_require__(33);
var escapeString = escape.escapeString;
var escapeXmlAttr = escape.escapeXmlAttr;

var stringifiedAttrTest = /[&\'\n]/;
var stringifiedAttrReplace = /[&\'\n]/g;

function attr(name, value, shouldEscape) {
    shouldEscape = shouldEscape !== false;
    var type = typeof value;

    if (type === 'string') {
        return ' ' + name + '="' + (shouldEscape ? escapeXmlAttr(value) : value) + '"';
    } else if (value === true) {
        return ' ' + name;
    } else if (value == null || value === false) {
        return '';
    } else if (type === 'object') {
        value = JSON.stringify(value);
        if (shouldEscape) {
            value = escapeString(value, stringifiedAttrTest, stringifiedAttrReplace);
        }

        return ' ' + name + "='" + value + "'";
    } else {
        return ' ' + name + '=' + value; // number (doesn't need quotes)
    }
}

module.exports = attr;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var attrHelper = __webpack_require__(58);

function attrs(arg) {
    if (typeof arg === 'object') {
        var out = '';
        for (var attrName in arg) {
            out += attrHelper(attrName, arg[attrName]);
        }
        return out;
    } else if (typeof arg === 'string') {
        return arg;
    }
    return '';
}

module.exports = attrs;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(30);

var AsyncStream = __webpack_require__(31);
var Template = __webpack_require__(32);

/**
 * Method is for internal usage only. This method
 * is invoked by code in a compiled Marko template and
 * it is used to create a new Template instance.
 * @private
 */
exports.t = function createTemplate(path) {
     return new Template(path);
};

function createOut(globalData, parent, state, buffer) {
    return new AsyncStream(globalData, parent, state, buffer);
}

exports.createWriter = function(writer) {
    return new AsyncStream(null, writer);
};

exports.Template = Template;
exports.$__createOut = createOut;
exports.AsyncStream = AsyncStream;
exports.enableAsyncStackTrace = AsyncStream.enableAsyncStackTrace;

__webpack_require__(29).$__setCreateOut(createOut);

/***/ }),
/* 61 */
/***/ (function(module, exports) {

module.exports = {
	"<await>": {
		"renderer": "./await-tag",
		"@_var": "identifier",
		"@_dataProvider": "expression",
		"@arg": {
			"type": "expression",
			"preserve-name": true
		},
		"@arg-*": {
			"pattern": true,
			"type": "string",
			"preserve-name": true
		},
		"@method": "string",
		"@timeout": "integer",
		"@timeout-message": "string",
		"@error-message": "string",
		"@placeholder": "string",
		"@renderTimeout": "function",
		"@renderError": "function",
		"@renderPlaceholder": "function",
		"@name": {
			"type": "string",
			"description": "Name of await",
			"autocomplete": [
				{
					"snippet": "name=\"${1:name}\""
				},
				{}
			]
		},
		"@_name": "string",
		"@client-reorder": {
			"type": "boolean",
			"description": "Use JavaScript on client to move async fragment into the proper place."
		},
		"@scope": {
			"type": "expression",
			"description": "The value of 'this' when invoking the data provider function (N/A with promises)"
		},
		"@show-after": {
			"type": "string"
		},
		"vars": [
			{
				"name-from-attribute": "_var"
			}
		],
		"transformer": "./await-tag-transformer",
		"autocomplete": [
			{
				"snippet": "await(${1:varName} from ${2:data.myDataProvider})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/async-taglib/#<code>&ltawait><code>"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/async-taglib/#<code>&ltawait><code>"
			}
		]
	},
	"<await-reorderer>": {
		"renderer": "./await-reorderer-tag",
		"autocomplete": [
			{
				"snippet": "await-reorderer",
				"descriptionMoreURL": "http://markojs.com/docs/marko/async-taglib/#<code>&ltawait-reorderer><code>"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/async-taglib/#<code>&ltawait-reorderer><code>"
			}
		]
	},
	"<await-placeholder>": {
		"transformer": "./await-nested-tag-transformer",
		"autocomplete": [
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/async-taglib/#<code>&ltawait-placeholder><code>"
			}
		]
	},
	"<await-timeout>": {
		"transformer": "./await-nested-tag-transformer",
		"autocomplete": [
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/async-taglib/#<code>&ltawait-timeout><code>"
			}
		]
	},
	"<await-error>": {
		"transformer": "./await-nested-tag-transformer",
		"autocomplete": [
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/async-taglib/#<code>&ltawait-error><code>"
			}
		]
	},
	"<async-fragment>": {
		"transformer": {
			"path": "./async-fragment-to-await-transformer",
			"priority": -1
		},
		"deprecated": true
	},
	"<async-fragments>": {
		"transformer": {
			"path": "./async-fragment-to-await-transformer",
			"priority": -1
		},
		"deprecated": true
	},
	"<async-fragment-placeholder>": {
		"transformer": {
			"path": "./async-fragment-to-await-transformer",
			"priority": -1
		},
		"deprecated": true
	},
	"<async-fragment-timeout>": {
		"transformer": {
			"path": "./async-fragment-to-await-transformer",
			"priority": -1
		},
		"deprecated": true
	},
	"<async-fragment-error>": {
		"transformer": {
			"path": "./async-fragment-to-await-transformer",
			"priority": -1
		},
		"deprecated": true
	}
};

/***/ }),
/* 62 */
/***/ (function(module, exports) {

module.exports = {
	"<cached-fragment>": {
		"renderer": "./cached-fragment-tag",
		"@cache-key": "string",
		"@cache-name": "string",
		"@cache-manager": "string",
		"transformer": "./cached-fragment-tag-transformer.js"
	}
};

/***/ }),
/* 63 */
/***/ (function(module, exports) {

module.exports = {
	"<assign>": {
		"code-generator": "./assign-tag",
		"open-tag-only": true,
		"deprecated": true
	},
	"<class>": {
		"code-generator": "./class-tag"
	},
	"<else>": {
		"node-factory": "./else-tag",
		"attributes": {},
		"autocomplete": [
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
			}
		]
	},
	"<else-if>": {
		"node-factory": "./else-if-tag",
		"attributes": {},
		"autocomplete": [
			{
				"snippet": "else-if(${1:condition})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
			},
			{
				"snippet": "else-if",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
			}
		]
	},
	"<for>": {
		"code-generator": "./for-tag",
		"attributes": {},
		"autocomplete": [
			{
				"snippet": "for(${1:var} in ${2:array})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#for"
			},
			{
				"snippet": "for(${1:var} in ${2:array}) | status-var=${3:loop}",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#loop-status-variable"
			},
			{
				"snippet": "for(${1:name},${2:value} in ${3:object})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#property-looping"
			},
			{
				"snippet": "for(${1:init}; ${2:test}; ${3:update})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#native-javascript-for-loop"
			},
			{
				"snippet": "for(${1:var} from ${2:start} to ${3:end})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#range-looping"
			},
			{
				"snippet": "for",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#for"
			}
		]
	},
	"<if>": {
		"node-factory": "./if-tag",
		"attributes": {},
		"autocomplete": [
			{
				"snippet": "if(${1:condition})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
			}
		]
	},
	"<import>": {
		"code-generator": "./import-tag",
		"parse-options": {
			"relaxRequireCommas": true
		}
	},
	"<include>": {
		"renderer": "./include-tag",
		"transformer": "./include-tag-transformer",
		"autocomplete": [
			{
				"displayText": "include(<template>)",
				"snippet": "include(${1:\"./target.marko\"})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
			}
		]
	},
	"<include-html>": {
		"code-generator": "./include-html-tag",
		"autocomplete": [
			{
				"displayText": "include-html(<path>)",
				"snippet": "include-html(${1:\"./foo.html\"})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
			}
		]
	},
	"<include-text>": {
		"code-generator": "./include-text-tag",
		"autocomplete": [
			{
				"displayText": "include-text(<path>)",
				"snippet": "include-text(${1:\"./foo.txt\"})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
			}
		]
	},
	"<invoke>": {
		"code-generator": "./invoke-tag",
		"deprecated": true
	},
	"<macro>": {
		"node-factory": "./macro-tag",
		"autocomplete": [
			{
				"displayText": "macro <name>(<parmas>)",
				"snippet": "macro ${1:name}(${2:param1, param2})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#macros"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#macros"
			}
		]
	},
	"<macro-body>": {
		"code-generator": "./macro-body-tag",
		"autocomplete": [
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#macros",
				"openTagOnly": true
			}
		]
	},
	"<marko>": {
		"code-generator": "./marko-tag",
		"open-tag-only": true,
		"@no-browser-rerender": "boolean"
	},
	"<marko-preserve-whitespace>": {
		"code-generator": "./marko-preserve-whitespace-tag",
		"preserve-whitespace": true,
		"autocomplete": [
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#whitespace"
			}
		]
	},
	"<static>": {
		"code-generator": "./static-tag",
		"parse-options": {
			"ignoreAttributes": true
		}
	},
	"<unless>": {
		"node-factory": "./unless-tag",
		"autocomplete": [
			{
				"snippet": "unless(${1:condition})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#unlesselse-ifelse"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#unlesselse-ifelse"
			}
		]
	},
	"<var>": {
		"node-factory": "./var-tag",
		"deprecated": true
	},
	"<while>": {
		"code-generator": "./while-tag",
		"autocomplete": [
			{
				"snippet": "while(${1:condition})",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#looping"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#looping"
			}
		]
	},
	"<*>": {
		"@body-only-if": {
			"type": "statement",
			"autocomplete": [
				{
					"snippet": "body-only-if(${1:condition})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#body-only-if"
				},
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#body-only-if"
				}
			]
		},
		"@if": {
			"type": "statement",
			"autocomplete": [
				{
					"snippet": "if(${1:condition})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
				},
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
				}
			]
		},
		"@else-if": {
			"type": "statement",
			"autocomplete": [
				{
					"snippet": "else-if(${1:condition})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
				},
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#ifelse-ifelse"
				}
			]
		},
		"@else": "statement",
		"@for": {
			"type": "statement",
			"autocomplete": [
				{
					"snippet": "for(${1:var} in ${2:array})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#for"
				},
				{
					"snippet": "for(${1:var} in ${2:array}) | status-var=${3:loop}",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#loop-status-variable"
				},
				{
					"snippet": "for(${1:name},${2:value} in ${3:object})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#property-looping"
				},
				{
					"snippet": "for(${1:init}; ${2:test}; ${3:update})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#native-javascript-for-loop"
				},
				{
					"snippet": "for(${1:var} from ${2:start} to ${3:end})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#range-looping"
				},
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#for"
				}
			]
		},
		"@include": {
			"autocomplete": [
				{
					"displayText": "include(<template>)",
					"snippet": "include(${1:\"./target.marko\"})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
				},
				{
					"displayText": "include(data.renderBody)",
					"snippet": "include(data.renderBody)",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
				},
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#includes"
				}
			]
		},
		"@unless": {
			"type": "statement",
			"autocomplete": [
				{
					"snippet": "unless(${1:condition})"
				}
			]
		},
		"@while": {
			"type": "statement",
			"autocomplete": [
				{
					"snippet": "while(${1:condition})",
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#looping"
				},
				{
					"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#looping"
				}
			]
		},
		"transformer": {
			"path": "./core-transformer",
			"priority": 0
		}
	}
};

/***/ }),
/* 64 */
/***/ (function(module, exports) {

module.exports = {
	"taglib-id": "marko-html",
	"<html-comment>": {
		"renderer": "./html-comment-tag.js",
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<a>": {
		"@href": "#html-href",
		"@hreflang": "#html-hreflang",
		"@media": "#html-media",
		"@rel": "#html-rel",
		"@target": "#html-target",
		"@type": "#html-type",
		"html": true,
		"autocomplete": [
			{},
			{
				"displayText": "a href=\"\"",
				"snippet": "a href=\"${1:#}\""
			},
			{
				"snippet": "a name=\"${1:name}\""
			},
			{
				"displayText": "a href=\"mailto:\"",
				"snippet": "a href=\"mailto:${1:joe@example.com}?subject=${2:feedback}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<abbr>": {
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "abbr title=\"$1\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<address>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<area>": {
		"@alt": "#html-alt",
		"@coords": "#html-coords",
		"@href": "#html-href",
		"@hreflang": "#html-hreflang",
		"@media": "#html-media",
		"@rel": "#html-rel",
		"@shape": "#html-shape",
		"@target": "#html-target",
		"@type": "#html-type",
		"html": true,
		"autocomplete": [
			{},
			{
				"displayText": "area shape=\"\" coords=\"\" href=\"\"",
				"snippet": "area ${1:shape=\"${2:default}\"} coords=\"$3\" ${4:href=\"${5:#}\"}"
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<article>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<aside>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<audio>": {
		"@autoplay": "#html-autoplay",
		"@controls": "#html-controls",
		"@loop": "#html-loop",
		"@mediagroup": "#html-mediagroup",
		"@muted": "#html-muted",
		"@preload": "#html-preload",
		"@src": "#html-src",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "audio src=\"$1\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<b>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<base>": {
		"@href": "#html-href",
		"@target": "#html-target",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "base href=\"${1:#}\" target=\"${2:_blank}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<bdi>": {
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "bdi dir=\"${1:auto}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<bdo>": {
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "bdo dir=\"${1:auto}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<blockquote>": {
		"@cite": "#html-cite",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "blockquote cite=\"${1:http://}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<body>": {
		"@onafterprint": "#html-onafterprint",
		"@onbeforeprint": "#html-onbeforeprint",
		"@onbeforeunload": "#html-onbeforeunload",
		"@onhashchange": "#html-onhashchange",
		"@onmessage": "#html-onmessage",
		"@onoffline": "#html-onoffline",
		"@ononline": "#html-ononline",
		"@onpagehide": "#html-onpagehide",
		"@onpageshow": "#html-onpageshow",
		"@onpopstate": "#html-onpopstate",
		"@onredo": "#html-onredo",
		"@onresize": "#html-onresize",
		"@onstorage": "#html-onstorage",
		"@onundo": "#html-onundo",
		"@onunload": "#html-onunload",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<br>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<button>": {
		"@autofocus": "#html-autofocus",
		"@disabled": "#html-disabled",
		"@form": "#html-form",
		"@formaction": "#html-formaction",
		"@formenctype": "#html-formenctype",
		"@formmethod": "#html-formmethod",
		"@formnovalidate": "#html-formnovalidate",
		"@formtarget": "#html-formtarget",
		"@name": "#html-name",
		"@type": "#html-type",
		"@value": "#html-value",
		"html": true,
		"autocomplete": [
			{},
			{
				"displayText": "button type=\"button\"",
				"snippet": "button type=\"${1:button}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<canvas>": {
		"@height": "#html-height",
		"@width": "#html-width",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "canvas id=\"${1:canvas}\" width=\"${2:300}\" height=\"${3:300}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<caption>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<cite>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<code>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<col>": {
		"@span": "#html-span",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<colgroup>": {
		"@span": "#html-span",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<command>": {
		"@checked": "#html-checked",
		"@disabled": "#html-disabled",
		"@icon": "#html-icon",
		"@label": "#html-label",
		"@radiogroup": "#html-radiogroup",
		"@type": "#html-type",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<datalist>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<dd>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<del>": {
		"@cite": "#html-cite",
		"@datetime": "#html-datetime",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<details>": {
		"@open": "#html-open",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<dfn>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<div>": {
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "div class=\"$2\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<dl>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<dt>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<em>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<embed>": {
		"@height": "#html-height",
		"@src": "#html-src",
		"@type": "#html-type",
		"@width": "#html-width",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "embed type=\"${1:video/quicktime}\" src=\"${2:#}\" width=\"${3:300}\" height=\"${4:300}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<fieldset>": {
		"@disabled": "#html-disabled",
		"@form": "#html-form",
		"@name": "#html-name",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<figcaption>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<figure>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<footer>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<form>": {
		"@accept-charset": "#html-accept-charset",
		"@action": "#html-action",
		"@autocomplete": "#html-autocomplete",
		"@enctype": "#html-enctype",
		"@method": "#html-method",
		"@name": "#html-name",
		"@novalidate": "#html-novalidate",
		"@target": "#html-target",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "form class=\"$1\" action=\"${2:index.html}\" method=\"${3:post}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<h1>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<h2>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<h3>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<h4>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<h5>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<h6>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<head>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<header>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<hgroup>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<hr>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<html>": {
		"@manifest": "#html-manifest",
		"@xml:lang": "#html-xml:lang",
		"@xmlns": "#html-xmlns",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "!DOCTYPE html"
			},
			{
				"displayText": "HTML page",
				"snippet": "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"UTF-8\">\n\t\t<title>${1:title}</title>\n\t</head>\n\t<body>\n\t\t$2\n\t</body>\n</html>\n"
			},
			{
				"displayText": "HTML page (concise)",
				"snippet": "<!DOCTYPE html>\nhtml lang=\"en\"\n\thead\n\t\tmeta charset=\"UTF-8\"\n\t\t<title>${1:title}</title>\n\tbody\n\t\t$2\n"
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<i>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<iframe>": {
		"@height": "#html-height",
		"@name": "#html-name",
		"@sandbox": "#html-sandbox",
		"@seamless": "#html-seamless",
		"@src": "#html-src",
		"@srcdoc": "#html-srcdoc",
		"@width": "#html-width",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "iframe src=\"$1\" width=\"$2\" height=\"$3\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<img>": {
		"@alt": "#html-alt",
		"@height": "#html-height",
		"@ismap": "#html-ismap",
		"@longdesc": "#html-longdesc",
		"@src": "#html-src",
		"@usemap": "#html-usemap",
		"@width": "#html-width",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "img src=\"$1\" alt=\"$2\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<input>": {
		"@accept": "#html-accept",
		"@alt": "#html-alt",
		"@autocomplete": "#html-autocomplete",
		"@autofocus": "#html-autofocus",
		"@checked": "#html-checked",
		"@dirname": "#html-dirname",
		"@disabled": "#html-disabled",
		"@form": "#html-form",
		"@formaction": "#html-formaction",
		"@formenctype": "#html-formenctype",
		"@formmethod": "#html-formmethod",
		"@formnovalidate": "#html-formnovalidate",
		"@formtarget": "#html-formtarget",
		"@height": "#html-height",
		"@list": "#html-list",
		"@max": "#html-max",
		"@maxlength": "#html-maxlength",
		"@min": "#html-min",
		"@multiple": "#html-multiple",
		"@name": "#html-name",
		"@pattern": "#html-pattern",
		"@placeholder": "#html-placeholder",
		"@readonly": "#html-readonly",
		"@required": "#html-required",
		"@size": "#html-size",
		"@src": "#html-src",
		"@step": "#html-step",
		"@type": "#html-type",
		"@value": "#html-value",
		"@width": "#html-width",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "input type=\"${1}\" name=\"${2:name}\" value=\"$3\"",
				"triggerAutocompleteAfterInsert": true
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<ins>": {
		"@cite": "#html-cite",
		"@datetime": "#html-datetime",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<kbd>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<keygen>": {
		"@autofocus": "#html-autofocus",
		"@challenge": "#html-challenge",
		"@disabled": "#html-disabled",
		"@form": "#html-form",
		"@keytype": "#html-keytype",
		"@name": "#html-name",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "keygen name=\"${1:name}\" challenge=\"${2:string}\" keytype=\"${3:RSA}\" keyparams=\"${4:medium}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<label>": {
		"@for": "#html-for",
		"@form": "#html-form",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "label${1: for=\"$2\"}"
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<legend>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<li>": {
		"@value": "#html-value",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<link>": {
		"@disabled": "#html-disabled",
		"@href": "#html-href",
		"@hreflang": "#html-hreflang",
		"@media": "#html-media",
		"@rel": "#html-rel",
		"@sizes": "#html-sizes",
		"@type": "#html-type",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "link rel=\"${1:stylesheet}\" href=\"${2:/css/master.css}\" media=\"${3:screen}\" title=\"${4:no title}\" charset=\"${5:utf-8}\""
			},
			{
				"snippet": "link rel=\"icon\" href=\"$1.ico\""
			},
			{
				"snippet": "link rel=\"import\" href=\"$1\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<map>": {
		"@name": "#html-name",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<mark>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<menu>": {
		"@label": "#html-label",
		"@type": "#html-type",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<meta>": {
		"@charset": "#html-charset",
		"@content": "#html-content",
		"@http-equiv": "#html-http-equiv",
		"@name": "#html-name",
		"html": true,
		"autocomplete": [
			{
				"snippet": "meta name=\"${1:name}\" content=\"${2:content}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<meter>": {
		"@form": "#html-form",
		"@high": "#html-high",
		"@low": "#html-low",
		"@max": "#html-max",
		"@min": "#html-min",
		"@optimum": "#html-optimum",
		"@value": "#html-value",
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "meter min=\"${1:200}\" max=\"${2:500}\" value=\"${3:350}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<nav>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<noscript>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<object>": {
		"@archive": "#html-archive",
		"@codebase": "#html-codebase",
		"@codetype": "#html-codetype",
		"@data": "#html-data",
		"@declare": "#html-declare",
		"@form": "#html-form",
		"@height": "#html-height",
		"@name": "#html-name",
		"@standby": "#html-standby",
		"@type": "#html-type",
		"@usemap": "#html-usemap",
		"@width": "#html-width",
		"html": true,
		"autocomplete": [
			{
				"snippet": "object data=\"${1:http://}\" type=\"${2:mimetype}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<ol>": {
		"@reversed": "#html-reversed",
		"@start": "#html-start",
		"@type": "#html-type",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<optgroup>": {
		"@disabled": "#html-disabled",
		"@label": "#html-label",
		"html": true,
		"autocomplete": [
			{
				"snippet": "optgroup label=\"${1:Group 1}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<option>": {
		"@disabled": "#html-disabled",
		"@label": "#html-label",
		"@selected": "#html-selected",
		"@value": "#html-value",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<output>": {
		"@for": "#html-for",
		"@form": "#html-form",
		"@name": "#html-name",
		"html": true,
		"autocomplete": [
			{
				"snippet": "output name=\"${1:result}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<p>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<param>": {
		"@name": "#html-name",
		"@value": "#html-value",
		"html": true,
		"autocomplete": [
			{
				"snippet": "param name=\"${1:foo}\" value=\"${2:bar}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<picture>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<pre>": {
		"preserve-whitespace": true,
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<progress>": {
		"@form": "#html-form",
		"@max": "#html-max",
		"@value": "#html-value",
		"html": true,
		"autocomplete": [
			{
				"snippet": "progress value=\"${1:50}\" max=\"${2:100}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<q>": {
		"@cite": "#html-cite",
		"html": true,
		"autocomplete": [
			{
				"snippet": "q cite=\"$1\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<rp>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<rt>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<ruby>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<s>": {
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<samp>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<script>": {
		"preserve-whitespace": true,
		"@marko-init": "boolean",
		"@template-helpers": "boolean",
		"@*": {
			"ignore": true
		},
		"autocomplete": [
			{
				"snippet": "script template-helpers",
				"descriptionMoreURL": "http://markojs.com/docs/marko/language-guide/#helpers"
			}
		],
		"@async": "#html-async",
		"@charset": "#html-charset",
		"@defer": "#html-defer",
		"@src": "#html-src",
		"@type": "#html-type",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<section>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<select>": {
		"@autofocus": "#html-autofocus",
		"@disabled": "#html-disabled",
		"@form": "#html-form",
		"@multiple": "#html-multiple",
		"@name": "#html-name",
		"@required": "#html-required",
		"@size": "#html-size",
		"html": true,
		"autocomplete": [
			{
				"snippet": "select class=\"$1\" name=\"$2\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<small>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<source>": {
		"@media": "#html-media",
		"@src": "#html-src",
		"@type": "#html-type",
		"html": true,
		"autocomplete": [
			{
				"snippet": "source src=\"${1:http://}\" type=\"${2:mimetype}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<span>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<strong>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<style>": {
		"preserve-whitespace": true,
		"@disabled": "#html-disabled",
		"@media": "#html-media",
		"@scoped": "#html-scoped",
		"@type": "#html-type",
		"html": true,
		"autocomplete": [
			{
				"snippet": "style media=\"screen\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<sub>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<summary>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<sup>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<table>": {
		"@border": "#html-border",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<tbody>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<td>": {
		"@colspan": "#html-colspan",
		"@headers": "#html-headers",
		"@rowspan": "#html-rowspan",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<textarea>": {
		"preserve-whitespace": true,
		"@autofocus": "#html-autofocus",
		"@cols": "#html-cols",
		"@dirname": "#html-dirname",
		"@disabled": "#html-disabled",
		"@form": "#html-form",
		"@label": "#html-label",
		"@maxlength": "#html-maxlength",
		"@name": "#html-name",
		"@placeholder": "#html-placeholder",
		"@readonly": "#html-readonly",
		"@required": "#html-required",
		"@rows": "#html-rows",
		"@wrap": "#html-wrap",
		"html": true,
		"autocomplete": [
			{
				"snippet": "textarea name=\"${1:name}\" rows=\"${2:8}\" cols=\"${3:40}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<tfoot>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<th>": {
		"@colspan": "#html-colspan",
		"@headers": "#html-headers",
		"@rowspan": "#html-rowspan",
		"@scope": "#html-scope",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<thead>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<time>": {
		"@datetime": "#html-datetime",
		"@pubdate": "#html-pubdate",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<title>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<tr>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<track>": {
		"@default": "#html-default",
		"@kind": "#html-kind",
		"@label": "#html-label",
		"@src": "#html-src",
		"@srclang": "#html-srclang",
		"html": true,
		"autocomplete": [
			{
				"snippet": "track kind=\"${1:subtitles}\" src=\"${2:sampleSubtitles_en.srt}\" srclang=\"${3:en}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<u>": {
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<ul>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<video>": {
		"@autoplay": "#html-autoplay",
		"@controls": "#html-controls",
		"@height": "#html-height",
		"@loop": "#html-loop",
		"@mediagroup": "#html-mediagroup",
		"@muted": "#html-muted",
		"@poster": "#html-poster",
		"@preload": "#html-preload",
		"@src": "#html-src",
		"@width": "#html-width",
		"html": true,
		"autocomplete": [
			{
				"displayText": "video src=\"\" autoplay poster=\"\"",
				"snippet": "video src=\"${1:videofile.ogg}\" ${2:autoplay} ${3:poster=\"${4:posterimage.jpg}\"}"
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<wbr>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"attribute-groups": {
		"html-attributes": {
			"*": "string",
			"accesskey": {
				"html": true
			},
			"class": {
				"type": "cssStyle",
				"html": true
			},
			"contenteditable": {
				"type": "boolean",
				"html": true
			},
			"contextmenu": {
				"html": true
			},
			"dir": {
				"enum": [
					"ltr",
					"rtl"
				],
				"html": true
			},
			"draggable": {
				"enum": [
					"auto",
					"false",
					"true"
				],
				"html": true
			},
			"dropzone": {
				"enum": [
					"copy",
					"move",
					"link"
				],
				"html": true
			},
			"hidden": {
				"enum": [
					"hidden"
				],
				"html": true
			},
			"id": {
				"type": "cssId",
				"html": true
			},
			"lang": {
				"enum": [
					"ab",
					"aa",
					"af",
					"sq",
					"am",
					"ar",
					"an",
					"hy",
					"as",
					"ay",
					"az",
					"ba",
					"eu",
					"bn",
					"dz",
					"bh",
					"bi",
					"br",
					"bg",
					"my",
					"be",
					"km",
					"ca",
					"zh",
					"co",
					"hr",
					"cs",
					"da",
					"nl",
					"en",
					"eo",
					"et",
					"fo",
					"fa",
					"fi",
					"fr",
					"fy",
					"gl",
					"gd",
					"gv",
					"ka",
					"de",
					"el",
					"kl",
					"gn",
					"gu",
					"ht",
					"ha",
					"he",
					"hi",
					"hu",
					"is",
					"io",
					"id",
					"ia",
					"ie",
					"iu",
					"ik",
					"ga",
					"it",
					"ja",
					"jv",
					"kn",
					"ks",
					"kk",
					"rw",
					"ky",
					"rn",
					"ko",
					"ku",
					"lo",
					"la",
					"lv",
					"li",
					"ln",
					"lt",
					"mk",
					"mg",
					"ms",
					"ml",
					"mt",
					"mi",
					"mr",
					"mo",
					"mn",
					"na",
					"ne",
					"no",
					"oc",
					"or",
					"om",
					"ps",
					"pl",
					"pt",
					"pa",
					"qu",
					"rm",
					"ro",
					"ru",
					"sz",
					"sm",
					"sg",
					"sa",
					"sr",
					"sh",
					"st",
					"tn",
					"sn",
					"ii",
					"sd",
					"si",
					"ss",
					"sk",
					"sl",
					"so",
					"es",
					"su",
					"sw",
					"sv",
					"tl",
					"tg",
					"ta",
					"tt",
					"te",
					"th",
					"bo",
					"ti",
					"to",
					"ts",
					"tr",
					"tk",
					"tw",
					"ug",
					"uk",
					"ur",
					"uz",
					"vi",
					"vo",
					"wa",
					"cy",
					"wo",
					"xh",
					"yi",
					"yo",
					"zu"
				],
				"html": true
			},
			"role": {
				"enum": [
					"alert",
					"alertdialog",
					"article",
					"application",
					"banner",
					"button",
					"checkbox",
					"columnheader",
					"combobox",
					"complementary",
					"contentinfo",
					"definition",
					"directory",
					"dialog",
					"document",
					"form",
					"grid",
					"gridcell",
					"group",
					"heading",
					"img",
					"link",
					"list",
					"listbox",
					"listitem",
					"log",
					"main",
					"marquee",
					"math",
					"menu",
					"menubar",
					"menuitem",
					"menuitemcheckbox",
					"menuitemradio",
					"navigation",
					"note",
					"option",
					"presentation",
					"progressbar",
					"radio",
					"radiogroup",
					"region",
					"row",
					"rowgroup",
					"rowheader",
					"scrollbar",
					"search",
					"separator",
					"slider",
					"spinbutton",
					"status",
					"tab",
					"tablist",
					"tabpanel",
					"textbox",
					"timer",
					"toolbar",
					"tooltip",
					"tree",
					"treegrid",
					"treeitem"
				],
				"html": true
			},
			"spellcheck": {
				"type": "boolean",
				"html": true
			},
			"style": {
				"type": "style",
				"html": true
			},
			"tabindex": {
				"html": true
			},
			"title": {
				"html": true
			},
			"onabort": {
				"html": true
			},
			"onblur": {
				"html": true
			},
			"oncanplay": {
				"html": true
			},
			"oncanplaythrough": {
				"html": true
			},
			"onchange": {
				"html": true
			},
			"onclick": {
				"html": true
			},
			"oncontextmenu": {
				"html": true
			},
			"oncuechange": {
				"html": true
			},
			"ondblclick": {
				"html": true
			},
			"ondrag": {
				"html": true
			},
			"ondragend": {
				"html": true
			},
			"ondragenter": {
				"html": true
			},
			"ondragleave": {
				"html": true
			},
			"ondragover": {
				"html": true
			},
			"ondragstart": {
				"html": true
			},
			"ondrop": {
				"html": true
			},
			"ondurationchange": {
				"html": true
			},
			"onemptied": {
				"html": true
			},
			"onended": {
				"html": true
			},
			"onerror": {
				"html": true
			},
			"onfocus": {
				"html": true
			},
			"oninput": {
				"html": true
			},
			"oninvalid": {
				"html": true
			},
			"onkeydown": {
				"html": true
			},
			"onkeypress": {
				"html": true
			},
			"onkeyup": {
				"html": true
			},
			"onload": {
				"html": true
			},
			"onloadeddata": {
				"html": true
			},
			"onloadedmetadata": {
				"html": true
			},
			"onloadstart": {
				"html": true
			},
			"onmousedown": {
				"html": true
			},
			"onmousemove": {
				"html": true
			},
			"onmouseout": {
				"html": true
			},
			"onmouseover": {
				"html": true
			},
			"onmouseup": {
				"html": true
			},
			"onmousewheel": {
				"html": true
			},
			"onpause": {
				"html": true
			},
			"onplay": {
				"html": true
			},
			"onplaying": {
				"html": true
			},
			"onprogress": {
				"html": true
			},
			"onratechange": {
				"html": true
			},
			"onreadystatechange": {
				"html": true
			},
			"onreset": {
				"html": true
			},
			"onscroll": {
				"html": true
			},
			"onseeked": {
				"html": true
			},
			"onseeking": {
				"html": true
			},
			"onselect": {
				"html": true
			},
			"onshow": {
				"html": true
			},
			"onstalled": {
				"html": true
			},
			"onsubmit": {
				"html": true
			},
			"onsuspend": {
				"html": true
			},
			"ontimeupdate": {
				"html": true
			},
			"onvolumechange": {
				"html": true
			},
			"onwaiting": {
				"html": true
			}
		}
	},
	"attributes": {
		"html-accept": {
			"enum": [
				"text/html",
				"text/plain",
				"application/msword",
				"application/msexcel",
				"application/postscript",
				"application/x-zip-compressed",
				"application/pdf",
				"application/rtf",
				"video/x-msvideo",
				"video/quicktime",
				"video/x-mpeg2",
				"audio/x-pn/realaudio",
				"audio/x-mpeg",
				"audio/x-waw",
				"audio/x-aiff",
				"audio/basic",
				"image/tiff",
				"image/jpeg",
				"image/gif",
				"image/x-png",
				"image/x-photo-cd",
				"image/x-MS-bmp",
				"image/x-rgb",
				"image/x-portable-pixmap",
				"image/x-portable-greymap",
				"image/x-portablebitmap"
			],
			"html": true,
			"name": "accept"
		},
		"html-accept-charset": {
			"html": true,
			"name": "accept-charset"
		},
		"html-action": {
			"html": true,
			"name": "action"
		},
		"html-align": {
			"html": true,
			"name": "align"
		},
		"html-alt": {
			"html": true,
			"name": "alt"
		},
		"html-archive": {
			"html": true,
			"name": "archive"
		},
		"html-async": {
			"type": "flag",
			"html": true,
			"name": "async"
		},
		"html-autocomplete": {
			"enum": [
				"off",
				"on"
			],
			"html": true,
			"name": "autocomplete"
		},
		"html-autofocus": {
			"type": "flag",
			"html": true,
			"name": "autofocus"
		},
		"html-autoplay": {
			"type": "flag",
			"html": true,
			"name": "autoplay"
		},
		"html-behavior": {
			"enum": [
				"scroll",
				"slide",
				"alternate"
			],
			"html": true,
			"name": "behavior"
		},
		"html-bgcolor": {
			"type": "color",
			"html": true,
			"name": "bgcolor"
		},
		"html-border": {
			"html": true,
			"name": "border"
		},
		"html-challenge": {
			"html": true,
			"name": "challenge"
		},
		"html-charset": {
			"enum": [
				"iso-8859-1",
				"utf-8",
				"shift_jis",
				"euc-jp",
				"big5",
				"gb2312",
				"euc-kr",
				"din_66003-kr",
				"ns_4551-1-kr",
				"sen_850200_b",
				"csISO2022jp",
				"hz-gb-2312",
				"ibm852",
				"ibm866",
				"irv",
				"iso-2022-kr",
				"iso-8859-2",
				"iso-8859-3",
				"iso-8859-4",
				"iso-8859-5",
				"iso-8859-6",
				"iso-8859-7",
				"iso-8859-8",
				"iso-8859-9",
				"koi8-r",
				"ks_c_5601",
				"windows-1250",
				"windows-1251",
				"windows-1252",
				"windows-1253",
				"windows-1254",
				"windows-1255",
				"windows-1256",
				"windows-1257",
				"windows-1258",
				"windows-874",
				"x-euc",
				"asmo-708",
				"dos-720",
				"dos-862",
				"dos-874",
				"cp866",
				"cp1256"
			],
			"html": true,
			"name": "charset"
		},
		"html-checked": {
			"type": "flag",
			"html": true,
			"name": "checked"
		},
		"html-cite": {
			"html": true,
			"name": "cite"
		},
		"html-codebase": {
			"html": true,
			"name": "codebase"
		},
		"html-codetype": {
			"html": true,
			"name": "codetype"
		},
		"html-cols": {
			"html": true,
			"name": "cols"
		},
		"html-colspan": {
			"html": true,
			"name": "colspan"
		},
		"html-content": {
			"html": true,
			"name": "content"
		},
		"html-controls": {
			"type": "flag",
			"html": true,
			"name": "controls"
		},
		"html-coords": {
			"html": true,
			"name": "coords"
		},
		"html-data": {
			"html": true,
			"name": "data"
		},
		"html-datetime": {
			"html": true,
			"name": "datetime"
		},
		"html-declare": {
			"type": "flag",
			"html": true,
			"name": "declare"
		},
		"html-default": {
			"type": "flag",
			"html": true,
			"name": "default"
		},
		"html-defer": {
			"type": "flag",
			"html": true,
			"name": "defer"
		},
		"html-direction": {
			"enum": [
				"left",
				"right",
				"up",
				"down"
			],
			"html": true,
			"name": "direction"
		},
		"html-dirname": {
			"html": true,
			"name": "dirname"
		},
		"html-disabled": {
			"type": "flag",
			"html": true,
			"name": "disabled"
		},
		"html-enctype": {
			"enum": [
				"application/x-www-form-urlencoded",
				"multipart/form-data",
				"text/plain"
			],
			"html": true,
			"name": "enctype"
		},
		"html-for": {
			"html": true,
			"name": "for"
		},
		"html-form": {
			"html": true,
			"name": "form"
		},
		"html-formaction": {
			"html": true,
			"name": "formaction"
		},
		"html-formenctype": {
			"enum": [
				"application/x-www-form-urlencoded",
				"multipart/form-data",
				"text/plain"
			],
			"html": true,
			"name": "formenctype"
		},
		"html-formmethod": {
			"enum": [
				"get",
				"post"
			],
			"html": true,
			"name": "formmethod"
		},
		"html-formnovalidate": {
			"type": "flag",
			"html": true,
			"name": "formnovalidate"
		},
		"html-formtarget": {
			"enum": [
				"_blank",
				"_parent",
				"_self",
				"_top"
			],
			"html": true,
			"name": "formtarget"
		},
		"html-headers": {
			"html": true,
			"name": "headers"
		},
		"html-height": {
			"html": true,
			"name": "height"
		},
		"html-high": {
			"html": true,
			"name": "high"
		},
		"html-href": {
			"html": true,
			"name": "href"
		},
		"html-hreflang": {
			"html": true,
			"name": "hreflang"
		},
		"html-hspace": {
			"html": true,
			"name": "hspace"
		},
		"html-http-equiv": {
			"enum": [
				"content-type",
				"default-style",
				"refresh"
			],
			"html": true,
			"name": "http-equiv"
		},
		"html-icon": {
			"html": true,
			"name": "icon"
		},
		"html-ismap": {
			"type": "flag",
			"html": true,
			"name": "ismap"
		},
		"html-keytype": {
			"enum": [
				"dsa",
				"ec",
				"rsa"
			],
			"html": true,
			"name": "keytype"
		},
		"html-kind": {
			"enum": [
				"captions",
				"chapters",
				"descriptions",
				"metadata",
				"subtitles"
			],
			"html": true,
			"name": "kind"
		},
		"html-label": {
			"html": true,
			"name": "label"
		},
		"html-list": {
			"html": true,
			"name": "list"
		},
		"html-longdesc": {
			"html": true,
			"name": "longdesc"
		},
		"html-loop": {
			"type": "flag",
			"html": true,
			"name": "loop"
		},
		"html-low": {
			"html": true,
			"name": "low"
		},
		"html-manifest": {
			"html": true,
			"name": "manifest"
		},
		"html-max": {
			"html": true,
			"name": "max"
		},
		"html-maxlength": {
			"html": true,
			"name": "maxlength"
		},
		"html-media": {
			"enum": [
				"screen",
				"tty",
				"tv",
				"projection",
				"handheld",
				"print",
				"aural",
				"braille",
				"embossed",
				"speech",
				"all",
				"width",
				"min-width",
				"max-width",
				"height",
				"min-height",
				"max-height",
				"device-width",
				"min-device-width",
				"max-device-width",
				"device-height",
				"min-device-height",
				"max-device-height",
				"orientation",
				"aspect-ratio",
				"min-aspect-ratio",
				"max-aspect-ratio",
				"device-aspect-ratio",
				"min-device-aspect-ratio",
				"max-device-aspect-ratio",
				"color",
				"min-color",
				"max-color",
				"color-index",
				"min-color-index",
				"max-color-index",
				"monochrome",
				"min-monochrome",
				"max-monochrome",
				"resolution",
				"min-resolution",
				"max-resolution",
				"scan",
				"grid"
			],
			"html": true,
			"name": "media"
		},
		"html-mediagroup": {
			"html": true,
			"name": "mediagroup"
		},
		"html-method": {
			"enum": [
				"get",
				"post"
			],
			"html": true,
			"name": "method"
		},
		"html-min": {
			"html": true,
			"name": "min"
		},
		"html-multiple": {
			"type": "flag",
			"html": true,
			"name": "multiple"
		},
		"html-muted": {
			"type": "flag",
			"html": true,
			"name": "muted"
		},
		"html-name": {
			"html": true,
			"name": "name"
		},
		"html-novalidate": {
			"type": "flag",
			"html": true,
			"name": "novalidate"
		},
		"html-open": {
			"type": "flag",
			"html": true,
			"name": "open"
		},
		"html-optimum": {
			"html": true,
			"name": "optimum"
		},
		"html-pattern": {
			"html": true,
			"name": "pattern"
		},
		"html-placeholder": {
			"html": true,
			"name": "placeholder"
		},
		"html-poster": {
			"html": true,
			"name": "poster"
		},
		"html-preload": {
			"enum": [
				"auto",
				"metadata",
				"none"
			],
			"html": true,
			"name": "preload"
		},
		"html-pubdate": {
			"html": true,
			"name": "pubdate"
		},
		"html-radiogroup": {
			"html": true,
			"name": "radiogroup"
		},
		"html-rel": {
			"enum": [
				"alternate",
				"author",
				"bookmark",
				"help",
				"license",
				"next",
				"nofollow",
				"noreferrer",
				"prefetch",
				"prev",
				"search",
				"sidebar",
				"tag",
				"external"
			],
			"html": true,
			"name": "rel"
		},
		"html-readonly": {
			"type": "flag",
			"html": true,
			"name": "readonly"
		},
		"html-required": {
			"type": "flag",
			"html": true,
			"name": "required"
		},
		"html-reversed": {
			"type": "flag",
			"html": true,
			"name": "reversed"
		},
		"html-rows": {
			"html": true,
			"name": "rows"
		},
		"html-rowspan": {
			"html": true,
			"name": "rowspan"
		},
		"html-sandbox": {
			"enum": [
				"allow-forms",
				"allow-same-origin",
				"allow-scripts",
				"allow-top-navigation"
			],
			"html": true,
			"name": "sandbox"
		},
		"html-seamless": {
			"type": "flag",
			"html": true,
			"name": "seamless"
		},
		"html-selected": {
			"type": "flag",
			"html": true,
			"name": "selected"
		},
		"html-scope": {
			"enum": [
				"col",
				"colgroup",
				"row",
				"rowgroup"
			],
			"html": true,
			"name": "scope"
		},
		"html-scoped": {
			"type": "boolean",
			"html": true,
			"name": "scoped"
		},
		"html-scrollamount": {
			"html": true,
			"name": "scrollamount"
		},
		"html-scrolldelay": {
			"html": true,
			"name": "scrolldelay"
		},
		"html-shape": {
			"enum": [
				"circle",
				"default",
				"poly",
				"rect"
			],
			"html": true,
			"name": "shape"
		},
		"html-size": {
			"html": true,
			"name": "size"
		},
		"html-sizes": {
			"enum": [
				"any"
			],
			"html": true,
			"name": "sizes"
		},
		"html-span": {
			"html": true,
			"name": "span"
		},
		"html-src": {
			"html": true,
			"name": "src"
		},
		"html-srcdoc": {
			"html": true,
			"name": "srcdoc"
		},
		"html-srclang": {
			"html": true,
			"name": "srclang"
		},
		"html-standby": {
			"html": true,
			"name": "standby"
		},
		"html-start": {
			"html": true,
			"name": "start"
		},
		"html-step": {
			"html": true,
			"name": "step"
		},
		"html-target": {
			"enum": [
				"_blank",
				"_parent",
				"_self",
				"_top"
			],
			"html": true,
			"name": "target"
		},
		"html-truespeed": {
			"type": "flag",
			"html": true,
			"name": "truespeed"
		},
		"html-type": {
			"html": true,
			"name": "type"
		},
		"html-usemap": {
			"html": true,
			"name": "usemap"
		},
		"html-value": {
			"html": true,
			"name": "value"
		},
		"html-vspace": {
			"html": true,
			"name": "vspace"
		},
		"html-width": {
			"html": true,
			"name": "width"
		},
		"html-wrap": {
			"enum": [
				"hard",
				"soft"
			],
			"html": true,
			"name": "wrap"
		},
		"html-xml:lang": {
			"html": true,
			"name": "xml:lang"
		},
		"html-xmlns": {
			"html": true,
			"name": "xmlns"
		}
	},
	"<big>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<dialog>": {
		"@open": "#html-open",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<ilayer>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<main>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<marquee>": {
		"@align": "#html-align",
		"@behavior": "#html-behavior",
		"@bgcolor": "#html-bgcolor",
		"@direction": "#html-direction",
		"@height": "#html-height",
		"@hspace": "#html-hspace",
		"@loop": "#html-loop",
		"@scrollamount": "#html-scrollamount",
		"@scrolldelay": "#html-scrolldelay",
		"@truespeed": "#html-truespeed",
		"@vspace": "#html-vspace",
		"@width": "#html-width",
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<tt>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<var>": {
		"html": true,
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<content>": {
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "content select=\"$1\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<data>": {
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "data value=\"$1\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<menuitem>": {
		"html": true,
		"autocomplete": [
			{},
			{
				"snippet": "menuitem type=\"${1:command}\" label=\"${2:Save}\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<opt>": {
		"html": true,
		"autocomplete": [
			{
				"snippet": "option${1: value=\"${2:option}\"}"
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	},
	"<template>": {
		"html": true,
		"autocomplete": [
			{
				"snippet": "template id=\"$1\""
			}
		],
		"attribute-groups": [
			"html-attributes"
		]
	}
};

/***/ }),
/* 65 */
/***/ (function(module, exports) {

module.exports = {
	"<layout-use>": {
		"@__template": "template",
		"@__data": "template",
		"@*": {
			"remove-dashes": true,
			"type": "string"
		},
		"transformer": "./use-tag.js",
		"autocomplete": [
			{
				"snippet": "layout-use(\"${1:./path/to/template.marko}\")",
				"descriptionMoreURL": "http://markojs.com/docs/marko/layout-taglib/#<code>&ltlayout-use><code>"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/layout-taglib/#<code>&ltlayout-use><code>"
			}
		]
	},
	"<layout-put>": {
		"@into": "string",
		"@value": "string",
		"transformer": "./put-tag",
		"autocomplete": [
			{
				"snippet": "layout-put into=\"${1:name}\"",
				"descriptionMoreURL": "http://markojs.com/docs/marko/layout-taglib/#<code>&ltlayout-put><code>"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/layout-taglib/#<code>&ltlayout-put><code>"
			}
		]
	},
	"<layout-placeholder>": {
		"@name": "string",
		"transformer": "./placeholder-tag",
		"autocomplete": [
			{
				"snippet": "layout-placeholder name=\"${1:name}\"",
				"descriptionMoreURL": "http://markojs.com/docs/marko/layout-taglib/#<code>&ltlayout-placeholder><code>"
			},
			{
				"descriptionMoreURL": "http://markojs.com/docs/marko/layout-taglib/#<code>&ltlayout-placeholder><code>"
			}
		]
	}
};

/***/ }),
/* 66 */
/***/ (function(module, exports) {

module.exports = {
	"taglib-id": "marko-svg",
	"<altGlyph>": {
		"html": true,
		"htmlType": "svg"
	},
	"<altGlyphDef>": {
		"html": true,
		"htmlType": "svg"
	},
	"<altGlyphItem>": {
		"html": true,
		"htmlType": "svg"
	},
	"<animate>": {
		"html": true,
		"htmlType": "svg"
	},
	"<animateColor>": {
		"html": true,
		"htmlType": "svg"
	},
	"<animateMotion>": {
		"html": true,
		"htmlType": "svg"
	},
	"<animateTransform>": {
		"html": true,
		"htmlType": "svg"
	},
	"<circle>": {
		"html": true,
		"htmlType": "svg"
	},
	"<clipPath>": {
		"html": true,
		"htmlType": "svg"
	},
	"<color-profile>": {
		"html": true,
		"htmlType": "svg"
	},
	"<cursor>": {
		"html": true,
		"htmlType": "svg"
	},
	"<defs>": {
		"html": true,
		"htmlType": "svg"
	},
	"<desc>": {
		"html": true,
		"htmlType": "svg"
	},
	"<ellipse>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feBlend>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feColorMatrix>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feComponentTransfer>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feComposite>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feConvolveMatrix>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feDiffuseLighting>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feDisplacementMap>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feDistantLight>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feFlood>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feFuncA>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feFuncB>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feFuncG>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feFuncR>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feGaussianBlur>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feImage>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feMerge>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feMergeNode>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feMorphology>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feOffset>": {
		"html": true,
		"htmlType": "svg"
	},
	"<fePointLight>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feSpecularLighting>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feSpotLight>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feTile>": {
		"html": true,
		"htmlType": "svg"
	},
	"<feTurbulence>": {
		"html": true,
		"htmlType": "svg"
	},
	"<filter>": {
		"html": true,
		"htmlType": "svg"
	},
	"<font>": {
		"html": true,
		"htmlType": "svg"
	},
	"<font-face>": {
		"html": true,
		"htmlType": "svg"
	},
	"<font-face-format>": {
		"html": true,
		"htmlType": "svg"
	},
	"<font-face-name>": {
		"html": true,
		"htmlType": "svg"
	},
	"<font-face-src>": {
		"html": true,
		"htmlType": "svg"
	},
	"<font-face-uri>": {
		"html": true,
		"htmlType": "svg"
	},
	"<foreignObject>": {
		"html": true,
		"htmlType": "svg"
	},
	"<g>": {
		"html": true,
		"htmlType": "svg"
	},
	"<glyph>": {
		"html": true,
		"htmlType": "svg"
	},
	"<glyphRef>": {
		"html": true,
		"htmlType": "svg"
	},
	"<hkern>": {
		"html": true,
		"htmlType": "svg"
	},
	"<image>": {
		"html": true,
		"htmlType": "svg"
	},
	"<line>": {
		"html": true,
		"htmlType": "svg"
	},
	"<linearGradient>": {
		"html": true,
		"htmlType": "svg"
	},
	"<marker>": {
		"html": true,
		"htmlType": "svg"
	},
	"<mask>": {
		"html": true,
		"htmlType": "svg"
	},
	"<metadata>": {
		"html": true,
		"htmlType": "svg"
	},
	"<missing-glyph>": {
		"html": true,
		"htmlType": "svg"
	},
	"<mpath>": {
		"html": true,
		"htmlType": "svg"
	},
	"<path>": {
		"html": true,
		"htmlType": "svg"
	},
	"<pattern>": {
		"html": true,
		"htmlType": "svg"
	},
	"<polygon>": {
		"html": true,
		"htmlType": "svg"
	},
	"<polyline>": {
		"html": true,
		"htmlType": "svg"
	},
	"<radialGradient>": {
		"html": true,
		"htmlType": "svg"
	},
	"<rect>": {
		"html": true,
		"htmlType": "svg"
	},
	"<set>": {
		"html": true,
		"htmlType": "svg"
	},
	"<stop>": {
		"html": true,
		"htmlType": "svg"
	},
	"<svg>": {
		"html": true,
		"htmlType": "svg"
	},
	"<switch>": {
		"html": true,
		"htmlType": "svg"
	},
	"<symbol>": {
		"html": true,
		"htmlType": "svg"
	},
	"<text>": {
		"html": true,
		"htmlType": "svg"
	},
	"<textPath>": {
		"html": true,
		"htmlType": "svg"
	},
	"<title>": {
		"html": true,
		"htmlType": "svg"
	},
	"<tref>": {
		"html": true,
		"htmlType": "svg"
	},
	"<tspan>": {
		"html": true,
		"htmlType": "svg"
	},
	"<use>": {
		"html": true,
		"htmlType": "svg"
	},
	"<view>": {
		"html": true,
		"htmlType": "svg"
	},
	"<vkern>": {
		"html": true,
		"htmlType": "svg"
	}
};

/***/ }),
/* 67 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 68 */
/***/ (function(module, exports) {

module.exports = require("events-light");

/***/ }),
/* 69 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 70 */
/***/ (function(module, exports) {

module.exports = require("lasso-caching-fs");

/***/ }),
/* 71 */
/***/ (function(module, exports) {

module.exports = require("lasso-package-root");

/***/ }),
/* 72 */
/***/ (function(module, exports) {

module.exports = require("module");

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _koa = __webpack_require__(201);

var _koa2 = _interopRequireDefault(_koa);

var _koaRouter = __webpack_require__(202);

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaStatic = __webpack_require__(203);

var _koaStatic2 = _interopRequireDefault(_koaStatic);

var _public = __webpack_require__(77);

var _public2 = _interopRequireDefault(_public);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = 3000;

var app = new _koa2.default();

var router = new _koaRouter2.default();

router.get('/', function (ctx, next) {
  var domain = ctx.hostname;
  ctx.type = 'text/html; charset=utf-8';
  ctx.body = _public2.default.stream({ domain: domain });
  return next();
});

app.use((0, _koaStatic2.default)(__dirname + '/public'));

app.use(router.routes()).use(router.allowedMethods());

console.log('API server listening on ' + port);
app.listen(port);

/***/ }),
/* 74 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _classCallCheck2 = __webpack_require__(78);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  function _class() {
    (0, _classCallCheck3.default)(this, _class);
  }

  return _class;
}();

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__filename) {// Compiled using marko@4.3.1 - DO NOT EDIT


var marko_template = module.exports = __webpack_require__(56).t(__filename),
    marko_components = __webpack_require__(53),
    marko_registerComponent = marko_components.rc,
    marko_componentType = marko_registerComponent("/markoerror$0.0.1/src/pages/home/components/goal-header/index.marko", function () {
  return module.exports;
}),
    marko_component = __webpack_require__(75),
    marko_helpers = __webpack_require__(17),
    marko_attr = marko_helpers.a;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div class=\"goal-header\"" + marko_attr("id", __component.id) + "><div class=\"image\"></div><div class=\"header\">Get ready to start selling</div><div class=\"description\">Building a business takes a lot of work. Here are a few checklists to get you started.</div></div>");
}

marko_template._ = marko_components.r(render, {
  type: marko_componentType
}, marko_component);

marko_template.Component = marko_components.c(marko_component, marko_template._);

marko_template.meta = {
  deps: ["./style.scss", {
    type: "require",
    path: "./index.marko"
  }]
};
/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__filename) {// Compiled using marko@4.3.1 - DO NOT EDIT


var marko_template = module.exports = __webpack_require__(56).t(__filename),
    goal_header_template = __webpack_require__(76),
    marko_helpers = __webpack_require__(17),
    marko_loadTag = marko_helpers.t,
    goal_header_tag = marko_loadTag(goal_header_template);

function render(input, out) {
  var data = input;

  out.w("<p>Hello world! ");

  goal_header_tag({}, out);

  out.w("</p>");
}

marko_template._ = render;

marko_template.meta = {
  tags: ["./components/goal-header/index.marko"]
};
/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/***/ }),
/* 79 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 79;

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var enabled = false;
var browserRefreshClient = __webpack_require__(194);

exports.enable = function() {
    if (!browserRefreshClient.isBrowserRefreshEnabled()) {
        return;
    }

    if (enabled) {
        return;
    }

    enabled = true;

    // We set an environment variable so that _all_ marko modules
    // installed in the project will have browser refresh enabled.
    process.env.MARKO_BROWSER_REFRESH = 'true';

    var hotReload = __webpack_require__(55);
    hotReload.enable();

    browserRefreshClient
        .enableSpecialReload('*.marko marko.json marko-tag.json')
        .onFileModified(function(path) {
            hotReload.handleFileModified(path);
        });
};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isArray = Array.isArray;
var ok = __webpack_require__(1).ok;

var Node = __webpack_require__(0);
var Program = __webpack_require__(124);
var TemplateRoot = __webpack_require__(130);
var FunctionDeclaration = __webpack_require__(105);
var FunctionCall = __webpack_require__(104);
var Literal = __webpack_require__(3);
var Identifier = __webpack_require__(10);
var Comment = __webpack_require__(42);
var If = __webpack_require__(117);
var ElseIf = __webpack_require__(98);
var Else = __webpack_require__(97);
var Assignment = __webpack_require__(90);
var BinaryExpression = __webpack_require__(41);
var LogicalExpression = __webpack_require__(119);
var Vars = __webpack_require__(138);
var Return = __webpack_require__(126);
var HtmlElement = __webpack_require__(22);
var Html = __webpack_require__(44);
var Text = __webpack_require__(45);
var ForEach = __webpack_require__(100);
var ForEachProp = __webpack_require__(101);
var ForRange = __webpack_require__(102);
var HtmlComment = __webpack_require__(110);
var SelfInvokingFunction = __webpack_require__(128);
var ForStatement = __webpack_require__(103);
var BinaryExpression = __webpack_require__(41);
var UpdateExpression = __webpack_require__(136);
var UnaryExpression = __webpack_require__(135);
var MemberExpression = __webpack_require__(121);
var Code = __webpack_require__(92);
var InvokeMacro = __webpack_require__(118);
var Macro = __webpack_require__(120);
var ConditionalExpression = __webpack_require__(93);
var NewExpression = __webpack_require__(122);
var ObjectExpression = __webpack_require__(123);
var ArrayExpression = __webpack_require__(89);
var Property = __webpack_require__(125);
var VariableDeclarator = __webpack_require__(137);
var ThisExpression = __webpack_require__(134);
var Expression = __webpack_require__(99);
var Scriptlet = __webpack_require__(127);
var ContainerNode = __webpack_require__(94);
var WhileStatement = __webpack_require__(139);
var DocumentType = __webpack_require__(96);
var Declaration = __webpack_require__(95);
var SequenceExpression = __webpack_require__(129);
var CustomTag = __webpack_require__(43);

var parseExpression = __webpack_require__(164);
var parseStatement = __webpack_require__(166);
var parseJavaScriptArgs = __webpack_require__(165);
var replacePlaceholderEscapeFuncs = __webpack_require__(52);
var isValidJavaScriptIdentifier = __webpack_require__(26);

var DEFAULT_BUILDER;

function makeNode(arg) {
    if (typeof arg === 'string') {
        return parseExpression(arg, DEFAULT_BUILDER);
    } else if (arg instanceof Node) {
        return arg;
    } else if (arg == null) {
        return undefined;
    } else if (Array.isArray(arg)) {
        return arg.map((arg) => {
            return makeNode(arg);
        });
    } else {
        throw new Error('Argument should be a string or Node or null. Actual: ' + arg);
    }
}

var literalNull = new Literal({value: null});
var literalUndefined = new Literal({value: undefined});
var literalTrue = new Literal({value: true});
var literalFalse = new Literal({value: false});
var identifierOut = new Identifier({name: 'out'});
var identifierRequire = new Identifier({name: 'require'});

class Builder {
    arrayExpression(elements) {
        if (elements) {
            if (!isArray(elements)) {
                elements = [elements];
            }

            for (var i=0; i<elements.length; i++) {
                elements[i] = makeNode(elements[i]);
            }
        } else {
            elements = [];
        }

        return new ArrayExpression({elements});
    }

    assignment(left, right, operator) {
        if (operator == null) {
            operator = '=';
        }
        left = makeNode(left);
        right = makeNode(right);
        return new Assignment({left, right, operator});
    }

    binaryExpression(left, operator, right) {
        left = makeNode(left);
        right = makeNode(right);
        return new BinaryExpression({left, operator, right});
    }

    sequenceExpression(expressions) {
        expressions = makeNode(expressions);
        return new SequenceExpression({expressions});
    }

    code(value) {
        return new Code({value});
    }

    computedMemberExpression(object, property) {
        object = makeNode(object);
        property = makeNode(property);
        let computed = true;

        return new MemberExpression({object, property, computed});
    }

    concat(args) {
        var prev;
        let operator = '+';

        for (var i=1; i<arguments.length; i++) {
            var left;
            var right = makeNode(arguments[i]);
            if (i === 1) {
                left = makeNode(arguments[i-1]);
            } else {
                left = prev;
            }

            prev = new BinaryExpression({left, operator, right});
        }

        return prev;
    }

    conditionalExpression(test, consequent, alternate) {
        return new ConditionalExpression({test, consequent, alternate});
    }

    containerNode(type, generateCode) {
        if (typeof type === 'function') {
            generateCode = arguments[0];
            type = 'ContainerNode';
        }

        var node = new ContainerNode(type);
        if (generateCode) {
            node.setCodeGenerator(generateCode);
        }
        return node;
    }

    customTag(el, tagDef) {
        return new CustomTag(el, tagDef);
    }

    declaration(declaration) {
        return new Declaration({declaration});
    }

    documentType(documentType) {
        return new DocumentType({documentType});
    }

    elseStatement(body) {
        return new Else({body});
    }

    elseIfStatement(test, body, elseStatement) {
        test = makeNode(test);

        return new ElseIf({test, body, else: elseStatement});
    }

    expression(value) {
        return new Expression({value});
    }

    forEach(varName, inExpression, body) {
        if (arguments.length === 1) {
            var def = arguments[0];
            return new ForEach(def);
        } else {
            varName = makeNode(varName);
            inExpression = makeNode(inExpression);
            return new ForEach({varName, in: inExpression, body});
        }
    }

    forEachProp(nameVarName, valueVarName, inExpression, body) {
        if (arguments.length === 1) {
            var def = arguments[0];
            return new ForEachProp(def);
        } else {
            nameVarName = makeNode(nameVarName);
            valueVarName = makeNode(valueVarName);
            inExpression = makeNode(inExpression);
            return new ForEachProp({nameVarName, valueVarName, in: inExpression, body});
        }
    }

    forRange(varName, from, to, step, body) {
        if (arguments.length === 1) {
            var def = arguments[0];
            return new ForRange(def);
        } else {
            varName = makeNode(varName);
            from = makeNode(from);
            to = makeNode(to);
            step = makeNode(step);
            body = makeNode(body);

            return new ForRange({varName, from, to, step, body});
        }
    }

    forStatement(init, test, update, body) {
        if (arguments.length === 1) {
            var def = arguments[0];
            return new ForStatement(def);
        } else {
            init = makeNode(init);
            test = makeNode(test);
            update = makeNode(update);
            return new ForStatement({init, test, update, body});
        }
    }

    functionCall(callee, args) {
        callee = makeNode(callee);

        if (args) {
            if (!isArray(args)) {
                throw new Error('"args" should be an array');
            }

            for (var i=0; i<args.length; i++) {
                args[i] = makeNode(args[i]);
            }
        } else {
            args = [];
        }

        return new FunctionCall({callee, args});
    }

    functionDeclaration(name, params, body) {
        return new FunctionDeclaration({name, params, body});
    }

    html(argument) {
        argument = makeNode(argument);

        return new Html({argument});
    }

    htmlComment(comment) {
        return new HtmlComment({comment});
    }

    comment(comment) {
        return new Comment({comment});
    }

    htmlElement(tagName, attributes, body, argument, openTagOnly, selfClosed) {
        if (typeof tagName === 'object' && !(tagName instanceof Node)) {
            let def = arguments[0];
            return new HtmlElement(def);
        } else {
            return new HtmlElement({tagName, attributes, body, argument, openTagOnly, selfClosed});
        }
    }

    htmlLiteral(htmlCode) {
        var argument = new Literal({value: htmlCode});
        return new Html({argument});
    }

    identifier(name) {
        ok(typeof name === 'string', '"name" should be a string');

        if (!isValidJavaScriptIdentifier(name)) {
            var error = new Error('Invalid JavaScript identifier: ' + name);
            error.code = 'INVALID_IDENTIFIER';
            throw error;
        }
        return new Identifier({name});
    }

    identifierOut(name) {
        return identifierOut;
    }

    ifStatement(test, body, elseStatement) {
        test = makeNode(test);

        return new If({test, body, else: elseStatement});
    }

    invokeMacro(name, args, body) {
        return new InvokeMacro({name, args, body});
    }

    invokeMacroFromEl(el) {
        return new InvokeMacro({el});
    }

    literal(value) {
        return new Literal({value});
    }

    literalFalse() {
        return literalFalse;
    }

    literalNull() {
        return literalNull;
    }

    literalTrue() {
        return literalTrue;
    }

    literalUndefined() {
        return literalUndefined;
    }

    logicalExpression(left, operator, right) {
        left = makeNode(left);
        right = makeNode(right);
        return new LogicalExpression({left, operator, right});
    }

    macro(name, params, body) {
        return new Macro({name, params, body});
    }

    memberExpression(object, property, computed) {
        object = makeNode(object);
        property = makeNode(property);

        return new MemberExpression({object, property, computed});
    }

    moduleExports(value) {
        let object = new Identifier({name: 'module'});
        let property = new Identifier({name: 'exports'});

        var moduleExports = new MemberExpression({object, property });

        if (value) {
            return new Assignment({left: moduleExports, right: value, operator: '='});
        } else {
            return moduleExports;
        }
    }

    negate(argument) {
        argument = makeNode(argument);

        var operator = '!';
        var prefix = true;
        return new UnaryExpression({argument, operator, prefix});
    }

    newExpression(callee, args) {
        callee = makeNode(callee);

        if (args) {
            if (!isArray(args)) {
                args = [args];
            }

            for (var i=0; i<args.length; i++) {
                args[i] = makeNode(args[i]);
            }
        } else {
            args = [];
        }

        return new NewExpression({callee, args});
    }

    node(type, generateCode) {
        if (typeof type === 'function') {
            generateCode = arguments[0];
            type = 'Node';
        }

        var node = new Node(type);
        if (generateCode) {
            node.setCodeGenerator(generateCode);
        }
        return node;
    }

    objectExpression(properties) {
        if (properties) {
            if (!isArray(properties)) {
                properties = [properties];
            }

            for (var i=0; i<properties.length; i++) {
                let prop = properties[i];
                prop.value = makeNode(prop.value);
            }
        } else {
            properties = [];
        }

        return new ObjectExpression({properties});
    }

    parseExpression(str, options) {
        ok(typeof str === 'string', '"str" should be a string expression');
        var parsed = parseExpression(str, DEFAULT_BUILDER);
        return parsed;
    }

    parseJavaScriptArgs(args) {
        ok(typeof args === 'string', '"args" should be a string');
        return parseJavaScriptArgs(args, DEFAULT_BUILDER);
    }

    parseStatement(str, options) {
        ok(typeof str === 'string', '"str" should be a string expression');
        var parsed = parseStatement(str, DEFAULT_BUILDER);
        return parsed;
    }

    replacePlaceholderEscapeFuncs(node, context) {
        return replacePlaceholderEscapeFuncs(node, context);
    }

    program(body) {
        return new Program({body});
    }

    property(key, value) {
        key = makeNode(key);
        value = makeNode(value);

        return new Property({key, value});
    }

    renderBodyFunction(body, params) {
        let name = 'renderBody';
        if (!params) {
            params = [new Identifier({name: 'out'})];
        }
        return new FunctionDeclaration({name, params, body});
    }

    require(path) {
        path = makeNode(path);

        let callee = identifierRequire;
        let args = [ path ];
        return new FunctionCall({callee, args});
    }

    requireResolve(path) {
        path = makeNode(path);

        let callee = new MemberExpression({
            object: new Identifier({name: 'require'}),
            property: new Identifier({name: 'resolve'})
        });

        let args = [ path ];
        return new FunctionCall({callee, args});
    }

    returnStatement(argument) {
        argument = makeNode(argument);

        return new Return({argument});
    }

    scriptlet(scriptlet) {
        return new Scriptlet({
            code: scriptlet.value,
            tag: scriptlet.tag,
            block: scriptlet.block
        });
    }

    selfInvokingFunction(params, args, body) {
        if (arguments.length === 1) {
            body = arguments[0];
            params = null;
            args = null;
        }

        return new SelfInvokingFunction({params, args, body});
    }

    strictEquality(left, right) {
        left = makeNode(left);
        right = makeNode(right);

        var operator = '===';
        return new BinaryExpression({left, right, operator});
    }

    templateRoot(body) {
        return new TemplateRoot({body});
    }

    text(argument, escape, preserveWhitespace) {
        if (typeof argument === 'object' && !(argument instanceof Node)) {
            var def = arguments[0];
            return new Text(def);
        }
        argument = makeNode(argument);

        return new Text({argument, escape, preserveWhitespace});
    }

    thisExpression() {
        return new ThisExpression();
    }

    unaryExpression(argument, operator, prefix) {
        argument = makeNode(argument);

        return new UnaryExpression({argument, operator, prefix});
    }

    updateExpression(argument, operator, prefix) {
        argument = makeNode(argument);
        return new UpdateExpression({argument, operator, prefix});
    }

    variableDeclarator(id, init) {
        if (typeof id === 'string') {
            id = new Identifier({name: id});
        }
        if (init) {
            init = makeNode(init);
        }

        return new VariableDeclarator({id, init});
    }

    var(id, init, kind) {
        if (!kind) {
            kind = 'var';
        }

        id = makeNode(id);
        init = makeNode(init);

        var declarations = [
            new VariableDeclarator({id, init})
        ];

        return new Vars({declarations, kind});
    }

    vars(declarations, kind) {
        if (declarations) {
            if (Array.isArray(declarations)) {
                for (let i=0; i<declarations.length; i++) {
                    var declaration = declarations[i];
                    if (!declaration) {
                        throw new Error('Invalid variable declaration');
                    }
                    if (typeof declaration === 'string') {
                        declarations[i] = new VariableDeclarator({
                            id: new Identifier({name: declaration})
                        });
                    } else if (declaration instanceof Identifier) {
                        declarations[i] = new VariableDeclarator({
                            id: declaration
                        });
                    } else if (typeof declaration === 'object') {
                        if (!(declaration instanceof VariableDeclarator)) {
                            let id = declaration.id;
                            let init = declaration.init;

                            if (typeof id === 'string') {
                                id = new Identifier({name: id});
                            }

                            if (!id) {
                                throw new Error('Invalid variable declaration');
                            }

                            if (init) {
                                init = makeNode(init);
                            }


                            declarations[i] = new VariableDeclarator({id, init});
                        }
                    }
                }
            } else if (typeof declarations === 'object') {
                // Convert the object into an array of variables
                declarations = Object.keys(declarations).map((key) => {
                    let id = new Identifier({name: key});
                    let init = makeNode(declarations[key]);
                    return new VariableDeclarator({ id, init });
                });
            }
        }


        return new Vars({declarations, kind});
    }

    whileStatement(test, body) {
        return new WhileStatement({test, body});
    }
}

DEFAULT_BUILDER = new Builder();

Builder.DEFAULT_BUILDER = DEFAULT_BUILDER;

module.exports = Builder;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const isArray = Array.isArray;
const Node = __webpack_require__(0);
const Literal = __webpack_require__(3);
const Identifier = __webpack_require__(10);
const HtmlElement = __webpack_require__(22);
const Html = __webpack_require__(44);
const ok = __webpack_require__(1).ok;
const Container = __webpack_require__(9);
const createError = __webpack_require__(13);

class GeneratorEvent {
    constructor(node, codegen) {
        this.node = node;
        this.codegen = codegen;

        this.isBefore = true;
        this.builder = codegen.builder;
        this.context = codegen.context;

        this.insertedNodes = null;
    }

    insertCode(newCode) {
        if (!this.insertedNodes) {
            this.insertedNodes = [];
        }
        this.insertedNodes = this.insertedNodes.concat(newCode);
    }
}

class FinalNodes {
    constructor() {
        this.nodes = [];
        this.nodes._finalNode = true; // Mark the array as a collection of final nodes
        this.lastNode = null;
    }

    push(node) {
        if (!node) {
            return;
        }

        if (node instanceof Html) {
            if (this.lastNode instanceof Html) {
                this.lastNode.append(node);
                return;
            }
        }

        if (node.setFinalNode) {
            node.setFinalNode(true);
        }

        this.lastNode = node;
        this.nodes.push(node);
    }
}

class CodeGenerator {
    constructor(context, options) {
        options = options || {};
        this.root = null;

        this._code = '';
        this.currentIndent = '';
        this.inFunction = false;

        this._doneListeners = [];


        this.builder = context.builder;

        this.context = context;

        ok(this.builder, '"this.builder" is required');

        this._codegenCodeMethodName = 'generate' +
            context.outputType.toUpperCase() +
            'Code';
    }

    addVar(name, value) {
        return this.context.addVar(name, value);
    }

    addStaticVar(name, value) {
        return this.context.addStaticVar(name, value);
    }

    addStaticCode(code) {
        this.context.addStaticCode(code);
    }

    addDependency(path, type, options) {
        this.context.addDependency(path, type, options);
    }

    pushMeta(key, value, unique) {
        this.context.pushMeta(key, value, unique);
    }

    setMeta(key, value) {
        this.context.setMeta(key, value);
    }

    getEscapeXmlAttrVar() {
        return this.context.getEscapeXmlAttrVar();
    }

    importModule(varName, path) {
        return this.context.importModule(varName, path);
    }

    _invokeCodeGenerator(func, node, isMethod) {
        try {
            if (isMethod) {
                return func.call(node, this);
            } else {
                return func.call(node, node, this);
            }
        } catch(err) {
            var errorMessage = 'Generating code for ';

            if (node instanceof HtmlElement) {
                errorMessage += '<'+node.tagName+'> tag';
            } else {
                errorMessage += node.type + ' node';
            }

            if (node.pos) {
                errorMessage += ' ('+this.context.getPosInfo(node.pos)+')';
            }

            errorMessage += ' failed. Error: ' + err;

            throw createError(errorMessage, err /* cause */);
        }
    }

    _generateCode(node, finalNodes) {
        if (isArray(node)) {
            node.forEach((child) => {
                this._generateCode(child, finalNodes);
            });
            return;
        } else if (node instanceof Container) {
            node.forEach((child) => {
                if (child.container === node) {
                    this._generateCode(child, finalNodes);
                }
            });
            return;
        }

        if (node == null) {
            return;
        }

        if (typeof node === 'string' || node._finalNode || !(node instanceof Node)) {
            finalNodes.push(node);
            return;
        }

        if (node._normalizeChildTextNodes) {
            node._normalizeChildTextNodes(this.context);
        }

        let oldCurrentNode = this._currentNode;
        this._currentNode = node;

        var beforeAfterEvent = new GeneratorEvent(node, this);

        var isWhitespacePreserved = node.isPreserveWhitespace();

        if (isWhitespacePreserved) {
            this.context.beginPreserveWhitespace();
        }

        beforeAfterEvent.isBefore = true;
        beforeAfterEvent.node.emit('beforeGenerateCode', beforeAfterEvent);
        this.context.emit('beforeGenerateCode:' + beforeAfterEvent.node.type, beforeAfterEvent);
        this.context.emit('beforeGenerateCode', beforeAfterEvent);

        if (beforeAfterEvent.insertedNodes) {
            this._generateCode(beforeAfterEvent.insertedNodes, finalNodes);
            beforeAfterEvent.insertedNodes = null;
        }

        let codeGeneratorFunc;
        let generatedCode;

        if (node.getCodeGenerator) {
            codeGeneratorFunc = node.getCodeGenerator(this.outputType);

            if (codeGeneratorFunc) {
                node.setCodeGenerator(null);

                generatedCode = this._invokeCodeGenerator(codeGeneratorFunc, node, false);

                if (generatedCode === null) {
                    node = null;
                } else if (generatedCode !== undefined && generatedCode !== node) {
                    node = null;
                    this._generateCode(generatedCode, finalNodes);
                }
            }
        }

        if (node != null) {
            codeGeneratorFunc = node.generateCode;

            if (!codeGeneratorFunc) {
                codeGeneratorFunc = node[this._codegenCodeMethodName];
            }

            if (codeGeneratorFunc) {
                generatedCode = this._invokeCodeGenerator(codeGeneratorFunc, node, true);

                if (generatedCode === undefined || generatedCode === node) {
                    finalNodes.push(node);
                } else if (generatedCode === null) {
                    // If nothing was returned then don't generate any code
                } else {
                    this._generateCode(generatedCode, finalNodes);
                }
            } else {
                finalNodes.push(node);
            }
        }

        beforeAfterEvent.isBefore = false;
        beforeAfterEvent.node.emit('afterGenerateCode', beforeAfterEvent);
        this.context.emit('afterGenerateCode:' + beforeAfterEvent.node.type, beforeAfterEvent);
        this.context.emit('afterGenerateCode', beforeAfterEvent);

        if (beforeAfterEvent.insertedNodes) {
            this._generateCode(beforeAfterEvent.insertedNodes, finalNodes);
            beforeAfterEvent.insertedNodes = null;
        }

        if (isWhitespacePreserved) {
            this.context.endPreserveWhitespace();
        }

        this._currentNode = oldCurrentNode;
    }

    generateCode(node) {
        if (!node) {
            return null;
        }

        if (node._finalNode) {
            return node;
        }

        let finalNodes = new FinalNodes();

        var isList = typeof node.forEach === 'function';

        this._generateCode(node, finalNodes);

        finalNodes = finalNodes.nodes;

        if (!isList) {
            if (finalNodes.length === 0) {
                return null;
            } else if (finalNodes.length === 1) {
                return finalNodes[0];
            }
        }

        return finalNodes;
    }

    isLiteralNode(node) {
        return node instanceof Literal;
    }

    isIdentifierNode(node) {
        return node instanceof Identifier;
    }

    isPreserveWhitespaceEnabled() {
        return false;
    }

    addError(message, code) {
        ok('"message" is required');

        let node = this._currentNode;

        if (typeof message === 'object') {
            let errorInfo = message;
            errorInfo.node = node;
            this.context.addError(errorInfo);
        } else {
            this.context.addError({node, message, code});
        }
    }

    onDone(listenerFunc) {
        this._doneListeners.push(listenerFunc);
    }

    getRequirePath(targetFilename) {
        return this.context.getRequirePath(targetFilename);
    }

    resolvePath(pathExpression) {
        return this.context.resolvePath(pathExpression);
    }
}

module.exports = CodeGenerator;

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class CompileError {
    constructor(errorInfo, context) {
        this.context = context;
        this.node = errorInfo.node;
        this.message = errorInfo.message;
        this.code = errorInfo.code;

        var pos = errorInfo.pos;
        var endPos = errorInfo.endPos;

        if (pos == null) {
            pos = this.node && this.node.pos;
        }

        if (endPos == null) {
            endPos = this.node && this.node.endPos;
        }

        if (pos != null) {
            pos = context.getPosInfo(pos);
        }

        if (endPos != null) {
            endPos = context.getPosInfo(endPos);
        }

        this.pos = pos;
        this.endPos = endPos;
    }

    toString() {
        var pos = this.pos;
        if (pos) {
            pos = '[' + pos + '] ';
        } else {
            pos = '';
        }
        var str = pos + this.message;
        if (pos == null && this.node) {
            str += ' (' + this.node.toString() + ')';
        }
        return str;
    }
}

module.exports = CompileError;

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ok = __webpack_require__(1).ok;
var path = __webpack_require__(2);
var CodeGenerator = __webpack_require__(82);
var CodeWriter = __webpack_require__(38);
var createError = __webpack_require__(13);
var resolveDep = __webpack_require__(57).resolveDep;

const FLAG_TRANSFORMER_APPLIED = 'transformerApply';

function transformNode(node, context) {
    try {
        context.taglibLookup.forEachNodeTransformer(node, function (transformer) {
            if (node.isDetached()) {
                return;    //The node might have been removed from the tree
            }
            if (!node.isTransformerApplied(transformer)) {
                //Check to make sure a transformer of a certain type is only applied once to a node
                node.setTransformerApplied(transformer);
                //Mark the node as have been transformed by the current transformer
                context.setFlag(FLAG_TRANSFORMER_APPLIED);
                //Set the current node
                context._currentNode = node;
                //Set the flag to indicate that a node was transformed
                // node.compiler = this;
                var transformerFunc = transformer.getFunc();
                transformerFunc.call(transformer, node, context);    //Have the transformer process the node (NOTE: Just because a node is being processed by the transformer doesn't mean that it has to modify the parse tree)
            }
        });
    } catch (e) {
        throw createError(new Error('Unable to compile template at path "' + context.filename + '". Error: ' + e.message), e);
    }
}

function transformTreeHelper(node, context) {
    transformNode(node, context);

    /*
     * Now process the child nodes by looping over the child nodes
     * and transforming the subtree recursively
     *
     * NOTE: The length of the childNodes array might change as the tree is being performed.
     *       The checks to prevent transformers from being applied multiple times makes
     *       sure that this is not a problem.
     */
    node.forEachChild(function (childNode) {
        transformTreeHelper(childNode, context);
    });
}

function transformTree(rootNode, context) {

    context.taglibLookup.forEachTemplateTransformer((transformer) => {
        var transformFunc = transformer.getFunc();
        rootNode = transformFunc(rootNode, context) || rootNode;
    });

    /*
     * The tree is continuously transformed until we go through an entire pass where
     * there were no new nodes that needed to be transformed. This loop makes sure that
     * nodes added by transformers are also transformed.
     */
    do {
        context.clearFlag(FLAG_TRANSFORMER_APPLIED);
        //Reset the flag to indicate that no transforms were yet applied to any of the nodes for this pass
        transformTreeHelper(rootNode, context);    //Run the transforms on the tree
    } while (context.isFlagSet(FLAG_TRANSFORMER_APPLIED));

    return rootNode;
}

function handleErrors(context) {
    // If there were any errors then compilation failed.
    if (context.hasErrors()) {
        var errors = context.getErrors();

        var message = 'An error occurred while trying to compile template at path "' + context.filename + '". Error(s) in template:\n';
        for (var i = 0, len = errors.length; i < len; i++) {
            let error = errors[i];
            message += (i + 1) + ') ' + error.toString() + '\n';
        }
        var error = new Error(message);
        error.errors = errors;
        throw error;
    }
}

class CompiledTemplate {
    constructor(ast, context, codeGenerator) {
        this.ast = ast;
        this.context = context;
        this.filename = context.filename;
    }

    get dependencies() {
        var meta = this.context.meta;
        if (meta) {
            var root = path.dirname(this.filename);
            return (meta.deps || []).map(dep => resolveDep(dep, root));
        } else {
            return [];
        }
    }

    get code() {
        // STAGE 3: Generate the code using the final AST
        handleErrors(this.context);

        // console.log(module.id, 'FINAL AST:' + JSON.stringify(finalAST, null, 4));
        var codeWriter = new CodeWriter(this.context.options, this.context.builder);
        codeWriter.write(this.ast);

        handleErrors(this.context);

        // Return the generated code as the compiled output:
        var compiledSrc = codeWriter.getCode();
        return compiledSrc;
    }
}

class Compiler {
    constructor(options, userOptions, inline) {
        ok(options, '"options" is required');

        this.builder = options.builder;
        this.parser = options.parser;

        ok(this.builder, '"options.builder" is required');
        ok(this.parser, '"options.parser" is required');
    }

    compile(src, context) {
        ok(typeof src === 'string', '"src" argument should be a string');

        var codeGenerator = new CodeGenerator(context);

        // STAGE 1: Parse the template to produce the initial AST
        var ast = this.parser.parse(src, context);
        context._parsingFinished = true;

        if (context.unrecognizedTags) {
            for(let i=0; i<context.unrecognizedTags.length; i++) {
                let unrecognizedTag = context.unrecognizedTags[i];
                // See if the tag is a macro
                if (!context.isMacro(unrecognizedTag.tagName)) {
                    context.addErrorUnrecognizedTag(unrecognizedTag.tagName, unrecognizedTag.node);
                }
            }
        }

        handleErrors(context);

        context.root = ast;
        // console.log('ROOT', JSON.stringify(ast, null, 2));

        // STAGE 2: Transform the initial AST to produce the final AST
        var transformedAST = transformTree(ast, context);
        // console.log('transformedAST', JSON.stringify(ast, null, 2));

        handleErrors(context);

        var finalAST = codeGenerator.generateCode(transformedAST);

        handleErrors(context);

        return new CompiledTemplate(finalAST, context);
    }
}

module.exports = Compiler;

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var htmljs = __webpack_require__(200);

class HtmlJsParser {
    constructor(options) {
        this.ignorePlaceholders = options && options.ignorePlaceholders === true;
    }

    parse(src, handlers, filename) {
        var listeners = {
            onText(event) {
                handlers.handleCharacters(event.value, event.parseMode);
            },

            onPlaceholder(event) {
                if (event.withinBody) {
                    if (!event.withinString) {
                        handlers.handleBodyTextPlaceholder(event.value, event.escape);
                    }
                } else if (event.withinOpenTag) {
                    // Don't escape placeholder for dynamic attributes. For example: <div ${data.myAttrs}></div>
                } else {
                    // placeholder within attribute
                    if (event.escape) {
                        event.value = '$escapeXml(' + event.value + ')';
                    } else {
                        event.value = '$noEscapeXml(' + event.value + ')';
                    }
                }
                // placeholder within content

            },

            onCDATA(event) {
                handlers.handleCharacters(event.value, 'static-text');
            },

            onOpenTagName(event, parser) {
                event.selfClosed = false; // Don't allow self-closed tags

                var tagParseOptions = handlers.getTagParseOptions(event);

                if (tagParseOptions) {
                    event.setParseOptions(tagParseOptions);
                }
            },

            onOpenTag(event, parser) {
                event.selfClosed = false; // Don't allow self-closed tags
                handlers.handleStartElement(event, parser);

                var tagParseOptions = handlers.getTagParseOptions(event);
                if (tagParseOptions) {
                    event.setParseOptions(tagParseOptions);
                }
            },

            onCloseTag(event) {
                var tagName = event.tagName;
                handlers.handleEndElement(tagName);
            },

            onDocumentType(event) {

                // Document type: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd
                // NOTE: The value will be all of the text between "<!" and ">""
                handlers.handleDocumentType(event.value);
            },

            onDeclaration(event) {
                handlers.handleDeclaration(event.value);
            },

            onComment(event) {
                // Text within XML comment
                handlers.handleComment(event.value);
            },

            onScriptlet(event) {
                // <% (code) %> or $ {}
                handlers.handleScriptlet(event);
            },

            onError(event) {
                handlers.handleError(event);
            }
        };

        var parser = this.parser = htmljs.createParser(listeners, {
            ignorePlaceholders: this.ignorePlaceholders,
            isOpenTagOnly: function(tagName) {
                return handlers.isOpenTagOnly(tagName);
            }
        });
        parser.parse(src, filename);
    }
}

module.exports = HtmlJsParser;


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let CodeWriter = __webpack_require__(38);

function fixIndentation(lines) {
    let length = lines.length;
    let startLine = 0;
    let endLine = length;

    for (; startLine<length; startLine++) {
        let line = lines[startLine];
        if (line.trim() !== '') {
            break;
        }
    }

    for (; endLine>startLine; endLine--) {
        let line = lines[endLine-1];
        if (line.trim() !== '') {
            break;
        }
    }

    if (endLine === startLine) {
        return '';
    }

    if (startLine !== 0 || endLine !== length) {
        lines = lines.slice(startLine, endLine);
    }

    let firstLine = lines[0];
    let indentToRemove = /^\s*/.exec(firstLine)[0];

    if (indentToRemove) {
        for (let i=0; i<lines.length; i++) {
            let line = lines[i];
            if (line.startsWith(indentToRemove)) {
                lines[i] = line.substring(indentToRemove.length);
            }
        }
    }

    return lines.join('\n');
}

function normalizeTemplateSrc(src) {
    let lines = src.split(/\r\n|\n\r|\n/);
    if (lines.length) {
        if (lines[0].trim() === '') {
            return fixIndentation(lines);
        }
    }

    return src.trim();
}
class InlineCompiler {
    constructor(context, compiler) {
        this.context = context;
        this.compiler = compiler;
        this.builder = context.builder;

        context.setInline(true);
    }

    compile(src) {
        src = normalizeTemplateSrc(src);
        // console.log('TEMPLATE SRC:>\n' + src + '\n<');
        return this.compiler.compile(src, this.context);
    }

    get staticCode() {
        let staticNodes = this.context.getStaticNodes();

        if (!staticNodes || staticNodes.length === 0) {
            return null;
        }

        let codeWriter = new CodeWriter(this.context.options, this.builder);
        codeWriter.write(staticNodes);
        return codeWriter.getCode();
    }
}

module.exports = InlineCompiler;

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ok = __webpack_require__(1).ok;
var replacePlaceholderEscapeFuncs = __webpack_require__(52);
var extend = __webpack_require__(5);

var COMPILER_ATTRIBUTE_HANDLERS = {
    'preserve-whitespace': function(attr, context) {
        context.setPreserveWhitespace(true);
    },
    'preserve-comments': function(attr, context) {
        context.setPreserveComments(true);
    }
};

var ieConditionalCommentRegExp = /^\[if [^]*?<!\[endif\]$/;

function isIEConditionalComment(comment) {
    return ieConditionalCommentRegExp.test(comment);
}

function mergeShorthandClassNames(el, shorthandClassNames, context) {
    var builder = context.builder;
    let classNames = shorthandClassNames.map((className) => {
        return builder.parseExpression(className.value);
    });

    var classAttr = el.getAttributeValue('class');
    if (classAttr) {
        classNames.push(classAttr);
    }

    let prevClassName;

    var finalClassNames = [];

    for (var i=0; i<classNames.length; i++) {
        let className = classNames[i];
        if (prevClassName && className.type === 'Literal' && prevClassName.type === 'Literal') {
            prevClassName.value += ' ' + className.value;
        } else {
            finalClassNames.push(className);
            prevClassName = className;
        }
    }

    if (finalClassNames.length === 1) {
        el.setAttributeValue('class', finalClassNames[0]);
    } else {

        el.setAttributeValue(
            'class',
            builder.functionCall(
                context.helper('classList'),
                [
                    builder.literal(finalClassNames)
                ]));
    }
}

function getParserStateForTag(parser, el, tagDef) {
    var attributes = el.attributes;
    if (attributes) {
        for (var i=0; i<attributes.length; i++) {
            var attr = attributes[i];
            var attrName = attr.name;
            if (attrName === 'marko-body') {
                var parseMode;

                if (attr.literalValue) {
                    parseMode = attr.literalValue;
                }

                if (parseMode === 'static-text' ||
                    parseMode === 'parsed-text' ||
                    parseMode === 'html') {
                    return parseMode;
                } else {
                    parser.context.addError({
                        message: 'Value for "marko-body" should be one of the following: "static-text", "parsed-text", "html"',
                        code: 'ERR_INVALID_ATTR'
                    });
                    return;
                }
            } else if (attrName === 'template-helpers') {
                return 'static-text';
            } else if (attrName === 'marko-init') {
                return 'static-text';
            }
        }
    }

    if (tagDef) {
        var body = tagDef.body;
        if (body) {
            return body; // 'parsed-text' | 'static-text' | 'html'
        }
    }

    return null; // Default parse state
}

class Parser {
    constructor(parserImpl, options) {
        ok(parserImpl, '"parserImpl" is required');

        this.parserImpl = parserImpl;

        this.prevTextNode = null;
        this.stack = null;

        this.raw = options && options.raw === true;

        // The context gets provided when parse is called
        // but we store it as part of the object so that the handler
        // methods have access
        this.context = null;
    }

    _reset() {
        this.prevTextNode = null;
        this.stack = [];
    }

    parse(src, context) {
        ok(typeof src === 'string', '"src" should be a string');
        ok(context, '"context" is required');

        this._reset();

        this.context = context;

        var builder = context.builder;
        var rootNode = builder.templateRoot();

        this.stack.push({
            node: rootNode
        });

        this.parserImpl.parse(src, this, context.filename);

        return rootNode;
    }

    handleCharacters(text, parseMode) {
        var builder = this.context.builder;

        var escape = parseMode !== 'html';
        // NOTE: If parseMode is 'static-text' or 'parsed-text' then that means that special
        //       HTML characters may not have been escaped on the way in so we need to escape
        //       them on the way out

        if (this.prevTextNode && this.prevTextNode.isLiteral() && this.prevTextNode.escape === escape) {
            this.prevTextNode.argument.value += text;
        } else {
            this.prevTextNode = builder.text(builder.literal(text), escape);
            this.parentNode.appendChild(this.prevTextNode);
        }
    }

    handleStartElement(el, parser) {
        var context = this.context;
        var builder = context.builder;

        var tagName = el.tagName;
        var tagNameExpression = el.tagNameExpression;
        var attributes = el.attributes;
        var argument = el.argument; // e.g. For <for(color in colors)>, argument will be "color in colors"

        if (argument) {
            argument = argument.value;
        }

        var raw = this.raw;

        if (!raw) {
            if (tagNameExpression) {
                tagName = builder.parseExpression(tagNameExpression);
            } else if (tagName === 'marko-compiler-options') {
                this.parentNode.setTrimStartEnd(true);

                attributes.forEach(function (attr) {
                    let attrName = attr.name;
                    let handler = COMPILER_ATTRIBUTE_HANDLERS[attrName];

                    if (!handler) {
                        context.addError({
                            code: 'ERR_INVALID_COMPILER_OPTION',
                            message: 'Invalid Marko compiler option of "' + attrName + '". Allowed: ' + Object.keys(COMPILER_ATTRIBUTE_HANDLERS).join(', '),
                            pos: el.pos,
                            node: el
                        });
                        return;
                    }

                    handler(attr, context);
                });

                return;
            }
        }

        this.prevTextNode = null;

        var tagDef = el.tagName ? this.context.getTagDef(el.tagName) : null;

        var attributeParseErrors = [];
        // <div class="foo"> -> "div class=foo"
        var tagString = parser.substring(el.pos, el.endPos)
                              .replace(/^<|\/>$|>$/g, "").trim();

        var shouldParsedAttributes = !tagDef || tagDef.parseAttributes !== false;

        var parsedAttributes = [];

        if (shouldParsedAttributes) {
            attributes.forEach((attr) => {
                var attrValue;
                if (attr.hasOwnProperty('literalValue')) {
                    attrValue = builder.literal(attr.literalValue);
                } else if (attr.value == null) {
                    attrValue = undefined;
                } else {
                    let parsedExpression;
                    let valid = true;
                    try {
                        parsedExpression = builder.parseExpression(attr.value);
                    } catch(e) {
                        if (shouldParsedAttributes) {
                            valid = false;
                            attributeParseErrors.push('Invalid JavaScript expression for attribute "' + attr.name + '": ' + e);
                        } else {
                            // Attribute failed to parse. Skip it...
                            return;
                        }

                    }

                    if (valid) {
                        if (raw) {
                            attrValue = parsedExpression;
                        } else {
                            attrValue = replacePlaceholderEscapeFuncs(parsedExpression, context);
                        }
                    } else {
                        attrValue = null;
                    }
                }

                var attrDef = {
                    name: attr.name,
                    value: attrValue,
                    rawValue: attr.value
                };

                if (attr.argument) {
                    // TODO Do something with the argument pos
                    attrDef.argument = attr.argument.value;
                }

                parsedAttributes.push(attrDef);
            });
        }

        var elDef = {
            tagName: tagName,
            argument: argument,
            tagString,
            openTagOnly: el.openTagOnly === true,
            selfClosed: el.selfClosed === true,
            pos: el.pos,
            attributes: parsedAttributes
        };

        var node;

        if (raw) {
            node = builder.htmlElement(elDef);
            node.pos = elDef.pos;
            node.tagDef = tagDef;
        } else {
            node = this.context.createNodeForEl(elDef);
        }

        if (attributeParseErrors.length) {

            attributeParseErrors.forEach((e) => {
                context.addError(node, e);
            });
        }

        if (raw) {
            if (el.shorthandId) {
                let parsed = builder.parseExpression(el.shorthandId.value);
                node.rawShorthandId = parsed.value;
            }

            if (el.shorthandClassNames) {
                node.rawShorthandClassNames = el.shorthandClassNames.map((className) => {
                    let parsed = builder.parseExpression(className.value);
                    return parsed.value;
                });
            }
        } else {
            if (el.shorthandClassNames) {
                mergeShorthandClassNames(node, el.shorthandClassNames, context);
            }

            if (el.shorthandId) {
                if (node.hasAttribute('id')) {
                    context.addError(node, 'A shorthand ID cannot be used in conjunction with the "id" attribute');
                } else {
                    node.setAttributeValue('id', builder.parseExpression(el.shorthandId.value));
                }
            }
        }

        this.parentNode.appendChild(node);

        this.stack.push({
            node: node,
            tag: null
        });
    }

    handleEndElement(elementName) {
        if (this.raw !== true) {
            if (elementName === 'marko-compiler-options') {
                return;
            }
        }

        this.prevTextNode = null;
        this.stack.pop();
    }

    handleComment(comment) {
        this.prevTextNode = null;

        var builder = this.context.builder;

        var preserveComment = this.context.isPreserveComments() ||
            isIEConditionalComment(comment);

        if (this.raw || preserveComment) {
            var commentNode = builder.htmlComment(builder.literal(comment));
            this.parentNode.appendChild(commentNode);
        }
    }

    handleDeclaration(value) {
        this.prevTextNode = null;

        var builder = this.context.builder;

        var declarationNode = builder.declaration(builder.literal(value));
        this.parentNode.appendChild(declarationNode);
    }

    handleDocumentType(value) {
        this.prevTextNode = null;

        var builder = this.context.builder;

        var docTypeNode = builder.documentType(builder.literal(value));
        this.parentNode.appendChild(docTypeNode);
    }

    handleBodyTextPlaceholder(expression, escape) {
        this.prevTextNode = null;
        var builder = this.context.builder;
        var parsedExpression = builder.parseExpression(expression);
        var preserveWhitespace = true;

        var text = builder.text(parsedExpression, escape, preserveWhitespace);
        this.parentNode.appendChild(text);
    }

    handleScriptlet(event) {
        this.prevTextNode = null;
        var builder = this.context.builder;
        var scriptlet = builder.scriptlet(event);
        this.parentNode.appendChild(scriptlet);
    }

    handleError(event) {
        this.context.addError({
            message: event.message,
            code: event.code,
            pos: event.pos,
            endPos: event.endPos
        });
    }

    get parentNode() {
        var last = this.stack[this.stack.length-1];
        return last.node;
    }

    getTagParseOptions(el) {
        var tagName = el.tagName;
        var tagDef = this.context.getTagDef(tagName);

        var state = getParserStateForTag(this, el, tagDef);
        var parseOptions = tagDef && tagDef.parseOptions;

        if (!state && !parseOptions) {
            return;
        }

        if (parseOptions) {
            if (state) {
                // We need to merge in the state to the returned parse options
                parseOptions = extend({ state: state }, parseOptions);
            }
        } else {
            parseOptions = { state: state };
        }

        return parseOptions;
    }

    isOpenTagOnly(tagName) {
        var tagDef = this.context.getTagDef(tagName);
        return tagDef && tagDef.openTagOnly;
    }
}

module.exports = Parser;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;
var isArray = Array.isArray;
var Container = __webpack_require__(9);

class ArrayContainer extends Container {
    constructor(node, array) {
        super(node);
        this.items = array;
    }

    forEach(callback, thisObj) {
        var array = this.array.concat([]);
        for (var i=0; i<array.length; i++) {
            var item = array[i];
            if (item.container === this) {
                callback.call(thisObj, item, i);
            }
        }
    }

    replaceChild(newChild, oldChild) {
        ok(newChild, '"newChild" is required"');

        var array = this.array;
        var len = array.length;
        for (var i=0; i<len; i++) {
            var curChild = array[i];
            if (curChild === oldChild) {
                array[i] = newChild;
                oldChild.detach();
                newChild.container = this;
                return true;
            }
        }

        return false;
    }

    removeChild(child) {
        var childIndex = this.array.indexOf(child);
        if (childIndex !== -1) {
            this.array.splice(childIndex, 1);
            child.detach();
            return true;
        } else {
            return false;
        }
    }

    removeChildren() {
        this.array.length = 0;
    }

    prependChild(newChild) {
        ok(newChild, '"newChild" is required"');
        this.array.unshift(newChild);
        newChild.container = this;
    }

    appendChild(newChild) {
        ok(newChild, '"newChild" is required"');
        newChild.detach();
        this.array.push(newChild);
        newChild.container = this;
    }

    insertChildBefore(newChild, referenceNode) {
        ok(newChild, '"newChild" is required"');
        ok(referenceNode, 'Invalid reference child');

        var array = this.array;
        var len = array.length;
        for (var i=0; i<len; i++) {
            var curChild = array[i];
            if (curChild === referenceNode) {
                array.splice(i, 0, newChild);
                newChild.container = this;
                return;
            }
        }

        throw new Error('Reference node not found');
    }

    insertChildAfter(newChild, referenceNode) {
        ok(newChild, '"newChild" is required"');
        ok(referenceNode, 'Invalid reference child');

        var array = this.array;
        var len = array.length;
        for (var i=0; i<len; i++) {
            var curChild = array[i];
            if (curChild === referenceNode) {
                array.splice(i+1, 0, newChild);
                newChild.container = this;
                return;
            }
        }

        throw new Error('Reference node not found');
    }

    moveChildrenTo(target) {
        ok(target.appendChild, 'Node does not support appendChild(node): ' + target);

        var array = this.array;
        var len = array.length;
        for (var i=0; i<len; i++) {
            var curChild = array[i];
            curChild.container = null; // Detach the child from this container
            target.appendChild(curChild);
        }

        this.array.length = 0; // Clear out this container
    }

    getPreviousSibling(node) {
        if (node.container !== this) {
            throw new Error('Node does not belong to container: ' + node);
        }
        var array = this.array;



        for (var i=0; i<array.length; i++) {
            var curNode = array[i];
            if (curNode.container !== this) {
                continue;
            }

            if (curNode === node) {
                return i-1 >= 0 ? array[i-1] : undefined;
            }
        }
    }

    getNextSibling(node) {
        if (node.container !== this) {
            throw new Error('Node does not belong to container: ' + node);
        }
        var array = this.array;

        for (var i=0; i<array.length; i++) {
            var curNode = array[i];
            if (curNode.container !== this) {
                continue;
            }

            if (curNode === node) {
                return i+1 < array.length ? array[i+1] : undefined;
            }
        }
    }

    forEachNextSibling(node, callback, thisObj) {
        if (node.container !== this) {
            throw new Error('Node does not belong to container: ' + node);
        }
        var array = this.array.concat([]);
        var found = false;

        for (var i=0; i<array.length; i++) {
            var curNode = array[i];
            if (curNode.container !== this) {
                continue;
            }
            if (found) {
                if (curNode.container === this) {
                    var keepGoing = callback.call(thisObj, curNode) !== false;
                    if (!keepGoing) {
                        return;
                    }
                }
            } else if (curNode === node) {
                found = true;
                continue;
            }
        }
    }

    get firstChild() {
        return this.array[0];
    }

    get length() {
        return this.array.length;
    }

    get items() {
        return this.array;
    }

    set items(newItems) {
        if (newItems) {
            ok(isArray(newItems), 'Invalid array');

            for (let i=0; i<newItems.length; i++) {
                newItems[i].container = this;
            }
        }
        this.array = newItems || [];
    }
}

module.exports = ArrayContainer;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class ArrayExpression extends Node {
    constructor(def) {
        super('ArrayExpression');
        this.elements = def.elements;
    }

    generateCode(codegen) {
        this.elements = codegen.generateCode(this.elements);
        return this;
    }

    writeCode(writer) {
        var elements = this.elements;

        if (!elements || !elements.length) {
            writer.write('[]');
            return;
        }

        writer.incIndent();
        writer.write('[\n');
        writer.incIndent();

        elements.forEach((element, i) => {
            writer.writeLineIndent();
            writer.write(element);

            if (i < elements.length - 1) {
                writer.write(',\n');
            } else {
                writer.write('\n');
            }
        });

        writer.decIndent();
        writer.writeLineIndent();
        writer.write(']');
        writer.decIndent();
    }

    walk(walker) {
        this.elements = walker.walk(this.elements);
    }

    toJSON() {
        return {
            type: 'ArrayExpression',
            elements: this.elements
        };
    }

    toString() {
        var result = '[';
        var elements = this.elements;
        if (elements) {
            elements.forEach((element, i) => {
                if (i !== 0) {
                    result += ', ';
                }
                result += element.toString();
            });
        }

        return result + ']';
    }
}

module.exports = ArrayExpression;

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class Assignment extends Node {
    constructor(def) {
        super('Assignment');
        this.left = def.left;
        this.right = def.right;
        this.operator = def.operator;
    }

    generateCode(codegen) {
        this.left = codegen.generateCode(this.left);
        this.right = codegen.generateCode(this.right);
        return this;
    }

    writeCode(writer) {
        var left = this.left;
        var right = this.right;
        var operator = this.operator;

        writer.write(left);
        writer.write(' '  + (operator || '=') + ' ');

        var wrap = right instanceof Assignment;

        if (wrap) {
            writer.write('(');
        }

        writer.write(right);

        if (wrap) {
            writer.write(')');
        }
    }

    walk(walker) {
        this.left = walker.walk(this.left);
        this.right = walker.walk(this.right);
    }

    isCompoundExpression() {
        return true;
    }

    /**
     * "noOutput" should be true if the Node.js does not result in any HTML or Text output
     */
    get noOutput() {
        return !(this.body && this.body.length);
    }

    toString() {
        var left = this.left;
        var right = this.right;
        var operator = this.operator;

        var result = left.toString() + ' ' + (operator || '=') + ' ';

        var wrap = right instanceof Assignment;

        if (wrap) {
            result += '(';
        }

        result += right.toString();

        if (wrap) {
            result += ')';
        }

        return result;
    }
}

module.exports = Assignment;

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class AttributePlaceholder extends Node {
    constructor(def) {
        super('AttributePlaceholder');
        this.value = def.value;
        this.escape = def.escape;
    }

    generateCode(codegen) {
        this.value = codegen.generateCode(this.value);
        return this;
    }

    writeCode(writer) {
        writer.write(this.value);
    }

    walk(walker) {
        this.value = walker.walk(this.value);
    }

    isCompoundExpression() {
        return this.value.isCompoundExpression();
    }

    /**
     * "noOutput" should be true if the Node.js does not result in any HTML or Text output
     */
    get noOutput() {
        return this.value.noOutput;
    }
}

module.exports = AttributePlaceholder;

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var adjustIndent = __webpack_require__(49);

class Code extends Node {
    constructor(def) {
        super('Code');
        this.value = def.value;
    }

    generateCode(codegen) {
        return this;
    }

    writeCode(writer) {
        var code = this.value;

        if (!code) {
            return;
        }

        code = adjustIndent(code, writer.currentIndent);

        writer.write(code);
    }
}

module.exports = Code;

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class ConditionalExpression extends Node {
    constructor(def) {
        super('ConditionalExpression');
        this.test = def.test;
        this.consequent = def.consequent;
        this.alternate = def.alternate;
    }

    generateCode(codegen) {
        this.test = codegen.generateCode(this.test);
        this.consequent = codegen.generateCode(this.consequent);
        this.alternate = codegen.generateCode(this.alternate);
        return this;
    }

    writeCode(writer) {
        var test = this.test;
        var consequent = this.consequent;
        var alternate = this.alternate;

        writer.write(test);
        writer.write(' ? ');
        writer.write(consequent);
        writer.write(' : ');
        writer.write(alternate);
    }

    isCompoundExpression() {
        return true;
    }

    toJSON() {
        return {
            type: 'ConditionalExpression',
            test: this.test,
            consequent: this.consequent,
            alternate: this.alternate
        };
    }

    walk(walker) {
        this.test = walker.walk(this.test);
        this.consequent = walker.walk(this.consequent);
        this.alternate = walker.walk(this.alternate);
    }

    toString() {
        var test = this.test;
        var consequent = this.consequent;
        var alternate = this.alternate;
        return test.toString() + ' ? ' + consequent + ' : ' + alternate;
    }
}

module.exports = ConditionalExpression;

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class ContainerNode extends Node {
    constructor(type) {
        super(type);
        this.body = this.makeContainer([]);
    }

    generateCode(codegen) {
        return codegen.generateCode(this.body);
    }

    walk(walker) {
        this.body = walker.walk(this.body);
    }
}

module.exports = ContainerNode;

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Node = __webpack_require__(0);

class Declaration extends Node {
    constructor(def) {
        super('Declaration');
        this.declaration = def.declaration;
    }

    generateHTMLCode(codegen) {
        var builder = codegen.builder;

        return [
            builder.htmlLiteral('<?'),
            codegen.generateCode(builder.text(this.declaration)),
            builder.htmlLiteral('?>')
        ];
    }

    toJSON() {
        return {
            type: this.type,
            value: this.value
        };
    }
}

module.exports = Declaration;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Node = __webpack_require__(0);

class DocumentType extends Node {
    constructor(def) {
        super('DocumentType');
        this.documentType = def.documentType;
    }

    generateHTMLCode(codegen) {
        var builder = codegen.builder;

        return [
            builder.htmlLiteral('<!'),
            builder.html(codegen.generateCode(this.documentType)),
            builder.htmlLiteral('>')
        ];
    }

    generateVDOMCode(codegen) {
        return null;
    }

    toJSON() {
        return {
            type: this.type,
            value: this.value
        };
    }
}

module.exports = DocumentType;

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class Else extends Node {
    constructor(def) {
        super('Else');
        this.body = this.makeContainer(def.body);
        this.matched = false;
    }

    generateCode(codegen) {
        if (!this.matched) {
            codegen.addError('Unmatched else statement');
            return;
        }

        this.body = codegen.generateCode(this.body);
        return this;
    }

    writeCode(writer) {
        var body = this.body;
        writer.writeBlock(body);
        writer.write('\n');
    }

    walk(walker) {
        this.body = walker.walk(this.body);
    }
}

module.exports = Else;

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class ElseIf extends Node {
    constructor(def) {
        super('ElseIf');
        this.test = def.test;
        this.body = this.makeContainer(def.body);
        this.else = def.else;
        this.matched = false;
    }

    generateCode(codegen) {
        if (!this.matched) {
            codegen.addError('Unmatched else statement');
            return;
        }

        return codegen.builder.ifStatement(this.test, this.body, this.else);
    }

    walk(walker) {
        this.test = walker.walk(this.test);
        this.body = walker.walk(this.body);
        this.else = walker.walk(this.else);
    }
}

module.exports = ElseIf;

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var ok = __webpack_require__(1).ok;

class Expression extends Node {
    constructor(def) {
        super('Expression');
        this.value = def.value;
        ok(this.value != null, 'Invalid expression');
    }

    generateCode(codegen) {
        return this;
    }

    writeCode(writer) {
        writer.write(this.value);
    }

    isCompoundExpression() {
        return true;
    }

    toString() {
        return this.value;
    }
}

module.exports = Expression;

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ok = __webpack_require__(1).ok;
var Node = __webpack_require__(0);

class ForEach extends Node {
    constructor(def) {
        super('ForEach');
        this.varName = def.varName;
        this.in = def.in;
        this.body = this.makeContainer(def.body);
        this.separator = def.separator;
        this.statusVarName = def.statusVarName;
        this.iterator = def.iterator;
        this.isArray = def.isArray;

        ok(this.varName, '"varName" is required');
        ok(this.in != null, '"in" is required');
    }

    generateCode(codegen) {
        var varName = this.varName;
        var inExpression = this.in;
        var separator = this.separator;
        var statusVarName = this.statusVarName;
        var iterator = this.iterator;
        var context = codegen.context;
        var builder = codegen.builder;
        var isArray = this.isArray;

        if (separator && !statusVarName) {
            statusVarName = '__loop';
        }

        if (iterator) {
            let params = [varName];

            if (statusVarName) {
                params.push(statusVarName);
            }

            return builder.functionCall(iterator, [
                inExpression,
                builder.functionDeclaration(null, params, this.body)
            ]);
        } else if (statusVarName) {

            let body = this.body;

            if (separator) {
                let isNotLastTest = builder.functionCall(
                    builder.memberExpression(statusVarName, builder.identifier('isLast')),
                    []);

                isNotLastTest = builder.negate(isNotLastTest);

                body = body.items.concat([
                    builder.ifStatement(isNotLastTest, [
                        builder.text(separator, false)
                    ])
                ]);
            }

            return builder.functionCall(context.helper('forEachWithStatusVar'), [
                inExpression,
                builder.functionDeclaration(null, [varName, statusVarName], body)
            ]);
        } else {
            if (isArray) {
                context.addVar(varName.name);
                var indexVarId = context.addVar(varName.name + '__i');
                var arrayVarId = context.addVar(varName.name + '__array');
                var lengthVarId = context.addVar(varName.name + '__len');

                var init = builder.sequenceExpression([
                    builder.assignment(indexVarId, builder.literal(0)),
                    builder.assignment(arrayVarId, inExpression),
                    builder.assignment(lengthVarId, builder.binaryExpression(arrayVarId, '&&', builder.memberExpression(arrayVarId, builder.identifier('length'))))
                ]);

                var test = builder.binaryExpression(indexVarId, '<', lengthVarId);

                var update = builder.unaryExpression(indexVarId, '++');

                var loopBody = [
                        builder.assignment(varName, builder.memberExpression(arrayVarId, indexVarId, true))
                    ].concat(this.body);

                return builder.forStatement(init, test, update, loopBody);
            } else {
                return builder.functionCall(context.helper('forEach'), [
                    inExpression,
                    builder.functionDeclaration(null, [varName], this.body)
                ]);
            }
        }
    }

    walk(walker) {
        this.varName = walker.walk(this.varName);
        this.in = walker.walk(this.in);
        this.body = walker.walk(this.body);
        this.separator = walker.walk(this.separator);
        this.statusVarName = walker.walk(this.statusVarName);
        this.iterator = walker.walk(this.iterator);
    }
}

module.exports = ForEach;

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ok = __webpack_require__(1).ok;
var Node = __webpack_require__(0);

class ForEachProp extends Node {
    constructor(def) {
        super('ForEachProp');
        this.nameVarName = def.nameVarName;
        this.valueVarName = def.valueVarName;
        this.in = def.in;
        this.separator = def.separator;
        this.statusVarName = def.statusVarName;
        this.body = this.makeContainer(def.body);

        ok(this.nameVarName, '"nameVarName" is required');
        ok(this.valueVarName != null, '"valueVarName" is required');
        ok(this.in != null, '"in" is required');
    }

    generateCode(codegen) {
        var context = codegen.context;
        var nameVarName = this.nameVarName;
        var valueVarName = this.valueVarName;
        var inExpression = this.in;
        var body = this.body;
        var separator = this.separator;
        var statusVarName = this.statusVarName;

        if (separator && !statusVarName) {
            statusVarName = '__loop';
        }

        var builder = codegen.builder;

        if (statusVarName) {
            let helperVar = context.helper('forEachPropStatusVar');
            let forEachVarName = codegen.addStaticVar('forEacPropStatusVar', helperVar);
            let body = this.body;

            if (separator) {
                let isNotLastTest = builder.functionCall(
                    builder.memberExpression(statusVarName, builder.identifier('isLast')),
                    []);

                isNotLastTest = builder.negate(isNotLastTest);

                body = body.items.concat([
                    builder.ifStatement(isNotLastTest, [
                        builder.text(separator)
                    ])
                ]);
            }

            return builder.functionCall(forEachVarName, [
                inExpression,
                builder.functionDeclaration(null, [nameVarName, valueVarName, statusVarName], body)
            ]);
        } else {
            return builder.functionCall(
                context.helper('forEachProp'),
                [
                    inExpression,
                    builder.functionDeclaration(null, [nameVarName, valueVarName], body)
                ]);
        }
    }

    walk(walker) {
        this.nameVarName = walker.walk(this.nameVarName);
        this.valueVarName = walker.walk(this.valueVarName);
        this.in = walker.walk(this.in);
        this.body = walker.walk(this.body);
    }
}

module.exports = ForEachProp;

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ok = __webpack_require__(1).ok;
var Node = __webpack_require__(0);
var Literal = __webpack_require__(3);
var Identifier = __webpack_require__(10);

class ForRange extends Node {
    constructor(def) {
        super('ForRange');
        this.varName = def.varName;
        this.body = this.makeContainer(def.body);
        this.from = def.from;
        this.to = def.to;
        this.step = def.step;

        ok(this.varName, '"varName" is required');
        ok(this.from != null, '"from" is required');
    }

    generateCode(codegen) {
        var context = codegen.context;

        var varName = this.varName;
        var from = this.from;
        var to = this.to;
        var step = this.step;

        var builder = codegen.builder;

        if (varName instanceof Identifier) {
            varName = varName.name;
        }

        if (step == null) {
            let fromLiteral = (from instanceof Literal) && from.value;
            let toLiteral = (to instanceof Literal) && to.value;

            if (typeof fromLiteral === 'number' && typeof toLiteral === 'number') {
                if (fromLiteral > toLiteral) {
                    step = builder.literal(-1);
                } else {
                    step = builder.literal(1);
                }
            }
        }

        if (step == null) {
            step = builder.literalNull();
        }

        return builder.functionCall(context.helper('forRange'), [
            from,
            to,
            step,
            builder.functionDeclaration(null, [varName], this.body)
        ]);
    }

    walk(walker) {
        this.varName = walker.walk(this.varName);
        this.body = walker.walk(this.body);
        this.from = walker.walk(this.from);
        this.to = walker.walk(this.to);
        this.step = walker.walk(this.step);
    }
}

module.exports = ForRange;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class ForStatement extends Node {
    constructor(def) {
        super('ForStatement');
        this.init = def.init;
        this.test = def.test;
        this.update = def.update;
        this.body = this.makeContainer(def.body);
    }

    generateCode(codegen) {
        this.init = codegen.generateCode(this.init);
        this.test = codegen.generateCode(this.test);
        this.update = codegen.generateCode(this.update);
        this.body = codegen.generateCode(this.body);
        return this;
    }

    writeCode(writer) {
        var init = this.init;
        var test = this.test;
        var update = this.update;
        var body = this.body;

        writer.write('for (');

        if (init) {
            writer.write(init);
        }

        writer.write('; ');

        if (test) {
            writer.write(test);
        }

        writer.write('; ');

        if (update) {
            writer.write(update);
        }

        writer.write(') ');

        writer.writeBlock(body);

        writer.write('\n');
    }

    walk(walker) {
        this.init = walker.walk(this.init);
        this.test = walker.walk(this.test);
        this.update = walker.walk(this.update);
        this.body = walker.walk(this.body);
    }
}

module.exports = ForStatement;

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ok = __webpack_require__(1).ok;

var Node = __webpack_require__(0);
var isCompoundExpression = __webpack_require__(7);

class FunctionCall extends Node {
    constructor(def) {
        super('FunctionCall');
        this.callee = def.callee;

        ok(this.callee, '"callee" is required');

        let args = this.args = def.args;

        if (args) {
            if (!Array.isArray(args)) {
                throw new Error('Invalid args');
            }

            for (let i=0; i<args.length; i++) {
                let arg = args[i];
                if (!arg) {
                    throw new Error('Arg ' + i + ' is not valid for function call: ' + JSON.stringify(this.toJSON(), null, 2));
                }
            }
        }
    }

    generateCode(codegen) {
        this.callee = codegen.generateCode(this.callee);
        this.args = codegen.generateCode(this.args);

        return this;
    }

    writeCode(writer) {
        var callee = this.callee;
        var args = this.args;

        var wrapWithParens = isCompoundExpression(callee);

        if (wrapWithParens) {
            writer.write('(');
        }

        writer.write(callee);

        if (wrapWithParens) {
            writer.write(')');
        }

        writer.write('(');

        if (args && args.length) {
            for (let i=0, argsLen = args.length; i<argsLen; i++) {
                if (i !== 0) {
                    writer.write(', ');
                }

                let arg = args[i];
                if (!arg) {
                    throw new Error('Arg ' + i + ' is not valid for function call: ' + JSON.stringify(this.toJSON()));
                }
                writer.write(arg);
            }
        }

        writer.write(')');


    }

    walk(walker) {
        this.callee = walker.walk(this.callee);
        this.args = walker.walk(this.args);
    }

    toString() {
        var callee = this.callee;
        var args = this.args;

        var result = callee.toString() + '(';

        if (args && args.length) {
            for (let i=0, argsLen = args.length; i<argsLen; i++) {
                if (i !== 0) {
                    result += ', ';
                }

                let arg = args[i];
                if (!arg) {
                    throw new Error('Arg ' + i + ' is not valid for function call: ' + JSON.stringify(this.toJSON()));
                }
                result += arg;
            }
        }

        result += ')';
        return result;
    }
}

module.exports = FunctionCall;

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var ok = __webpack_require__(1).ok;

class FunctionDeclaration extends Node {
    constructor(def) {
        super('FunctionDeclaration');
        this.name = def.name;
        this.params = def.params;
        this.body = this.makeContainer(def.body);
    }

    generateCode(codegen) {
        var oldInFunction = codegen.inFunction;
        codegen.inFunction = true;
        this.body = codegen.generateCode(this.body);
        codegen.inFunction = oldInFunction;
        return this;
    }

    writeCode(writer) {
        var name = this.name;
        var params = this.params;
        var body = this.body;
        var statement = this.statement;

        if (name != null) {
            ok(typeof name === 'string' || name.type === 'Identifier', 'Function name should be a string or Identifier');
        }

        if (name) {
            writer.write('function ');
            writer.write(name);
            writer.write('(');
        } else {
            writer.write('function(');
        }

        if (params && params.length) {
            for (let i=0, paramsLen = params.length; i<paramsLen; i++) {
                if (i !== 0) {
                    writer.write(', ');
                }
                var param = params[i];

                if (typeof param === 'string') {
                    writer.write(param);
                } else {
                    if (param.type !== 'Identifier') {
                        throw new Error('Illegal param ' + JSON.stringify(param) + ' for FunctionDeclaration: ' + JSON.stringify(this));
                    }
                    writer.write(param);
                }
            }
        }

        writer.write(') ');

        writer.writeBlock(body);

        if (statement) {
            writer.write('\n');
        }
    }

    isCompoundExpression() {
        return true;
    }

    walk(walker) {
        this.name = walker.walk(this.name);
        this.params = walker.walk(this.params);
        this.body = walker.walk(this.body);
    }
}

module.exports = FunctionDeclaration;

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var runtimeHtmlHelpers = __webpack_require__(17);
var attr = runtimeHtmlHelpers.a;
var escapeXmlAttr = runtimeHtmlHelpers.xa;

function isStringLiteral(node) {
    return node.type === 'Literal' && typeof node.value === 'string';
}

function isNoEscapeXml(node) {
    return node.type === 'AttributePlaceholder' &&
        node.escape === false;
}

function flattenAttrConcats(node) {
    // return [node];

    function flattenHelper(node) {
        if (node.type === 'BinaryExpression' && node.operator === '+') {
            let left = flattenHelper(node.left);
            let right = flattenHelper(node.right);

            var isString = left.isString || right.isString;

            if (isString) {
                return {
                    isString: true,
                    concats: left.concats.concat(right.concats)
                };
            } else {
                return {
                    isString: false,
                    concats: [node]
                };
            }

        }

        return {
            isString: isStringLiteral(node) || node.type === 'AttributePlaceholder',
            concats: [node]
        };
    }

    var final = flattenHelper(node);
    return final.concats;
}

function generateCodeForExpressionAttr(name, value, escape, codegen) {
    var flattenedConcats = flattenAttrConcats(value);

    var hasLiteral = false;
    var builder = codegen.builder;
    var finalNodes = [];
    var context = codegen.context;

    function addHtml(argument) {
        finalNodes.push(builder.html(argument));
    }

    function addHtmlLiteral(value) {
        finalNodes.push(builder.htmlLiteral(value));
    }


    for (let i=0; i<flattenedConcats.length; i++) {
        if (flattenedConcats[i].type === 'Literal' || flattenedConcats[i].type === 'AttributePlaceholder') {
            hasLiteral = true;
            break;
        }
    }

    if (hasLiteral) {
        addHtmlLiteral(' ' + name + '="');
        for (let i=0; i<flattenedConcats.length; i++) {
            var part = flattenedConcats[i];
            if (isStringLiteral(part)) {
                part.value = escapeXmlAttr(part.value);
            } else if (part.type === 'Literal') {
            } else if (isNoEscapeXml(part)) {
                part = codegen.builder.functionCall(context.helper('str'), [part]);
            } else {
                if (escape !== false) {
                    part = builder.functionCall(context.helper('escapeXmlAttr'), [part]);
                }
            }
            addHtml(part);
        }
        addHtmlLiteral('"');
    } else {
        if (name === 'class') {
            addHtml(codegen.builder.functionCall(context.helper('classAttr'), [value]));
        } else if (name === 'style') {
            addHtml(codegen.builder.functionCall(context.helper('styleAttr'), [value]));
        } else {
            if (escape === false || isNoEscapeXml(value)) {
                escape = false;
            }

            let attrArgs = [codegen.builder.literal(name), value];

            if (escape === false) {
                attrArgs.push(codegen.builder.literal(false));
            }

            addHtml(codegen.builder.functionCall(context.helper('attr'), attrArgs));
        }
    }

    return finalNodes;
}

module.exports = function generateCode(node, codegen) {
    let name = node.name;
    let value = node.value;
    let argument = node.argument;
    let escape = node.escape !== false;
    var builder = codegen.builder;

    if (!name) {
        return null;
    }

    if (node.isLiteralValue()) {
        let literalValue = value.value;

        if (literalValue instanceof RegExp) {
            literalValue = literalValue.source;
        }

        return builder.htmlLiteral(attr(name, literalValue));
    } else if (value != null) {
        return generateCodeForExpressionAttr(name, value, escape, codegen);
    } else if (argument) {
        return [
            builder.htmlLiteral(' ' + name + '('),
            builder.htmlLiteral(argument),
            builder.htmlLiteral(')')
        ];
    } else {
        // Attribute with no value is a boolean attribute
        return builder.htmlLiteral(' ' + name);
    }
};


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var Literal = __webpack_require__(3);
var ok = __webpack_require__(1).ok;
var compiler = __webpack_require__(14);
var generateHTMLCode = __webpack_require__(106);
var generateVDOMCode = __webpack_require__(108);
var vdomUtil = __webpack_require__(12);

function beforeGenerateCode(event) {
    event.codegen.isInAttribute = true;
}

function afterGenerateCode(event) {
    event.codegen.isInAttribute = false;
}

class HtmlAttribute extends Node {
    constructor(def) {
        super('HtmlAttribute');

        ok(def, 'Invalid attribute definition');
        this.type = 'HtmlAttribute';
        this.name = def.name;
        this.value = def.value;
        this.rawValue = def.rawValue;
        this.escape = def.escape;

        if (typeof this.value === 'string') {
            this.value = compiler.builder.parseExpression(this.value);
        }

        if (this.value && !(this.value instanceof Node)) {
            throw new Error('"value" should be a Node instance');
        }

        this.argument = def.argument;

        this.def = def.def; // The attribute definition loaded from the taglib (if any)

        this.on('beforeGenerateCode', beforeGenerateCode);
        this.on('afterGenerateCode', afterGenerateCode);
    }

    generateHTMLCode(codegen) {
        return generateHTMLCode(this, codegen);
    }

    generateVDOMCode(codegen) {
        return generateVDOMCode(this, codegen, vdomUtil);
    }

    isLiteralValue() {
        return this.value instanceof Literal;
    }

    isLiteralString() {
        return this.isLiteralValue() &&
            typeof this.value.value === 'string';
    }

    isLiteralBoolean() {
        return this.isLiteralValue() &&
            typeof this.value.value === 'boolean';
    }

    walk(walker) {
        this.value = walker.walk(this.value);
    }

    get literalValue() {
        if (this.isLiteralValue()) {
            return this.value.value;
        } else {
            throw new Error('Attribute value is not a literal value. Actual: ' + JSON.stringify(this.value, null, 2));
        }
    }
}

HtmlAttribute.isHtmlAttribute = function(attr) {
    return (attr instanceof HtmlAttribute);
};

module.exports = HtmlAttribute;

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function generateCode(node, codegen, vdomUtil) {
    var context = codegen.context;
    var builder = codegen.builder;

    // node.name = codegen.generateCode(node.name);
    node.value = codegen.generateCode(node.value);
    node.isStatic = vdomUtil.isStaticValue(node.value);
    var name = node.name;

    var attrValue = node.value;

    if (attrValue) {
        if (attrValue.type === 'Literal') {
            var literalValue = attrValue.value;

            if (literalValue instanceof RegExp) {
                node.value = builder.literal(literalValue.source);
            }
        } else {
            if (name === 'class') {
                node.value = builder.functionCall(context.helper('classAttr'), [attrValue]);
            } else if (name === 'style') {
                node.value = builder.functionCall(context.helper('styleAttr'), [attrValue]);
            }
        }
    }

    return node;
};

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;

var HtmlAttribute = __webpack_require__(107);
var Node = __webpack_require__(0);

class HtmlAttributeCollection {
    constructor(attributes) {
        this.replaceAttributes(attributes);
    }

    addAttribute(newAttr) {
        if (arguments.length === 2) {
            let name = arguments[0];
            let expression = arguments[1];
            newAttr = new HtmlAttribute(name, expression);
        } else if (!HtmlAttribute.isHtmlAttribute(newAttr)) {
            newAttr = new HtmlAttribute(newAttr);
        }

        var name = newAttr.name;

        if (this.lookup.hasOwnProperty(name)) {
            for (var i=0; i<this.all.length; i++) {
                var curAttr = this.all[i];
                if (curAttr.name === name) {
                    this.all.splice(i, 1);
                    break;
                }
            }
        }

        if (name) {
            this.lookup[name] = newAttr;
        }

        this.all.push(newAttr);
    }

    removeAttribute(name) {
        ok(typeof name === 'string', 'Invalid attribute name');

        if (!this.lookup.hasOwnProperty(name)) {
            return false;
        }

        delete this.lookup[name];

        for (var i=0; i<this.all.length; i++) {
            var curAttr = this.all[i];
            if (curAttr.name === name) {
                this.all.splice(i, 1);
                break;
            }
        }

        return true;
    }

    renameAttribute(oldName, newName) {
        var key = oldName;

        var attr = this.lookup[key];
        if (!attr) {
            return;
        }

        attr.name = newName;
        delete this.lookup[key];
        this.lookup[key] = attr;
    }

    removeAllAttributes() {
        this.replaceAttributes([]);
    }

    hasAttribute(name) {
        ok(typeof name === 'string', 'Invalid attribute name');
        return this.lookup.hasOwnProperty(name);
    }

    hasAttributes() {
        return this.all.length > 0;
    }

    getAttribute(name) {
        return this.lookup[name];
    }

    setAttributeValue(name, value, escape) {
        var attr = this.getAttribute(name);
        if (attr) {
            attr.value = value;
            if (typeof escape === 'boolean') {
                attr.escape = escape;
            }
        } else {
            this.addAttribute({
                name: name,
                value: value,
                escape: escape
            });
        }
    }

    getAttributes() {
        return this.all;
    }

    toJSON() {
        return this.all;
    }

    toString() {
        return JSON.stringify(this.all);
    }

    replaceAttributes(attributes) {
        this.all = [];
        this.lookup = {};

        if (attributes) {
            if (Array.isArray(attributes)) {
                attributes.forEach((attr) => {
                    this.addAttribute(attr);
                });
            } else {
                for (var attrName in attributes) {
                    if (attributes.hasOwnProperty(attrName)) {
                        let attrValue = attributes[attrName];
                        let attrDef;

                        if (attrValue != null && typeof attrValue === 'object' && !(attrValue instanceof Node)) {
                            attrDef = attrValue;
                            attrDef.name = attrName;
                        } else {
                            attrDef = {
                                name: attrName,
                                value: attrValue
                            };
                        }

                        this.addAttribute(attrDef);
                    }
                }
            }
        }
    }

    walk(walker) {
        var newAttributes = walker.walk(this.all);
        this.replaceAttributes(newAttributes);
    }
}

module.exports = HtmlAttributeCollection;

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class HtmlComment extends Node {
    constructor(def) {
        super('HtmlComment');
        this.comment = def.comment;
    }

    generateHTMLCode(codegen) {
        var comment = this.comment;
        var builder = codegen.builder;

        return [
            builder.htmlLiteral('<!--'),
            builder.html(comment),
            builder.htmlLiteral('-->')
        ];
    }

    generateVDOMCode(codegen) {
        var comment = this.comment;
        var builder = codegen.builder;

        return builder.functionCall(
            builder.memberExpression(
                builder.identifierOut(),
                builder.identifier('comment')),
            [
                comment
            ]);
    }

    walk(walker) {
        this.comment = walker.walk(this.comment);
    }
}

module.exports = HtmlComment;

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class EndTag extends Node {
    constructor(def) {
        super('EndTag');
        this.tagName = def.tagName;
    }

    generateCode(codegen) {
        var tagName = this.tagName;
        var builder = codegen.builder;

        return [
            builder.htmlLiteral('</'),
            builder.html(tagName),
            builder.htmlLiteral('>')
        ];
    }
}

module.exports = EndTag;

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class StartTag extends Node {
    constructor(def) {
        super('StartTag');

        this.tagName = def.tagName;
        this.attributes = def.attributes;
        this.properties = def.properties;
        this.argument = def.argument;
        this.selfClosed = def.selfClosed;
        this.dynamicAttributes = def.dynamicAttributes;
    }

    generateCode(codegen) {
        var builder = codegen.builder;

        var tagName = this.tagName;
        var selfClosed = this.selfClosed;
        var dynamicAttributes = this.dynamicAttributes;
        var context = codegen.context;

        var nodes = [
            builder.htmlLiteral('<'),
            builder.html(tagName),
        ];

        var attributes = this.attributes;

        if (attributes) {
            for (let i=0; i<attributes.length; i++) {
                let attr = attributes[i];
                nodes.push(codegen.generateCode(attr));
            }
        }

        if (dynamicAttributes) {
            dynamicAttributes.forEach(function(attrsExpression) {
                let attrsFunctionCall = builder.functionCall(context.helper('attrs'), [attrsExpression]);
                nodes.push(builder.html(attrsFunctionCall));
            });
        }

        if (selfClosed) {
            nodes.push(builder.htmlLiteral('/>'));
        } else {
            nodes.push(builder.htmlLiteral('>'));
        }

        return nodes;
    }
}

module.exports = StartTag;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var StartTag = __webpack_require__(112);
var EndTag = __webpack_require__(111);

module.exports = function generateCode(node, codegen) {
    var builder = codegen.builder;
    var tagName = node.tagName;

    // Convert the tag name into a Node so that we generate the code correctly
    if (tagName) {
        tagName = codegen.builder.literal(tagName);
    } else {
        tagName = node.tagNameExpression;
    }

    var properties = node.getProperties();

    if (properties) {
        var objectProps = Object.keys(properties).map((propName) => {
            return builder.property(
                builder.identifier(propName),
                properties[propName]);
        });

        node.setAttributeValue('data-marko',
            builder.objectExpression(objectProps),
            false);
    }

    var attributes = node._attributes && node._attributes.all;

    var body = node.body;
    var argument = node.argument;
    var hasBody = body && body.length;
    var openTagOnly = node.openTagOnly;
    var bodyOnlyIf = node.bodyOnlyIf;
    var dynamicAttributes = node.dynamicAttributes;
    var selfClosed = node.selfClosed === true;



    if (hasBody) {
        body = codegen.generateCode(body);
    }

    if (hasBody || bodyOnlyIf) {
        openTagOnly = false;
        selfClosed = false;
    } else if (selfClosed){
        openTagOnly = true;
    }

    var startTag = new StartTag({
        tagName: tagName,
        attributes: attributes,
        properties: properties,
        argument: argument,
        selfClosed: selfClosed,
        dynamicAttributes: dynamicAttributes
    });

    var endTag;

    if (!openTagOnly) {
        endTag = new EndTag({
            tagName: tagName
        });
    }

    if (bodyOnlyIf) {
        var startIf = builder.ifStatement(builder.negate(bodyOnlyIf), [
            startTag
        ]);

        var endIf = builder.ifStatement(builder.negate(bodyOnlyIf), [
            endTag
        ]);

        return [
            startIf,
            body,
            endIf
        ];
    } else {
        if (openTagOnly) {
            return codegen.generateCode(startTag);
        } else {
            return [
                startTag,
                body,
                endTag
            ];
        }
    }
};


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const Node = __webpack_require__(0);

class EndElementVDOM extends Node {
    constructor() {
        super('EndElementVDOM');
    }

    writeCode(writer) {
        writer.write('out.ee()');
    }
}

module.exports = EndElementVDOM;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Node = __webpack_require__(0);
const vdomUtil = __webpack_require__(12);

var FLAG_IS_SVG = 1;
var FLAG_IS_TEXTAREA = 2;
var FLAG_SIMPLE_ATTRS = 4;

function finalizeCreateArgs(createArgs, builder) {
    var length = createArgs.length;
    var lastArg;

    for (var i=length-1; i>=0; i--) {
        var arg = createArgs[i];
        if (arg) {
            lastArg = arg;
        } else {
            if (lastArg != null) {
                if (i === 3) {
                    // Use a literal 0 for the flags
                    createArgs[i] = builder.literal(0);
                } else {
                    createArgs[i] = builder.literalNull();
                }

            } else {
                length--;
            }
        }
    }

    createArgs.length = length;
    return createArgs;
}

const MAYBE_SVG = {
    'a': true,
    'script': true,
    'style': true
};

const SIMPLE_ATTRS = {
    'class': true,
    'style': true,
    'id': true
};

class HtmlElementVDOM extends Node {
    constructor(def) {
        super('HtmlElementVDOM');
        this.tagName = def.tagName;
        this.isStatic = def.isStatic;
        this.isAttrsStatic = def.isAttrsStatic;
        this.isHtmlOnly = def.isHtmlOnly;
        this.attributes = def.attributes;
        this.properties = def.properties;
        this.body = def.body;
        this.dynamicAttributes = def.dynamicAttributes;

        this.isSVG = false;
        this.isTextArea = false;
        this.hasAttributes = false;
        this.hasSimpleAttrs = false; // This will be set to true if the HTML element
                                     // only attributes in the following set:
                                     // ['id', 'style', 'class']

        this.isChild = false;
        this.createElementId = undefined;
        this.attributesArg = undefined;
        this.propertiesArg = undefined;
        this.nextConstId = undefined;
    }

    generateCode(codegen) {
        let context = codegen.context;
        let builder = codegen.builder;

        vdomUtil.registerOptimizer(context);

        let tagName = this.tagName;

        if (tagName.type === 'Literal' && typeof tagName.value === 'string') {
            let tagDef = context.getTagDef(tagName.value);
            if (tagDef) {
                if (tagDef.htmlType  === 'svg') {
                    this.isSVG = true;
                } else {
                    if (MAYBE_SVG[tagName.value] && context.isFlagSet('SVG')) {
                        this.isSVG = true;
                    } else {
                        this.tagName = tagName = builder.literal(tagName.value.toUpperCase());

                        if (tagName.value === 'TEXTAREA') {
                            this.isTextArea = true;
                        }
                    }
                }
            }
            this.isLiteralTag = true;
        } else if (context.isFlagSet('SVG')) {
            this.isSVG = true;
        }

        let attributes = this.attributes;
        let properties = this.properties;
        let dynamicAttributes = this.dynamicAttributes;

        let attributesArg = null;

        var hasNamedAttributes = false;
        var hasDynamicAttributes = dynamicAttributes != null && dynamicAttributes.length !== 0;

        var hasSimpleAttrs = true;

        if (properties && properties.noupdate) {
            // Preserving attributes requires extra logic that we cannot
            // shortcircuit
            hasSimpleAttrs = false;
        }

        if (attributes != null && attributes.length !== 0) {
            let addAttr = function(name, value) {
                hasNamedAttributes = true;

                if (!SIMPLE_ATTRS[name]) {
                    hasSimpleAttrs = false;
                }

                if (!attributesArg) {
                    attributesArg = {};
                }

                if (value.type === 'Literal') {
                    let literalValue = value.value;
                    if (literalValue == null || literalValue === false) {
                        return;
                    } else if (typeof literalValue === 'number') {
                        value.value = literalValue.toString();
                    }
                } else if (value.type === 'AttributePlaceholder') {
                    value = codegen.builder.functionCall(context.helper('str'), [value]);
                }

                attributesArg[name] = value;
            };

            attributes.forEach((attr) => {
                let value = attr.value;

                if (value == null) {
                    value = builder.literal(true);
                }

                if (!attr.name) {
                    return;
                }

                addAttr(attr.name, value);
            });

            if (attributesArg) {
                attributesArg = builder.literal(attributesArg);
            }
        }

        if (hasDynamicAttributes) {
            dynamicAttributes.forEach((attrs) => {
                if (attributesArg) {
                    let mergeVar = context.helper('merge');
                    attributesArg = builder.functionCall(mergeVar, [
                        attributesArg, // Input props from the attributes take precedence
                        attrs
                    ]);
                } else {
                    attributesArg = attrs;
                }
            });
        }

        if (!this.isAttrsStatic && hasNamedAttributes && hasSimpleAttrs && !hasDynamicAttributes) {
            this.hasSimpleAttrs = true;
        }

        this.hasAttributes = hasNamedAttributes || hasDynamicAttributes;

        this.attributesArg = attributesArg;

        return this;
    }

    walk(walker) {
        this.tagName = walker.walk(this.tagName);
        this.attributes = walker.walk(this.attributes);
        this.body = walker.walk(this.body);
    }

    writeCode(writer) {
        let builder = writer.builder;

        let body = this.body;
        let attributesArg = this.attributesArg;
        let nextConstId = this.nextConstId;
        let tagName = this.tagName;

        let childCount = body && body.length;

        let createArgs = new Array(5); // tagName, attributes, childCount, const ID, flags

        createArgs[0] = tagName;

        if (attributesArg) {
            createArgs[1] = attributesArg;
        }

        if (childCount != null) {
            createArgs[2] = builder.literal(childCount);
        }



        var flags = 0;

        if (this.isSVG) {
            flags |= FLAG_IS_SVG;
        }

        if (this.isTextArea) {
            flags |= FLAG_IS_TEXTAREA;
        }

        if (this.hasSimpleAttrs) {
            flags |= FLAG_SIMPLE_ATTRS;
        }

        if (flags) {
            createArgs[3] = builder.literal(flags);
        }

        if (nextConstId) {
            if (!this.properties) {
                this.properties = {};
            }
            this.properties.c = nextConstId;
        }

        if (this.properties) {
            createArgs[4] = builder.literal(this.properties);
        }

        // Remove trailing undefined arguments and convert non-trailing
        // undefined elements to a literal null node
        createArgs = finalizeCreateArgs(createArgs, builder);

        let funcCall;

        if (this.isChild) {
            writer.write('.');

            funcCall = builder.functionCall(
                builder.identifier(this.isLiteralTag || this.isSVG ? 'e' : 'ed'),
                createArgs);
        } else if (this.isStatic && this.createElementId) {
            funcCall = builder.functionCall(
                this.createElementId,
                createArgs);
        } else if (this.isHtmlOnly) {
            writer.write('out.');
            funcCall = builder.functionCall(
                builder.identifier(this.isLiteralTag || this.isSVG ? 'e' : 'ed'),
                createArgs);
        } else {
            writer.write('out.');
            funcCall = builder.functionCall(
                builder.identifier(this.isLiteralTag || this.isSVG ? 'be' : 'bed'),
                createArgs);
        }

        writer.write(funcCall);

        if (body && body.length) {
            writer.incIndent();
            for(let i=0; i<body.length; i++) {
                let child = body[i];
                child.isChild = true;
                writer.write('\n');
                writer.writeLineIndent();
                writer.write(child);
            }
            writer.decIndent();
        }
    }
}

module.exports = HtmlElementVDOM;


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var HtmlElementVDOM = __webpack_require__(115);
var EndElementVDOM = __webpack_require__(114);

function checkAttributesStatic(attributes) {
    if (attributes) {
        for (let i=0; i<attributes.length; i++) {
            let attr = attributes[i];

            if (!attr.isStatic) {
                return false;
            }
        }
    }

    return true;
}

function checkPropertiesStatic(properties, vdomUtil) {
    if (properties) {
        var keys = Object.keys(properties);
        for (var i=0; i<keys.length; i++) {
            var propName = keys[i];
            var propValue = properties[propName];
            var isStatic = vdomUtil.isStaticValue(propValue);
            if (!isStatic) {
                return false;
            }
        }
    }

    return true;
}

module.exports = function(node, codegen, vdomUtil) {
    var body = codegen.generateCode(node.body);
    var tagName = codegen.generateCode(node.tagNameExpression);
    var attributes = codegen.generateCode(node.getAttributes());
    var properties = codegen.generateCode(node.getProperties());
    var dynamicAttributes = codegen.generateCode(node.dynamicAttributes);
    var builder = codegen.builder;

    var isAttrsStatic = checkAttributesStatic(attributes);
    var isPropsStatic = checkPropertiesStatic(properties, vdomUtil);
    var isStatic = isAttrsStatic && isPropsStatic && node.isLiteralTagName();
    var isHtmlOnly = true;

    if (body && body.length) {
        for (var i=0; i<body.length; i++) {
            let child = body[i];
            if (child.type === 'HtmlElementVDOM' || child.type === 'TextVDOM') {
                if (child.type === 'TextVDOM' && child.escape === false) {
                    isHtmlOnly = false;
                }
                if (!child.isHtmlOnly) {
                    isStatic = false;
                    isHtmlOnly = false;
                } if (!child.isStatic) {
                    isStatic = false;
                }
            } else {
                isHtmlOnly = false;
                isStatic = false;
            }
        }
    }

    var bodyOnlyIf = node.bodyOnlyIf;
    if (bodyOnlyIf) {
        isHtmlOnly = false;
    }

    var htmlElVDOM = new HtmlElementVDOM({
        tagName,
        attributes,
        properties,
        body,
        isStatic,
        isAttrsStatic,
        isHtmlOnly,
        dynamicAttributes
    });


    if (bodyOnlyIf) {
        htmlElVDOM.body = null;

        var startIf = builder.ifStatement(builder.negate(bodyOnlyIf), [
            htmlElVDOM
        ]);

        var endIf = builder.ifStatement(builder.negate(bodyOnlyIf), [
            new EndElementVDOM()
        ]);

        return [
            startIf,
            body,
            endIf
        ];
    } else if (isHtmlOnly) {
        return htmlElVDOM;
    } else {
        htmlElVDOM.body = null;
        return [htmlElVDOM].concat(body, new EndElementVDOM());
    }
};


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

function removeWhitespaceNodes(whitespaceNodes) {
    for (var i=0; i<whitespaceNodes.length; i++) {
        whitespaceNodes[i].detach();
    }
    whitespaceNodes.length = 0;
}

class If extends Node {
    constructor(def) {
        super('If');
        this.test = def.test;
        this.body = this.makeContainer(def.body);
        this.else = def.else;
    }

    generateCode(codegen) {
        if (this.else) {
            this.else.matched = true;
        } else {
            // We want to match up any else/else if statements
            // with this node so that we can generate the code
            // correctly.
            let previous = this;
            let whitespaceNodes = [];
            this.forEachNextSibling((curNode) => {
                if (curNode.type === 'Else') {
                    curNode.detach();
                    if (whitespaceNodes.length) {
                        removeWhitespaceNodes(whitespaceNodes);
                    }
                    previous.else = curNode;
                    curNode.matched = true;
                    return false; // Stop searching
                } else if (curNode.type === 'ElseIf') {
                    curNode.detach();
                    if (whitespaceNodes.length) {
                        removeWhitespaceNodes(whitespaceNodes);
                    }

                    previous.else = curNode;
                    previous = curNode;
                    curNode.matched = true;
                    return true; // Keep searching since they may be more ElseIf/Else nodes...
                } else if (curNode.type === 'Text') {
                    if (curNode.isWhitespace()) {
                        whitespaceNodes.push(curNode);
                        return true; // Just whitespace... keep searching
                    } else {
                        return false; // Stop searching
                    }
                } else {
                    return false; // Stop searching
                }
            });
        }

        this.test = codegen.generateCode(this.test);
        this.body = codegen.generateCode(this.body);
        this.else = codegen.generateCode(this.else);

        return this;
    }

    writeCode(writer) {
        var test = this.test;
        var body = this.body;

        writer.write('if (');
        writer.write(test);
        writer.write(') ');
        writer.writeBlock(body);
        if (this.else) {
            writer.write(' else ');
            writer.write(this.else);
        } else {
            writer.write('\n');
        }
    }

    appendChild(newChild) {
        this.body.appendChild(newChild);
    }

    walk(walker) {
        this.test = walker.walk(this.test);
        this.body = walker.walk(this.body);
        this.else = walker.walk(this.else);
    }
}

module.exports = If;

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var ok = __webpack_require__(1).ok;

function removeTrailingUndefineds(args) {
    var i;
    var last = args.length-1;

    for (i=last; i>=0; i--) {
        if (args[i].type !== 'Literal' || args[i].value !== undefined) {
            break;
        }
    }

    if (i !== last) {
        args = args.slice(0, i+1);
    }

    return args;
}


class InvokeMacro extends Node {
    constructor(def) {
        super('InvokeMacro');
        this.el = def.el;
        this.name = def.name;
        this.args = def.args;
        this.body = this.makeContainer(def.body);

        if (this.name != null) {
            ok(typeof this.name === 'string', 'Invalid macro name: ' + this.name);
        }
    }

    generateCode(codegen) {
        var el = this.el;
        var name = this.name;
        var args = this.args;
        var body = this.body;

        var builder = codegen.builder;

        var macroDef;

        if (el) {
            name = el.tagName;
            body = el.body;

            if (typeof name !== 'string') {
                codegen.context.addError(el, 'Element node with a dynamic tag name cannot be used to invoke a macro', 'ERR_INVOKE_MACRO');
                return;
            }

            macroDef = codegen.context.getRegisteredMacro(name);

            if (!macroDef) {
                codegen.context.addError(el, 'Element node does not correspond to a macro', 'ERR_INVOKE_MACRO');
                return;
            }

            if (el.argument) {
                args = builder.parseJavaScriptArgs(el.argument);
            } else {
                args = new Array(macroDef.params.length);
                for (let i=0; i<args.length; i++) {
                    args[i] = builder.literal(undefined);
                }

                el.forEachAttribute((attr) => {
                    var paramName = attr.name;
                    var paramIndex = macroDef.getParamIndex(paramName);
                    if (paramIndex == null) {
                        codegen.context.addError(el, 'The "' + name + '" macro does not have a parameter named "' + paramName + '"', 'ERR_INVOKE_MACRO');
                        return;
                    }

                    var value = attr.value;
                    if (value == null) {
                        value = builder.literal(true);
                    }
                    args[paramIndex] = value;
                });
            }
        } else {
            macroDef = codegen.context.getRegisteredMacro(name);
            if (!macroDef) {
                codegen.addError('Macro not found with name "' + name + '"', 'ERR_INVOKE_MACRO');
                return;
            }
        }

        if (!args) {
            args = [];
        }

        while (args.length < macroDef.params.length) {
            args.push(builder.literal(undefined));
        }

        if (body && body.length) {
            args[macroDef.getParamIndex('renderBody')] = builder.renderBodyFunction(body);
        }

        args[macroDef.getParamIndex('out')] = builder.identifier('out');

        args = removeTrailingUndefineds(args);

        return builder.functionCall(builder.identifier(macroDef.functionName), args);
    }

    walk(walker) {
        this.el = walker.walk(this.el);
        this.name = walker.walk(this.name);
        this.args = walker.walk(this.args);
        this.body = walker.walk(this.body);
    }
}

module.exports = InvokeMacro;

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var isCompoundExpression = __webpack_require__(7);

function generateCodeForOperand(node, writer) {
    var wrap = isCompoundExpression(node);

    if (wrap) {
        writer.write('(');
    }

    writer.write(node);

    if (wrap) {
        writer.write(')');
    }
}

function operandToString(node) {
    var wrap = isCompoundExpression(node);

    var result = '';

    if (wrap) {
        result += '(';
    }

    result += node;

    if (wrap) {
        result += ')';
    }

    return result;
}

class LogicalExpression extends Node {
    constructor(def) {
        super('LogicalExpression');
        this.left = def.left;
        this.operator = def.operator;
        this.right = def.right;
    }

    generateCode(codegen) {
        this.left = codegen.generateCode(this.left);
        this.right = codegen.generateCode(this.right);
        return this;
    }

    writeCode(writer) {
        var left = this.left;
        var operator = this.operator;
        var right = this.right;

        if (!left || !right) {
            throw new Error('Invalid LogicalExpression: ' + this);
        }

        generateCodeForOperand(left, writer);
        writer.write(' ');
        writer.write(operator);
        writer.write(' ');
        generateCodeForOperand(right, writer);
    }

    isCompoundExpression() {
        return true;
    }

    toJSON() {
        return {
            type: 'LogicalExpression',
            left: this.left,
            operator: this.operator,
            right: this.right
        };
    }

    walk(walker) {
        this.left = walker.walk(this.left);
        this.right = walker.walk(this.right);
    }

    toString() {
        var left = this.left;
        var operator = this.operator;
        var right = this.right;

        if (!left || !right) {
            throw new Error('Invalid LogicalExpression: ' + this);
        }

        return operandToString(left) + ' ' + operator + ' ' + operandToString(right);
    }
}

module.exports = LogicalExpression;

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var ok = __webpack_require__(1).ok;

class Macro extends Node {
    constructor(def) {
        super('Macro');
        this.name = def.name;
        this.params = def.params;
        this.body = this.makeContainer(def.body);

        if (this.params == null) {
            this.params = [];
        } else {
            ok(Array.isArray(this.params), '"params" should be an array');
        }
    }

    generateCode(codegen) {
        var name = this.name;
        var params = this.params || [];
        var builder = codegen.builder;
        var macroDef = codegen.context.registerMacro(name, params);
        var functionName = macroDef.functionName;

        // Walk the body after registering the macro
        var body = codegen.generateCode(this.body);

        return builder.functionDeclaration(functionName, macroDef.params, body);
    }

    walk(walker) {
        this.body = walker.walk(this.body);
    }
}

module.exports = Macro;

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var isCompoundExpression = __webpack_require__(7);
var ok = __webpack_require__(1).ok;

class MemberExpression extends Node {
    constructor(def) {
        super('MemberExpression');
        this.object = def.object;
        this.property = def.property;
        this.computed = def.computed;

        ok(this.object, '"object" is required');
        ok(this.property, '"property" is required');
    }

    generateCode(codegen) {
        this.object = codegen.generateCode(this.object);
        this.property = codegen.generateCode(this.property);
        return this;
    }

    writeCode(writer) {
        var object = this.object;
        var property = this.property;
        var computed = this.computed;

        var wrapWithParens = isCompoundExpression(object);

        if (wrapWithParens) {
            writer.write('(');
        }

        writer.write(object);

        if (wrapWithParens) {
            writer.write(')');
        }

        if (computed) {
            writer.write('[');
            writer.write(property);
            writer.write(']');
        } else {
            writer.write('.');
            writer.write(property);
        }
    }

    toJSON() {
        return {
            type: 'MemberExpression',
            object: this.object,
            property: this.property,
            computed: this.computed
        };
    }

    walk(walker) {
        this.object = walker.walk(this.object);
        this.property = walker.walk(this.property);
    }

    toString() {
        var object = this.object;
        var property = this.property;
        var computed = this.computed;

        var result = object.toString();

        if (computed) {
            result += '[' + property + ']';
        } else {
            result += '.' + property;
        }

        return result;
    }
}

module.exports = MemberExpression;

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var isCompoundExpression = __webpack_require__(7);

class NewExpression extends Node {
    constructor(def) {
        super('NewExpression');
        this.callee = def.callee;
        this.args = def.args;
    }

    generateCode(codegen) {
        this.callee = codegen.generateCode(this.callee);
        this.args = codegen.generateCode(this.args);
        return this;
    }

    writeCode(writer) {
        var callee = this.callee;
        var args = this.args;

        writer.write('new ');

        var wrap = isCompoundExpression(callee);

        if (wrap) {
            writer.write('(');
        }

        writer.write(callee);

        if (wrap) {
            writer.write(')');
        }

        writer.write('(');

        if (args && args.length) {
            for (let i=0, argsLen = args.length; i<argsLen; i++) {
                if (i !== 0) {
                    writer.write(', ');
                }

                let arg = args[i];
                if (!arg) {
                    throw new Error('Arg ' + i + ' is not valid for new expression: ' + JSON.stringify(this.toJSON()));
                }
                writer.write(arg);
            }
        }

        writer.write(')');
    }

    isCompoundExpression() {
        return true;
    }

    toJSON() {
        return {
            type: 'NewExpression',
            callee: this.callee,
            args: this.args
        };
    }

    walk(walker) {
        this.callee = walker.walk(this.callee);
        this.args = walker.walk(this.args);
    }

    toString() {
        var callee = this.callee;
        var args = this.args;

        let result = 'new ';

        var wrap = isCompoundExpression(callee);

        if (wrap) {
            result += '(';
        }

        result += callee;

        if (wrap) {
            result += ')';
        }


        result += '(';

        if (args && args.length) {
            for (let i=0, argsLen = args.length; i<argsLen; i++) {
                if (i !== 0) {
                    result += ', ';
                }

                let arg = args[i];
                result += arg;
            }
        }

        result += ')';

        return result;
    }
}

module.exports = NewExpression;

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class ObjectExpression extends Node {
    constructor(def) {
        super('ObjectExpression');
        this.properties = def.properties;
    }

    generateCode(codegen) {
        this.properties = codegen.generateCode(this.properties);

        return this;
    }

    writeCode(writer) {
        var properties = this.properties;

        if (!properties || !properties.length) {
            writer.write('{}');
            return;
        }

        writer.incIndent();
        writer.write('{\n');
        writer.incIndent();

        properties.forEach((prop, i) => {
            writer.writeLineIndent();
            writer.write(prop);

            if (i < properties.length - 1) {
                writer.write(',\n');
            } else {
                writer.write('\n');
            }
        });

        writer.decIndent();
        writer.writeLineIndent();
        writer.write('}');
        writer.decIndent();
    }

    toJSON() {
        return {
            type: 'ObjectExpression',
            properties: this.properties
        };
    }

    walk(walker) {
        this.properties = walker.walk(this.properties);
    }

    toString(codegen) {
        var properties = this.properties;

        if (!properties || !properties.length) {
            return '{}';
        }

        let result = '{';

        properties.forEach((prop, i) => {
            if (i !== 0) {
                result += ', ';
            }
            result += prop;
        });

        return result + '}';    }
}

module.exports = ObjectExpression;

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Node = __webpack_require__(0);

class Program extends Node {
    constructor(def) {
        super('Program');
        this.body = def.body;
    }

    generateCode(codegen) {
        this.body = codegen.generateCode(this.body);
        return this;
    }

    writeCode(writer) {
        writer.writeStatements(this.body);
    }

    walk(walker) {
        this.body = walker.walk(this.body);
    }
}

module.exports = Program;

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const isValidJavaScriptIdentifier = __webpack_require__(26);
const Node = __webpack_require__(0);

class Property extends Node {
    constructor(def) {
        super('Property');
        this.key = def.key;
        this.value = def.value;
    }

    generateCode(codegen) {
        var key = this.key;
        var value = this.value;

        if (key.type === 'Literal') {
            var propName = key.value;
            if (isValidJavaScriptIdentifier(propName)) {
                key = codegen.builder.identifier(propName);
            }
        }

        this.key = codegen.generateCode(key);
        this.value = codegen.generateCode(value);

        return this;
    }

    writeCode(writer) {
        var key = this.key;
        var value = this.value;
        writer.write(key);
        writer.write(': ');
        writer.write(value);
    }

    toJSON() {
        return {
            type: 'Property',
            key: this.key,
            value: this.value
        };
    }

    walk(walker) {
        this.key = walker.walk(this.key);
        this.value = walker.walk(this.value);
    }

    toString() {
        var key = this.key;
        var value = this.value;

        if (key.type === 'Literal') {
            var propName = key.value;
            if (isValidJavaScriptIdentifier(propName)) {
                key = propName;
            }
        }

        return key + ': ' + value;
    }
}

module.exports = Property;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class Return extends Node {
    constructor(def) {
        super('Return');
        this.argument = def.argument;
    }

    generateCode(codegen) {
        if (!codegen.inFunction) {
            throw new Error('"return" not allowed outside a function body');
        }

        this.argument = codegen.generateCode(this.argument);
        return this;
    }

    writeCode(writer) {
        var argument = this.argument;

        if (argument) {
            writer.write('return ');
            writer.write(argument);
        } else {
            writer.write('return');
        }
    }

    walk(walker) {
        this.argument = walker.walk(this.argument);
    }
}

module.exports = Return;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var adjustIndent = __webpack_require__(49);

class Scriptlet extends Node {
    constructor(def) {
        super('Scriptlet');
        this.code = def.code;
        this.tag = def.tag;
        this.block = def.block;
    }

    generateCode(codegen) {
        return this;
    }

    writeCode(writer) {
        var code = this.code;

        if (!code) {
            return;
        }

        code = adjustIndent(code, writer.currentIndent);

        writer.write(code);
        writer.write('\n');
    }
}

module.exports = Scriptlet;


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class SelfInvokingFunction extends Node {
    constructor(def) {
        super('SelfInvokingFunction');
        this.params = def.params;
        this.args = def.args;
        this.body = this.makeContainer(def.body);
    }

    generateCode(codegen) {
        var params = this.params || [];
        var args = this.args || [];
        var oldInFunction = codegen.inFunction;
        codegen.inFunction = true;
        var body = codegen.generateCode(this.body);
        codegen.inFunction = oldInFunction;

        var functionDeclaration = codegen.builder.functionDeclaration(null, params, body);
        var functionCall = codegen.builder.functionCall(functionDeclaration, args);

        return functionCall;
    }

    walk(walker) {
        this.params = walker.walk(this.params);
        this.args = walker.walk(this.args);
        this.body = walker.walk(this.body);
    }
}

module.exports = SelfInvokingFunction;

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class SequenceExpression extends Node {
    constructor(def) {
        super('SequenceExpression');
        this.expressions = def.expressions;
    }

    generateCode(codegen) {
        this.expressions = codegen.generateCode(this.expressions);
        return this;
    }

    writeCode(writer) {

        for (var i=0; i<this.expressions.length; i++) {
            var expression = this.expressions[i];

            if (i !== 0) {
                writer.write(', ');
            }

            writer.write(expression);
        }
    }

    isCompoundExpression() {
        return true;
    }

    toJSON() {
        return {
            type: 'SequenceExpression',
            expressions: this.expressions
        };
    }

    walk(walker) {
        this.expressions = walker.walk(this.expressions);
    }

    toString() {
        var code = '';

        for (var i=0; i<this.expressions.length; i++) {
            var expression = this.expressions[i];

            if (i !== 0) {
                code += ', ';
            }

            code += expression;
        }

        return code;
    }
}

module.exports = SequenceExpression;

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Node = __webpack_require__(0);

function createVarsArray(vars) {
    return Object.keys(vars).map(function(varName) {
        var varInit = vars[varName];
        return {
            id: varName,
            init: varInit
        };
    });
}

function _buildVersionComment(builder, context) {
    const version = context.compilerVersion;
    const compilerType = context.compilerType;
    return builder.comment(`Compiled using ${compilerType}@${version} - DO NOT EDIT`);
}

class TemplateRoot extends Node {
    constructor(def) {
        super('TemplateRoot');
        this.body = this.makeContainer(def.body);
        this.extraRenderParams = null;
        this.generateAssignRenderCode = null;
    }

    addRenderFunctionParam(id) {
        if (!this.extraRenderParams) {
            this.extraRenderParams = [];
        }

        this.extraRenderParams.push(id);
    }

    generateCode(codegen) {
        var context = codegen.context;

        this.body = codegen.generateCode(this.body);

        context.optimize(this);

        var body = this.body;

        var builder = codegen.builder;

        let renderStatements = [
            builder.var('data', builder.identifier('input'))
        ];
        var vars = createVarsArray(context.getVars());
        if (vars.length) {
            renderStatements.push(builder.vars(vars));
        }

        renderStatements = renderStatements.concat(body);

        if (context.inline) {
            var createInlineMarkoTemplateVar = context.helper('createInlineTemplate');

            return builder.functionCall(
                createInlineMarkoTemplateVar,
                [
                    builder.identifier('__filename'),
                    builder.functionDeclaration(
                        null,
                        [
                            builder.identifier('input'),
                            builder.identifierOut()
                        ],
                        renderStatements)
                ]);
        } else {
            var isBrowser = context.options.browser;
            var createArgs = isBrowser ?
                [] :
                [ builder.identifier('__filename') ];

            let templateDeclaration = builder.variableDeclarator('marko_template',
                builder.assignment(
                    builder.moduleExports(),
                    builder.functionCall(
                        builder.memberExpression(
                            builder.require(
                                builder.literal(context.getModuleRuntimeTarget())
                            ),
                            builder.identifier('t')
                        ),
                        createArgs
                    )
                )
            );

            let body = [];

            if (context.writeVersionComment) {
                body.push(_buildVersionComment(builder, context));
            }

            body.push(builder.literal('use strict'));

            let staticNodes = context.getStaticNodes([templateDeclaration]);
            if (staticNodes.length) {
                body = body.concat(staticNodes);
            }

            var renderParams = [builder.identifier('input'), builder.identifierOut()];
            if (this.extraRenderParams) {
                renderParams = renderParams.concat(this.extraRenderParams);
            }

            let renderFunction = builder.functionDeclaration(
                'render',
                renderParams,
                renderStatements);

            body = body.concat([
                renderFunction,
            ]);

            var assignRenderCode;

            let templateVar = builder.identifier('marko_template');
            let renderFunctionVar = builder.identifier('render');
            let templateRendererMember = builder.memberExpression(
                builder.identifier('marko_template'),
                builder.identifier('_'));

            if (this.generateAssignRenderCode) {
                var eventArgs = {
                    context,
                    templateVar,
                    templateRendererMember,
                    renderFunctionVar
                };

                assignRenderCode = this.generateAssignRenderCode(eventArgs);
            } else {

                assignRenderCode = builder.assignment(
                    templateRendererMember,
                    renderFunctionVar);
            }

            if (assignRenderCode) {
                body = body.concat(assignRenderCode);
            }

            if (context.useMeta && context.meta) {
                body.push(builder.assignment(
                    builder.memberExpression(builder.identifier('marko_template'), builder.identifier('meta')),
                    builder.literal(context.meta)));
            }

            return builder.program(body);
        }
    }

    toJSON(prettyPrinter) {
        return {
            type: this.type,
            body: this.body
        };
    }

    walk(walker) {
        this.body = walker.walk(this.body);
    }
}

module.exports = TemplateRoot;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var escapeXml = __webpack_require__(17).x;
var Literal = __webpack_require__(3);

module.exports = function(node, codegen) {
    var context = codegen.context;
    var argument = codegen.generateCode(node.argument);
    var escape = node.escape !== false;

    var htmlArray = [];

    function append(argument) {
        if (argument instanceof Literal) {
            if (!argument.value) {
                return;
            }

            if (context.isFlagSet('SCRIPT_BODY') || context.isFlagSet('STYLE_BODY')) {
                escape = false;
            }

            if (escape === true) {
                argument.value = escapeXml(argument.value.toString());
            }

            htmlArray.push(argument);
        } else {
            let builder = codegen.builder;

            if (escape) {
                let escapeIdentifier = context.helper('escapeXml');

                if (context.isFlagSet('SCRIPT_BODY')) {
                    escapeIdentifier = context.helper('escapeScript');
                }

                if (context.isFlagSet('STYLE_BODY')) {
                    escapeIdentifier = context.helper('escapeStyle');
                }

                // TODO Only escape the parts that need to be escaped if it is a compound expression with static
                //      text parts
                argument = builder.functionCall(
                    escapeIdentifier,
                    [argument]);
            } else {
                argument = builder.functionCall(context.helper('str'), [ argument ]);
            }
            htmlArray.push(argument);
        }
    }

    if (Array.isArray(argument)) {
        argument.forEach(append);
    } else {
        append(argument);
    }

    if (htmlArray.length) {
        return codegen.builder.html(htmlArray);
    } else {
        return null;
    }
};

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Node = __webpack_require__(0);
const Literal = __webpack_require__(3);
const vdomUtil = __webpack_require__(12);

class TextVDOM extends Node {
    constructor(def) {
        super('TextVDOM');
        this.arguments = [def.argument];
        this.isStatic = def.isStatic;
        this.escape = def.escape !== false;
        this.isHtmlOnly = true;
        this.isChild = false;
        this.createTextId = undefined;
        this.strFuncId = undefined;
    }

    generateCode(codegen) {
        var context = codegen.context;

        vdomUtil.registerOptimizer(context);

        return this;
    }

    _append(appendArgument) {
        let args = this.arguments;
        let len = args.length;
        let last = args[len-1];

        if (last instanceof Literal && appendArgument instanceof Literal) {
            last.value += appendArgument.value;
        } else {
            args.push(appendArgument);
        }
    }

    append(textVDOMToAppend) {
        if (textVDOMToAppend.escape !== this.escape) {
            return false;
        }

        if (!textVDOMToAppend.isStatic) {
            this.isStatic = false;
        }

        if (textVDOMToAppend.strFuncId) {
            this.strFuncId = textVDOMToAppend.strFuncId;
        }

        textVDOMToAppend.arguments.forEach(this._append, this);

        return true;
    }

    writeCode(writer) {
        let builder = writer.builder;
        let args = this.arguments;
        let escape = this.escape;

        var funcName = escape ? 't' : 'h';

        function writeTextArgs() {
            writer.write('(');

            for (let i=0, len=args.length; i<len; i++) {
                let arg = args[i];

                if (i !== 0) {
                    writer.write(' +\n');
                    writer.writeLineIndent();
                    writer.writeIndent();
                }

                writer.write(arg);
            }

            writer.write(')');
        }

        if (this.isChild) {
            writer.write('.');
            writer.write(builder.identifier(funcName));
        } else if (this.isStatic && this.createTextId) {
            writer.write(this.createTextId);
        } else {
            writer.write('out.');
            writer.write(builder.identifier(funcName));
        }

        writeTextArgs();
    }
}

module.exports = TextVDOM;

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var TextVDOM = __webpack_require__(132);
var Literal = __webpack_require__(3);
var he = __webpack_require__(199); // Used for dealing with HTML entities

module.exports = function(node, codegen, vdomUtil) {
    var argument = codegen.generateCode(node.argument);
    var escape = node.escape !== false;
    var isStatic = null;

    if (codegen.context.isFlagSet('SCRIPT_BODY')) {
        escape = true;
    }

    if (argument instanceof Literal) {
        var literalValue = argument.value;
        if (literalValue == null || literalValue === '') {
            // Don't add empty text nodes to the final tree
            return null;
        }

        if (escape === false) {
            escape = true;

            if (typeof literalValue === 'string') {
                if (literalValue.indexOf('<') !== -1) {
                    escape = false;
                } else if (literalValue.indexOf('&') !== -1) {
                    argument = codegen.builder.literal(he.decode(literalValue));
                }
            }
        }

    }

    isStatic = isStatic == null ? vdomUtil.isStaticValue(argument) : isStatic;
    return new TextVDOM({ argument, isStatic, escape });
};

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class ThisExpression extends Node {
    constructor(def) {
        super('ThisExpression');
    }

    generateCode(codegen) {
        return this;
    }

    writeCode(writer) {
        writer.write('this');
    }

    toString() {
        return 'this';
    }
}

module.exports = ThisExpression;

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var isCompoundExpression = __webpack_require__(7);

class UnaryExpression extends Node {
    constructor(def) {
        super('UnaryExpression');
        this.argument = def.argument;
        this.operator = def.operator;
        this.prefix = def.prefix === true;
    }

    generateCode(codegen) {
        this.argument = codegen.generateCode(this.argument);
        return this;
    }

    writeCode(writer) {
        var argument = this.argument;
        var operator = this.operator;
        var prefix = this.prefix;

        if (prefix) {
            writer.write(operator);

            if (operator === 'typeof' || operator === 'delete') {
                writer.write(' ');
            }
        }

        var wrap = isCompoundExpression(argument);

        if (wrap) {
            writer.write('(');
        }

        writer.write(argument);

        if (wrap) {
            writer.write(')');
        }

        if (!prefix) {
            writer.write(operator);
        }
    }

    isCompoundExpression() {
        return true;
    }

    toJSON() {
        return {
            type: 'UnaryExpression',
            argument: this.argument,
            operator: this.operator,
            prefix: this.prefix
        };
    }

    walk(walker) {
        this.argument = walker.walk(this.argument);
    }

    toString() {
        var argument = this.argument;
        var operator = this.operator;
        var prefix = this.prefix;

        let result = '';

        if (prefix) {
            result += operator;

            if (operator === 'typeof' || operator === 'delete') {
                result += ' ';
            }
        }

        var wrap = isCompoundExpression(argument);

        if (wrap) {
            result += '(';
        }

        result += argument;

        if (wrap) {
            result += ')';
        }

        if (!prefix) {
            result += operator;
        }

        return result;
    }
}

module.exports = UnaryExpression;

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var isCompoundExpression = __webpack_require__(7);

class UpdateExpression extends Node {
    constructor(def) {
        super('UpdateExpression');
        this.argument = def.argument;
        this.operator = def.operator;
        this.prefix = def.prefix === true;
    }

    generateCode(codegen) {
        this.argument = codegen.generateCode(this.argument);
        return this;
    }

    writeCode(writer) {
        var argument = this.argument;
        var operator = this.operator;
        var prefix = this.prefix;

        if (prefix) {
            writer.write(operator);
        }

        var wrap = isCompoundExpression(argument);

        if (wrap) {
            writer.write('(');
        }

        writer.write(argument);

        if (wrap) {
            writer.write(')');
        }

        if (!prefix) {
            writer.write(operator);
        }
    }

    isCompoundExpression() {
        return true;
    }

    toJSON() {
        return {
            type: 'UpdateExpression',
            argument: this.argument,
            operator: this.operator,
            prefix: this.prefix
        };
    }

    walk(walker) {
        this.argument = walker.walk(this.argument);
    }

    toString() {
        var argument = this.argument;
        var operator = this.operator;
        var prefix = this.prefix;

        let result = '';

        if (prefix) {
            result += operator;
        }

        var wrap = isCompoundExpression(argument);

        if (wrap) {
            result += '(';
        }

        result += argument;

        if (wrap) {
            result += ')';
        }

        if (!prefix) {
            result += operator;
        }

        return result;
    }
}

module.exports = UpdateExpression;

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);
var Identifier = __webpack_require__(10);
var isValidJavaScriptVarName = __webpack_require__(27);

class VariableDeclarator extends Node {
    constructor(def) {
        super('VariableDeclarator');
        this.id = def.id;
        this.init = def.init;

        let name = this.id.name;
        if (!name) {
            throw new Error('"name" is required');
        }

        if (!isValidJavaScriptVarName(name)) {
            var error = new Error('Invalid JavaScript variable name: ' + name);
            error.code = 'INVALID_VAR_NAME';
            throw error;
        }
    }

    generateCode(codegen) {
        this.id = codegen.generateCode(this.id);
        this.init = codegen.generateCode(this.init);
        return this;
    }

    writeCode(writer) {
        var id = this.id;
        var init = this.init;

        if (!(id instanceof Identifier) && typeof id !== 'string') {
            throw new Error('Invalid variable name: ' + id);
        }

        writer.write(id);

        if (init != null) {
            writer.write(' = ');
            writer.write(init);
        }
    }

    walk(walker) {
        this.id = walker.walk(this.id);
        this.init = walker.walk(this.init);
    }
}

module.exports = VariableDeclarator;

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class Vars extends Node {
    constructor(def) {
        super('Vars');
        this.kind = def.kind || 'var';
        this.declarations = def.declarations;
        this.body = this.makeContainer(def.body);
    }

    generateCode(codegen) {
        var declarations = this.declarations;

        if (!declarations || !declarations.length) {
            return null;
        }

        this.declarations = codegen.generateCode(this.declarations);

        if (this.body && this.body.length) {
            var scopedBody = [this].concat(this.body);
            this.body = null;
            return codegen.builder.selfInvokingFunction(scopedBody);
        }

        return this;
    }

    writeCode(writer) {
        var declarations = this.declarations;
        var kind = this.kind;
        var isStatement = this.statement;


        if (!declarations || !declarations.length) {
            return;
        }

        writer.incIndent(4);

        for (let i=0; i<declarations.length; i++) {
            var declarator = declarations[i];

            if (i === 0) {
                writer.write(kind + ' ');
            } else {
                writer.writeLineIndent();
            }

            writer.write(declarator);

            if (i < declarations.length - 1) {
                writer.write(',\n');
            } else {
                if (isStatement) {
                    writer.write(';\n');
                }
            }
        }

        writer.decIndent(4);
    }

    walk(walker) {
        this.argument = walker.walk(this.argument);
    }

    /**
     * "noOutput" should be true if the Node.js does not result in any HTML or Text output
     */
    get noOutput() {
        return !(this.body && this.body.length);
    }
}

module.exports = Vars;

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Node = __webpack_require__(0);

class WhileStatement extends Node {
    constructor(def) {
        super('WhileStatement');
        this.test = def.test;
        this.body = this.makeContainer(def.body);
    }

    generateCode(codegen) {
        this.test = codegen.generateCode(this.test);
        this.body = codegen.generateCode(this.body);
        return this;
    }

    writeCode(writer) {
        var test = this.test;
        var body = this.body;

        writer.write('while (');
        writer.write(test);
        writer.write(') ');

        writer.write(body);

        writer.write('\n');
    }

    walk(walker) {
        this.test = walker.walk(this.test);
        this.body = walker.walk(this.body);
    }
}

module.exports = WhileStatement;

/***/ }),
/* 140 */
/***/ (function(module, exports) {

var NODE_ENV = process.env.NODE_ENV;
var config;

/* globals window */
var g = typeof window === 'undefined' ? global : window;

if (g.__MARKO_CONFIG) {
    config = g.__MARKO_CONFIG;
} else {
    config = g.__MARKO_CONFIG = {
        /**
         * If true, then the compiler will check the disk to see if a previously compiled
         * template is the same age or newer than the source template. If so, the previously
         * compiled template will be loaded. Otherwise, the template will be recompiled
         * and saved to disk.
         *
         * If false, the template will always be recompiled. If `writeToDisk` is false
         * then this option will be ignored.
         */
        checkUpToDate: process.env.MARKO_CLEAN ? false : true,
        /**
         * If true (the default) then compiled templates will be written to disk. If false,
         * compiled templates will not be written to disk (i.e., no `.marko.js` file will
         * be generated)
         */
        writeToDisk: true,

        /**
         * If true, then the compiled template on disk will assumed to be up-to-date if it exists.
         */
        assumeUpToDate: process.env.MARKO_CLEAN != null || process.env.hasOwnProperty('MARKO_HOT_RELOAD') ? false : ( NODE_ENV == null ? false : (NODE_ENV !== 'development' && NODE_ENV !== 'dev')),

        /**
         * If true, whitespace will be preserved in templates. Defaults to false.
         * @type {Boolean}
         */
        preserveWhitespace: false,

        // The default output mode for compiled templates
        output: 'html',

        /**
         * Whether the version should be written to the template as a comment e.g.
         * // Compiled using marko@4.0.0 - DO NOT EDIT
         */
        writeVersionComment: true
    };
}

module.exports = config;


/***/ }),
/* 141 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 141;

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Attribute {
    constructor(name) {
        this.name = name;
        this.type = null;
        this.required = false;
        this.type = null;
        this.allowExpressions = true;
        this.setFlag = null;
        this.pattern = null;
    }
}

module.exports = Attribute;

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class ImportedVariable {
    constructor() {
        this.targetProperty = null;
        this.expression = null;
    }
}

module.exports = ImportedVariable;

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class NestedVariable {
    constructor() {
        this.name = null;
    }
}

module.exports = NestedVariable;

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Property {
    constructor() {
        this.name = null;
        this.type = 'string';
        this.value = undefined;
    }
}

module.exports = Property;

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var forEachEntry = __webpack_require__(19);
var ok = __webpack_require__(1).ok;
var CustomTag;
var path = __webpack_require__(2);
var markoModules = __webpack_require__(11);

function createCustomTag(el, tagDef) {
    CustomTag = CustomTag || __webpack_require__(43);
    return new CustomTag(el, tagDef);
}

function createCustomTagNodeFactory(tagDef) {
    return function nodeFactory(el) {
        return createCustomTag(el, tagDef);
    };
}

class Tag{
    constructor(filePath) {
        this.filePath = filePath;
        if (filePath) {
            this.dir = path.dirname(filePath);
        }

        this.attributes = {};
        this.transformers = {};
        this.patternAttributes = [];

        // NOTE: We don't set this properties since
        //       it breaks merging of tags when the same
        //       tag is declared at multiple levels

        // this.taglibId = null;
        // this.taglibPath = null;
        // this.name = undefined;
        // this.renderer = null;
        // this.codeGeneratorModulePath = null;
        // this.nodeFactoryPath = null;
        // this.template = null;
        // this.nestedVariables = null;
        // this.importedVariables = null;
        // this.bodyFunction = null;
        // this.nestedTags = null;
        // this.isRepeated = null;
        // this.isNestedTag = false;
        // this.parentTagName = null;
        // this.openTagOnly = null;
        // this.body = null;
        // this.type = null; // Only applicable for nested tags
        // this._nodeFactory = undefined;
    }

    forEachVariable(callback, thisObj) {
        if (!this.nestedVariables) {
            return;
        }

        this.nestedVariables.vars.forEach(callback, thisObj);
    }

    forEachImportedVariable(callback, thisObj) {
        if (!this.importedVariables) {
            return;
        }

        forEachEntry(this.importedVariables, function (key, importedVariable) {
            callback.call(thisObj, importedVariable);
        });
    }

    forEachTransformer(callback, thisObj) {
        forEachEntry(this.transformers, function (key, transformer) {
            callback.call(thisObj, transformer);
        });
    }
    hasTransformers() {
        /*jshint unused:false */
        for (var k in this.transformers) {
            if (this.transformers.hasOwnProperty(k)) {
                return true;
            }

        }
        return false;
    }
    addAttribute(attr) {
        attr.filePath = this.filePath;

        if (attr.pattern) {
            this.patternAttributes.push(attr);
        } else {
            if (attr.name === '*') {
                attr.dynamicAttribute = true;

                if (attr.targetProperty === null || attr.targetProperty === '') {
                    attr.targetProperty = null;

                }
                else if (!attr.targetProperty) {
                    attr.targetProperty = '*';
                }
            }

            this.attributes[attr.name] = attr;
        }
    }
    toString() {
        return '[Tag: <' + this.name + '@' + this.taglibId + '>]';
    }
    forEachAttribute(callback, thisObj) {
        for (var attrName in this.attributes) {
            if (this.attributes.hasOwnProperty(attrName)) {
                callback.call(thisObj, this.attributes[attrName]);
            }
        }
    }
    getAttribute(attrName) {
        var attributes = this.attributes;

        // try by exact match first
        var attribute = attributes[attrName] || attributes['*'];

        if (attribute === undefined && this.patternAttributes) {
            // try searching by pattern
            for (var i = 0, len = this.patternAttributes.length; i < len; i++) {
                var patternAttribute = this.patternAttributes[i];
                if (patternAttribute.pattern.test(attrName)) {
                    attribute = patternAttribute;
                    break;
                }
            }
        }

        return attribute;
    }

    hasAttribute(attrName) {
        return this.attributes.hasOwnProperty(attrName);
    }

    addNestedVariable(nestedVariable) {
        if (!this.nestedVariables) {
            this.nestedVariables = {
                __noMerge: true,
                vars: []
            };
        }

        this.nestedVariables.vars.push(nestedVariable);
    }
    addImportedVariable(importedVariable) {
        if (!this.importedVariables) {
            this.importedVariables = {};
        }
        var key = importedVariable.targetProperty;
        this.importedVariables[key] = importedVariable;
    }
    addTransformer(transformer) {
        var key = transformer.path;
        transformer.taglibId = this.taglibId;
        this.transformers[key] = transformer;
    }
    setBodyFunction(name, params) {
        this.bodyFunction = {
            __noMerge: true,
            name: name,
            params: params
        };
    }
    setBodyProperty(propertyName) {
        this.bodyProperty = propertyName;
    }
    addNestedTag(nestedTag) {
        ok(nestedTag.name, '"nestedTag.name" is required');

        if (!this.nestedTags) {
            this.nestedTags = {};
        }

        nestedTag.isNestedTag = true;

        if (!nestedTag.targetProperty) {
            nestedTag.targetProperty = nestedTag.name;
        }

        this.nestedTags[nestedTag.name] = nestedTag;
    }
    forEachNestedTag(callback, thisObj) {
        if (!this.nestedTags) {
            return;
        }

        forEachEntry(this.nestedTags, function (key, nestedTag) {
            callback.call(thisObj, nestedTag);
        });
    }
    hasNestedTags() {
        return this.nestedTags != null;
    }
    getNodeFactory() {
        var nodeFactory = this._nodeFactory;
        if (nodeFactory !== undefined) {
            return nodeFactory;
        }

        let codeGeneratorModulePath = this.codeGeneratorModulePath;

        if (this.codeGeneratorModulePath) {
            var loadedCodeGenerator = markoModules.require(this.codeGeneratorModulePath);
            nodeFactory = function(elNode) {
                elNode.setType(codeGeneratorModulePath);
                elNode.setCodeGenerator(loadedCodeGenerator);
                return elNode;
            };
        } else if (this.nodeFactoryPath) {
            nodeFactory = markoModules.require(this.nodeFactoryPath);
            if (typeof nodeFactory !== 'function') {
                throw new Error('Invalid node factory exported by module at path "' + this.nodeFactoryPath + '"');
            }
        } else if (this.renderer || this.template || this.isNestedTag) {
            nodeFactory = createCustomTagNodeFactory(this);
        } else {
            return null;
        }

        return (this._nodeFactory = nodeFactory);
    }

    toJSON() {
        return this;
    }

    setTaglib(taglib) {
        this.taglibId = taglib ? taglib.id : null;
        this.taglibPath = taglib ? taglib.path : null;
    }
}

module.exports = Tag;


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var forEachEntry = __webpack_require__(19);
var ok = __webpack_require__(1).ok;
var path = __webpack_require__(2);
var loaders = __webpack_require__(6);

function handleImport(taglib, importedTaglib) {
    var importsLookup = taglib.importsLookup || (taglib.importsLookup = {});
    if (importsLookup.hasOwnProperty(importedTaglib.path)) {
        return;
    }

    importsLookup[importedTaglib.path] = importedTaglib;

    if (!taglib.imports) {
        taglib.imports = [];
    }

    taglib.imports.push(importedTaglib);

    if (importedTaglib.imports) {
        importedTaglib.imports.forEach(function(nestedImportedTaglib) {
            handleImport(taglib, nestedImportedTaglib);
        });
    }
}

class Taglib {
    constructor(filePath) {
        ok(filePath, '"filePath" expected');
        this.filePath = this.path /* deprecated */ = this.id = filePath;
        this.dirname = path.dirname(this.filePath);
        this.tags = {};
        this.textTransformers = [];
        this.transformers = [];
        this.attributes = {};
        this.patternAttributes = [];
        this.inputFilesLookup = {};
        this.imports = null;
        this.importsLookup = null;
    }

    addAttribute(attribute) {
        ok(attribute.key, '"key" is required for global attributes');

        attribute.filePath = this.filePath;

        if (!attribute.pattern && !attribute.name) {
            throw new Error('Invalid attribute: ' + __webpack_require__(36).inspect(attribute));
        }

        this.attributes[attribute.key] = attribute;
    }
    getAttribute(name) {
        var attribute = this.attributes[name];
        if (!attribute) {
            for (var i = 0, len = this.patternAttributes.length; i < len; i++) {
                var patternAttribute = this.patternAttributes[i];
                if (patternAttribute.pattern.test(name)) {
                    attribute = patternAttribute;
                }
            }
        }
        return attribute;
    }
    addTag(tag) {
        ok(arguments.length === 1, 'Invalid args');
        if (!tag.name) {
            throw new Error('"tag.name" is required: ' + JSON.stringify(tag));
        }
        this.tags[tag.name] = tag;
        tag.taglibId = this.id || this.path;
    }
    addTextTransformer(transformer) {
        this.textTransformers.push(transformer);
    }
    addTransformer(transformer) {
        this.transformers.push(transformer);
    }
    forEachTag(callback, thisObj) {
        forEachEntry(this.tags, function (key, tag) {
            callback.call(thisObj, tag);
        }, this);
    }

    addImport(path) {
        var importedTaglib = loaders.loadTaglibFromFile(path);
        handleImport(this, importedTaglib);
    }

    toJSON() {
        return {
            path: this.path,
            tags: this.tags,
            textTransformers: this.textTransformers,
            attributes: this.attributes,
            patternAttributes: this.patternAttributes,
            imports: this.imports
        };
    }
}

module.exports = Taglib;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var nextTransformerId = 0;
var markoModules = __webpack_require__(11);

class Transformer {
    constructor() {
        this.id = nextTransformerId++;
        this.name = null;
        this.tag = null;
        this.path = null;
        this.priority = null;
        this._func = null;
        this.properties = {};
    }

    getFunc() {
        if (!this.path) {
            throw new Error('Transformer path not defined for tag transformer (tag=' + this.tag + ')');
        }

        if (!this._func) {
            var transformer = markoModules.require(this.path);

            if (typeof transformer === 'function') {
                if (transformer.prototype.process) {
                    var Clazz = transformer;
                    var instance = new Clazz();
                    instance.id = this.id;
                    this._func = instance.process.bind(instance);
                } else {
                    this._func = transformer;
                }
            } else {
                this._func = transformer.process || transformer.transform;
            }
        }
        return this._func;
    }
    toString() {
        return '[Taglib.Transformer: ' + this.path + ']';
    }
}

module.exports = Transformer;

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assert = __webpack_require__(1);
var raptorRegexp = __webpack_require__(204);
var propertyHandlers = __webpack_require__(20);
var types = __webpack_require__(4);
var createError = __webpack_require__(13);

class AttrLoader {
    constructor(attr, dependencyChain) {
        assert.ok(attr, '"attr" is required');
        assert.ok(dependencyChain, '"dependencyChain" is required');

        this.attr = attr;
        this.dependencyChain = dependencyChain;
    }

    load(attrProps) {
        assert.ok(arguments.length === 1);

        if (attrProps == null) {
            attrProps = {};
        } else if (typeof attrProps === 'string') {
            attrProps = {
                type: attrProps
            };
        } else {
            assert.ok(typeof attrProps === 'object', 'Invalid "attrProps"');
        }

        propertyHandlers(attrProps, this, this.dependencyChain.toString());
    }

    /**
     * The attribute type. One of the following:
     * - string (the default)
     * - expression (a JavaScript expression)
     * - number
     * - integer
     * - int
     * - boolean
     * - float
     * - double
     * - object
     * - array
     *
     */
    type(value) {
        var attr = this.attr;
        if (value.charAt(0) === '#') {
            attr.ref = value.substring(1);
        } else {
            attr.type = value;
        }
    }

    /**
     * The name of the target property to use when mapping
     * the attribute to a property on the target object.
     */
    targetProperty(value) {
        var attr = this.attr;
        attr.targetProperty = value;
    }
    /**
     * The "default-value" property allows a default value
     * to be provided when the attribute is not declared
     * on the custom tag.
     */
    defaultValue(value) {
        var attr = this.attr;
        attr.defaultValue = value;
    }
    /**
     * The "pattern" property allows the attribute
     * to be matched based on a simplified regular expression.
     *
     * Example:
     *
     * "pattern": "myprefix-*"
     */
    pattern(value) {
        var attr = this.attr;
        if (value === true) {
            var patternRegExp = raptorRegexp.simple(attr.name);
            attr.pattern = patternRegExp;
        }
    }

    /**
     * If "allow-expressions" is set to true (the default) then
     * the the attribute value will be parsed to find any dynamic
     * parts.
     */
    allowExpressions(value) {
        var attr = this.attr;
        attr.allowExpressions = value;
    }

    /**
     * By default, the Marko compiler maps an attribute
     * to a property by removing all dashes from the attribute
     * name and converting each character after a dash to
     * an uppercase character (e.g. "my-attr" --> "myAttr").
     *
     * Setting "preserve-name" to true will prevent this from
     * happening for the attribute.
     */
    preserveName(value) {
        var attr = this.attr;
        attr.preserveName = value;
    }
    /**
     * Declares an attribute as required. Currently, this is
     * not enforced and is only used for documentation purposes.
     *
     * Example:
     * "required": true
     */
    required(value) {
        var attr = this.attr;
        attr.required = value === true;
    }
    /**
     * This is the opposite of "preserve-name" and will result
     * in dashes being removed from the attribute if set to true.
     */
    removeDashes(value) {
        var attr = this.attr;
        attr.removeDashes = value === true;
    }
    /**
     * The description of the attribute. Only used for documentation.
     */
    description() {

    }

    /**
     * The "set-flag" property allows a "flag" to be added to a Node instance
     * at compile time if the attribute is found on the node. This is helpful
     * if an attribute uses a pattern and a transformer wants to have a simple
     * check to see if the Node has an attribute that matched the pattern.
     *
     * Example:
     *
     * "set-flag": "myCustomFlag"
     *
     * A Node instance can be checked if it has a flag set as shown below:
     *
     * if (node.hasFlag('myCustomFlag')) { ... }
     *
     *
     */
    setFlag(value) {
        var attr = this.attr;
        attr.setFlag = value;
    }
    /**
     * An attribute can be marked for ignore. Ignored attributes
     * will be ignored during compilation.
     */
    ignore(value) {
        var attr = this.attr;
        if (value === true) {
            attr.ignore = true;
        }
    }

    autocomplete(value) {
        this.attr.autocomplete = value;
    }

    enum(value) {
        this.attr.enum = value;
    }

    deprecated(value) {
        this.attr.deprecated = value;
    }

    name(value) {
        this.attr.name = value;
    }

    html(value) {
        this.attr.html = value === true;
    }
}


function loadAttributeFromProps(attrName, attrProps, dependencyChain) {
    assert.ok(typeof attrName === 'string');
    assert.ok(dependencyChain, '"dependencyChain" is required');

    var attr = new types.Attribute(attrName);

    var attrLoader = new AttrLoader(attr, dependencyChain);

    try {
        attrLoader.load(attrProps);
    } catch(err) {
        throw createError('Unable to load attribute "' + attrName + '" (' + dependencyChain + '): ' + err, err);
    }

    return attr;
}

loadAttributeFromProps.isSupportedProperty = function(name) {
    return AttrLoader.prototype.hasOwnProperty(name);
};


module.exports = loadAttributeFromProps;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

var ok = __webpack_require__(1).ok;
var forEachEntry = __webpack_require__(19);
var loaders = __webpack_require__(6);

module.exports = function loadAttributes(value, parent, dependencyChain) {
    ok(parent);
    ok(dependencyChain);

    forEachEntry(value, (attrName, attrProps) => {
        var attr = loaders.loadAttributeFromProps(
            attrName,
            attrProps,
            dependencyChain.append('@' + attrName));

        parent.addAttribute(attr);
    });
};

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

var jsonFileReader = __webpack_require__(25);
var types = __webpack_require__(4);
var cache = __webpack_require__(24);
var loaders = __webpack_require__(6);

var ok = __webpack_require__(1).ok;

function loadTagFromFile(filePath) {
    ok(filePath, '"filePath" is required');

    var tag = cache.get(filePath);

    // Only load a tag once by caching the loaded tags using the file
    // system file path as the key
    if (!tag) {
        tag = new types.Tag(filePath);
        cache.put(filePath, tag);

        var tagProps = jsonFileReader.readFileSync(filePath);
        loaders.loadTagFromProps(tag, tagProps);

    }

    return tag;
}

module.exports = loadTagFromFile;

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;
var propertyHandlers = __webpack_require__(20);
var isObjectEmpty = __webpack_require__(192);
var nodePath = __webpack_require__(2);
var markoModules = __webpack_require__(11); // NOTE: different implementation for browser
var ok = __webpack_require__(1).ok;
var bodyFunctionRegExp = /^([A-Za-z_$][A-Za-z0-9_]*)(?:\(([^)]*)\))?$/;
var safeVarName = /^[A-Za-z_$][A-Za-z0-9_]*$/;
var propertyHandlers = __webpack_require__(20);
var forEachEntry = __webpack_require__(19);
var markoCompiler = __webpack_require__(14);
var createError = __webpack_require__(13);
var types = __webpack_require__(4);
var loaders = __webpack_require__(6);


function exists(path) {
    try {
        markoModules.resolve(path);
        return true;
    } catch(e) {
        return false;
    }
}

function removeDashes(str) {
    return str.replace(/-([a-z])/g, function (match, lower) {
        return lower.toUpperCase();
    });
}

function hasAttributes(tagProps) {
    if (tagProps.attributes != null) {
        return true;
    }

    for (var name in tagProps) {
        if (tagProps.hasOwnProperty(name) && name.startsWith('@')) {
            return true;
        }
    }

    return false;
}


/**
 * We load tag definition using this class. Properties in the taglib
 * definition (which is just a JavaScript object with properties)
 * are mapped to handler methods in an instance of this type.
 *
 * @param {Tag} tag The initially empty Tag instance that we populate
 * @param {String} dirname The full file system path associated with the tag being loaded
 * @param {String} path An informational path associated with this tag (used for error reporting)
 */
class TagLoader {
    constructor(tag, dependencyChain) {
        this.tag = tag;
        this.dependencyChain = dependencyChain;

        this.filePath = tag.filePath;
        this.dirname = tag.dir || tag.dirname;
    }

    load(tagProps) {
        if (!hasAttributes(tagProps)) {
            // allow any attributes if no attributes are declared
            tagProps.attributes = {
                '*': {
                    type: 'string',
                    targetProperty: null,
                    preserveName: false
                }
            };
        }



        propertyHandlers(tagProps, this, this.dependencyChain.toString());
    }

    _handleVar(value, dependencyChain) {
        var tag = this.tag;

        var nestedVariable;

        if (typeof value === 'string') {
            nestedVariable = {
                name: value
            };
        } else {
            nestedVariable = {};

            propertyHandlers(value, {

                name: function(value) {
                    nestedVariable.name = value;
                },

                nameFromAttribute: function(value) {
                    nestedVariable.nameFromAttribute = value;
                }

            }, dependencyChain.toString());

            if (!nestedVariable.name && !nestedVariable.nameFromAttribute) {
                throw new Error('The "name" or "name-from-attribute" attribute is required for a nested variable (' + dependencyChain + ')');
            }
        }

        tag.addNestedVariable(nestedVariable);
    }

    /**
     * This is handler is for any properties that didn't match
     * one of the default property handlers. This is used to
     * match properties in the form of "@attr_name" or
     * "<nested_tag_name>"
     */
    '*'(name, value) {
        var tag = this.tag;
        var dependencyChain = this.dependencyChain;
        var parts = name.split(/\s+|\s+[,]\s+/);

        var i;
        var part;

        var hasNestedTag = false;
        var hasAttr = false;
        var nestedTagTargetProperty = null;

        // We do one pass to figure out if there is an
        // attribute or nested tag or both
        for (i=0; i<parts.length; i++) {
            part = parts[i];
            if (part.startsWith('@')) {
                hasAttr = true;

                if (i === 0) {
                    // Use the first attribute value as the name of the target property
                    nestedTagTargetProperty = part.substring(1);
                }
            } else if (part.startsWith('<')) {
                hasNestedTag = true;
            } else {
                // Unmatched property that is not an attribute or a
                // nested tag
                return false;
            }
        }

        var attrProps = {};
        var tagProps = {};
        var k;

        if (value != null && typeof value === 'object') {
            for (k in value) {
                if (value.hasOwnProperty(k)) {
                    if (k.startsWith('@') || k.startsWith('<')) {
                        // Move over all of the attributes and nested tags
                        // to the tag definition.
                        tagProps[k] = value[k];
                        delete value[k];
                    } else {
                        // The property is not a shorthand attribute or shorthand
                        // tag so move it over to either the tag definition
                        // or the attribute definition or both the tag definition
                        // and attribute definition.
                        var propNameDashes = removeDashes(k);

                        if (isSupportedProperty(propNameDashes) &&
                            loaders.isSupportedAttributeProperty(propNameDashes)) {
                            // Move over all of the properties that are associated with a tag
                            // and attribute
                            tagProps[k] = value[k];
                            attrProps[k] = value[k];
                            delete value[k];
                        } else if (isSupportedProperty(propNameDashes)) {
                            // Move over all of the properties that are associated with a tag
                            tagProps[k] = value[k];
                            delete value[k];
                        } else if (loaders.isSupportedAttributeProperty(propNameDashes)) {
                            // Move over all of the properties that are associated with an attr
                            attrProps[k] = value[k];
                            delete value[k];
                        }
                    }
                }
            }

            // If there are any left over properties then something is wrong
            // with the user's taglib.
            if (!isObjectEmpty(value)) {
                throw new Error('Unsupported properties of [' +
                    Object.keys(value).join(', ') +
                    ']');
            }

            var type = attrProps.type;
            if (!type && hasAttr && hasNestedTag) {
                // If we have an attribute and a nested tag then default
                // the attribute type to "expression"
                attrProps.type = 'expression';
            }
        } else if (typeof value === 'string') {
            if (hasNestedTag && hasAttr) {
                tagProps = attrProps = {
                    type: value
                };
            } else if (hasNestedTag) {
                tagProps = {
                    type: value
                };
            } else {
                attrProps = {
                    type: value
                };
            }
        }

        // Now that we have separated out attribute properties and tag properties
        // we need to create the actual attributes and nested tags
        for (i=0; i<parts.length; i++) {
            part = parts[i];
            if (part.startsWith('@')) {
                // This is a shorthand attribute
                var attrName = part.substring(1);

                var attr = loaders.loadAttributeFromProps(
                    attrName,
                    attrProps,
                    dependencyChain.append(part));

                tag.addAttribute(attr);
            } else if (part.startsWith('<')) {

                // This is a shorthand nested tag
                let nestedTag = new types.Tag(this.filePath);

                loadTagFromProps(
                    nestedTag,
                    tagProps,
                    dependencyChain.append(part));

                // We use the '[]' suffix to indicate that a nested tag
                // can be repeated
                var isNestedTagRepeated = false;
                if (part.endsWith('[]')) {
                    isNestedTagRepeated = true;
                    part = part.slice(0, -2);
                }

                var nestedTagName = part.substring(1, part.length-1);
                nestedTag.name = nestedTagName;
                nestedTag.isRepeated = isNestedTagRepeated;
                // Use the name of the attribute as the target property unless
                // this target property was explicitly provided
                nestedTag.targetProperty = attrProps.targetProperty || nestedTagTargetProperty;
                tag.addNestedTag(nestedTag);

                if (!nestedTag.isRepeated) {
                    let attr = loaders.loadAttributeFromProps(
                        nestedTag.targetProperty,
                        { type: 'object' },
                        dependencyChain.append(part));

                    tag.addAttribute(attr);
                }
            } else {
                return false;
            }
        }
    }

    /**
     * The tag name
     * @param {String} value The tag name
     */
    name(value) {
        var tag = this.tag;
        tag.name = value;
    }

    /**
     * The path to the renderer JS module to use for this tag.
     *
     * NOTE: We use the equivalent of require.resolve to resolve the JS module
     * 		 and use the tag directory as the "from".
     *
     * @param {String} value The renderer path
     */
    renderer(value) {
        var tag = this.tag;
        var dirname = this.dirname;
        var path = markoModules.resolveFrom(dirname, value);
        tag.renderer = path;
    }

    /**
     * A tag can use a renderer or a template to do the rendering. If
     * a template is provided then the value should be the path to the
     * template to use to render the custom tag.
     */
    template(value) {
        var tag = this.tag;
        var dirname = this.dirname;

        var path = nodePath.resolve(dirname, value);
        if (!exists(path)) {
            throw new Error('Template at path "' + path + '" does not exist.');
        }
        tag.template = path;
    }

    /**
     * An Object where each property maps to an attribute definition.
     * The property key will be the attribute name and the property value
     * will be the attribute definition. Example:
     * {
     *     "attributes": {
     *         "foo": "string",
     *         "bar": "expression"
     *     }
     * }
     */
    attributes(value) {
        var tag = this.tag;

        loaders.loadAttributes(value, tag, this.dependencyChain.append('attributes'));
    }

    /**
     * A custom tag can be mapped to module that is is used
     * to generate compile-time code for the custom tag. A
     * node type is created based on the methods and methods
     * exported by the code codegen module.
     */
    codeGenerator(value) {
        var tag = this.tag;
        var dirname = this.dirname;

        var path = markoModules.resolveFrom(dirname, value);
        tag.codeGeneratorModulePath = path;
    }

    /**
     * A custom tag can be mapped to a compile-time Node that gets
     * added to the parsed Abstract Syntax Tree (AST). The Node can
     * then generate custom JS code at compile time. The value
     * should be a path to a JS module that gets resolved using the
     * equivalent of require.resolve(path)
     */
    nodeFactory(value) {
        var tag = this.tag;
        var dirname = this.dirname;

        var path = markoModules.resolveFrom(dirname, value);
        tag.nodeFactoryPath = path;
    }

    /**
     * If the "preserve-whitespace" property is set to true then
     * all whitespace nested below the custom tag in a template
     * will be stripped instead of going through the normal whitespace
     * removal rules.
     */
    preserveWhitespace(value) {
        var tag = this.tag;
        tag.preserveWhitespace = !!value;
    }

    /**
     * If a custom tag has an associated transformer then the transformer
     * will be called on the compile-time Node. The transformer can manipulate
     * the AST using the DOM-like API to change how the code gets generated.
     */
    transformer(value) {
        var tag = this.tag;
        var dirname = this.dirname;

        var transformer = new types.Transformer();

        if (typeof value === 'string') {
            // The value is a simple string type
            // so treat the value as the path to the JS
            // module for the transformer
            value = {
                path: value
            };
        }

        /**
         * The transformer is a complex type and we need
         * to process each property to load the Transformer
         * definition.
         */
        propertyHandlers(value, {
            path(value) {
                var path = markoModules.resolveFrom(dirname, value);
                transformer.path = path;
            },

            priority(value) {
                transformer.priority = value;
            },

            name(value) {
                transformer.name = value;
            },

            properties(value) {
                var properties = transformer.properties || (transformer.properties = {});
                for (var k in value) {
                    if (value.hasOwnProperty(k)) {
                        properties[k] = value[k];
                    }
                }
            }

        }, this.dependencyChain.append('transformer'));

        ok(transformer.path, '"path" is required for transformer');

        tag.addTransformer(transformer);
    }

    /**
     * The "var" property is used to declared nested variables that get
     * added as JavaScript variables at compile time.
     *
     * Examples:
     *
     * "var": "myScopedVariable",
     *
     * "var": {
     *     "name": "myScopedVariable"
     * }
     *
     * "var": {
     *     "name-from-attribute": "var"
     * }
     */
    var(value) {
        this._handleVar(value, this.dependencyChain.append('var'));
    }
    /**
     * The "vars" property is equivalent to the "var" property
     * except that it expects an array of nested variables.
     */
    vars(value) {
        if (value) {
            value.forEach((v, i) => {
                this._handleVar(v, this.dependencyChain.append('vars[' + i + ']'));
            });
        }
    }
    /**
     * The "body-function" property" allows the nested body content to be mapped
     * to a function at compile time. The body function gets mapped to a property
     * of the tag renderer at render time. The body function can have any number
     * of parameters.
     *
     * Example:
     * - "body-function": "_handleBody(param1, param2, param3)"
     */
    bodyFunction(value) {
        var tag = this.tag;
        var parts = bodyFunctionRegExp.exec(value);
        if (!parts) {
            throw new Error('Invalid value of "' + value + '" for "body-function". Expected value to be of the following form: <function-name>([param1, param2, ...])');
        }

        var functionName = parts[1];
        var params = parts[2];
        if (params) {
            params = params.trim().split(/\s*,\s*/);
            for (var i=0; i<params.length; i++) {
                if (params[i].length === 0) {
                    throw new Error('Invalid parameters for body-function with value of "' + value + '"');
                } else if (!safeVarName.test(params[i])) {
                    throw new Error('Invalid parameter name of "' + params[i] + '" for body-function with value of "' + value + '"');
                }
            }
        } else {
            params = [];
        }

        tag.setBodyFunction(functionName, params);
    }
    /**
     * The "import-var" property can be used to add a property to the
     * input object of the tag renderer whose value is determined by
     * a JavaScript expression.
     *
     * Example:
     * "import-var": {
     *     "myTargetProperty": "data.myCompileTimeJavaScriptExpression",
     * }
     */
    importVar(value) {
        var tag = this.tag;
        forEachEntry(value, (varName, varValue) => {
            var importedVar = {
                targetProperty: varName
            };

            var expression = varValue;

            if (!expression) {
                expression = varName;
            }
            else if (typeof expression === 'object') {
                expression = expression.expression;
            }

            if (!expression) {
                throw new Error('Invalid "import-var": ' + __webpack_require__(36).inspect(varValue));
            }

            importedVar.expression = markoCompiler.builder.parseExpression(expression);
            tag.addImportedVariable(importedVar);
        });
    }
    /**
     * The tag type.
     */
    type(value) {
        var tag = this.tag;
        tag.type = value;
    }
    /**
     * Declare a nested tag.
     *
     * Example:
     * {
     *     ...
     *     "nested-tags": {
     *        "tab": {
     *            "target-property": "tabs",
     *            "isRepeated": true
     *        }
     *     }
     * }
     */
    nestedTags(value) {
        var filePath = this.filePath;
        var tag = this.tag;

        forEachEntry(value, (nestedTagName, nestedTagDef) => {
            var dependencyChain = this.dependencyChain.append(`nestedTags["${nestedTagName}]`);
            var nestedTag = new types.Tag(filePath);

            loadTagFromProps(
                nestedTag,
                nestedTagDef,
                dependencyChain);

            nestedTag.name = nestedTagName;
            tag.addNestedTag(nestedTag);

            if (!nestedTag.isRepeated) {
                let attr = loaders.loadAttributeFromProps(
                    nestedTag.targetProperty,
                    { type: 'object' },
                    dependencyChain);

                tag.addAttribute(attr);
            }
        });
    }
    escapeXmlBody(value) {
        if (value === false) {
            this.tag.escapeXmlBody = false;
        }
    }

    /**
     * Sends the body content type. This is used to control how the body
     * content is parsed.
     */
    body(value) {
        if (value === 'static-text' || value === 'parsed-text' || value === 'html') {
            this.tag.body = value;
        } else {
            throw new Error('Invalid value for "body". Allowed: "static-text", "parsed-text" or "html"');
        }
    }

    openTagOnly(value) {
        this.tag.openTagOnly = value;
    }

    noOutput(value) {
        this.tag.noOutput = value;
    }

    autocomplete(value) {
        this.tag.autocomplete = value;
    }

    parseOptions(value) {
        this.tag.parseOptions = value;
    }

    deprecated(value) {
        this.tag.deprecated = value;
    }

    parseAttributes(value) {
        this.tag.parseAttributes = value;
    }

    attributeGroups(value) {
        if (!value) {
            return;
        }

        var attributeGroups = this.tag.attributeGroups || (this.tag.attributeGroups = []);
        this.tag.attributeGroups = attributeGroups.concat(value);
    }

    html(value) {
        this.tag.html = value === true;
    }

    htmlType(value) {
        this.tag.htmlType = value;
    }
}

function isSupportedProperty(name) {
    return TagLoader.prototype.hasOwnProperty(name);
}

function loadTagFromProps(tag, tagProps, dependencyChain) {
    ok(typeof tagProps === 'object', 'Invalid "tagProps"');
    ok(dependencyChain, '"dependencyChain" is required');

    var tagLoader = new TagLoader(tag, dependencyChain);

    try {
        tagLoader.load(tagProps);
    } catch(err) {
        throw createError('Unable to load tag (' + dependencyChain + '): ' + err, err);
    }

    return tag;
}



module.exports = loadTagFromProps;

loadTagFromProps.isSupportedProperty = isSupportedProperty;


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

var jsonFileReader = __webpack_require__(25);
var types = __webpack_require__(4);
var cache = __webpack_require__(24);
var loaders = __webpack_require__(6);

var ok = __webpack_require__(1).ok;

function loadFromFile(filePath) {
    ok(filePath, '"filePath" is required');

    var taglib = cache.get(filePath);

    // Only load a taglib once by caching the loaded taglibs using the file
    // system file path as the key
    if (!taglib) {
        taglib = new types.Taglib(filePath);
        cache.put(filePath, taglib);

        var taglibProps = jsonFileReader.readFileSync(filePath);
        loaders.loadTaglibFromProps(taglib, taglibProps);
    }

    return taglib;
}

module.exports = loadFromFile;

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;
var types = __webpack_require__(4);
var nodePath = __webpack_require__(2);
var scanTagsDir = __webpack_require__(47);
var markoModules = __webpack_require__(11); // NOTE: different implementation for browser
var propertyHandlers = __webpack_require__(20);
var types = __webpack_require__(4);
var jsonFileReader = __webpack_require__(25);
var tryRequire = __webpack_require__(207);
var resolveFrom = tryRequire('resolve-from', !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
var DependencyChain = __webpack_require__(23);
var createError = __webpack_require__(13);
var loaders = __webpack_require__(6);

function exists(path) {
    try {
        markoModules.resolve(path);
        return true;
    } catch(e) {
        return false;
    }
}

/**
 * We load a taglib definion using this class. Properties in the taglib
 * definition (which is just a JavaScript object with properties)
 * are mapped to handler methods in an instance of this type.
 *
 *
 * @param {Taglib} taglib The initially empty Taglib instance that we will populate
 * @param {String} path The file system path to the taglib that we are loading
 */
class TaglibLoader {
    constructor(taglib, dependencyChain) {
        ok(dependencyChain instanceof DependencyChain, '"dependencyChain" is not valid');

        this.dependencyChain = dependencyChain;

        this.taglib = taglib;
        this.filePath = taglib.filePath;
        this.dirname = taglib.dirname;
    }

    load(taglibProps) {

        var taglib = this.taglib;

        propertyHandlers(taglibProps, this, this.dependencyChain.toString());

        if (!taglib.id) {
            // Fixes #73
            // See if there is a package.json in the same directory as the taglib file.
            // If so, and if that package.json file has a "name" property then we will
            // use the the name as the "taglib ID". The taglib ID is used to uniquely
            // identity a taglib (ignoring version) and it is used to prevent the same
            // taglib from being loaded multiple times.
            //
            // Using the file path as the taglib ID doesn't work so well since we might find
            // the same taglib multiple times in the Node.js module search path with
            // different paths.
            var filePath = this.filePath;
            var dirname = this.dirname;

            var packageJsonPath = nodePath.join(dirname, 'package.json');


            try {
                var pkg = jsonFileReader.readFileSync(packageJsonPath);
                taglib.id = pkg.name;
            } catch(e) {}

            if (!taglib.id) {
                taglib.id = filePath;
            }
        }
    }

    _handleTag(tagName, value, dependencyChain) {
        var tagProps;
        var tagFilePath = this.filePath;

        var tag;

        if (typeof value === 'string') {
            tagFilePath = nodePath.resolve(this.dirname, value);


            if (!exists(tagFilePath)) {
                throw new Error('Tag at path "' + tagFilePath + '" does not exist. (' + dependencyChain + ')');
            }

            tag = new types.Tag(tagFilePath);

            tagProps = jsonFileReader.readFileSync(tagFilePath);
            dependencyChain = dependencyChain.append(tagFilePath);
        } else {
            tag = new types.Tag(this.filePath);
            tagProps = value;
        }

        loaders.loadTagFromProps(tag, tagProps, dependencyChain);

        if (tag.name === undefined) {
            tag.name = tagName;
        }

        this.taglib.addTag(tag);
    }

    // We register a wildcard handler to handle "@my-attr" and "<my-tag>"
    // properties (shorthand syntax)
    '*'(name, value) {
        var taglib = this.taglib;
        var filePath = this.filePath;

        if (name.startsWith('<')) {
            let tagName = name.slice(1, -1);
            this._handleTag(tagName, value, this.dependencyChain.append(name));
        } else if (name.startsWith('@')) {
            var attrKey = name.substring(1);

            var attr = loaders.loadAttributeFromProps(
                attrKey,
                value,
                this.dependencyChain.append('@' + attrKey));

            attr.filePath = filePath;
            attr.key = attrKey;

            taglib.addAttribute(attr);
        } else {
            return false;
        }
    }

    attributes(value) {
        // The value of the "attributes" property will be an object
        // where each property maps to an attribute definition. Since these
        // attributes are on the taglib they will be "global" attribute
        // defintions.
        //
        // The property key will be the attribute name and the property value
        // will be the attribute definition. Example:
        // {
        //     "attributes": {
        //         "foo": "string",
        //         "bar": "expression"
        //     }
        // }
        var taglib = this.taglib;

        Object.keys(value).forEach((attrName) => {
            var attrDef = value[attrName];

            var attr = loaders.loadAttributeFromProps(
                attrName,
                attrDef,
                this.dependencyChain.append('@' + attrName));

            attr.key = attrName;

            taglib.addAttribute(attr);
        });
    }
    tags(tags) {
        // The value of the "tags" property will be an object
        // where each property maps to an attribute definition. The property
        // key will be the tag name and the property value
        // will be the tag definition. Example:
        // {
        //     "tags": {
        //         "foo": {
        //             "attributes": { ... }
        //         },
        //         "bar": {
        //             "attributes": { ... }
        //         },
        //     }
        // }

        for (var tagName in tags) {
            if (tags.hasOwnProperty(tagName)) {
                this._handleTag(tagName, tags[tagName], this.dependencyChain.append('tags.' + tagName));
            }
        }
    }
    tagsDir(dir) {
        // The "tags-dir" property is used to supporting scanning
        // of a directory to discover custom tags. Scanning a directory
        // is a much simpler way for a developer to create custom tags.
        // Only one tag is allowed per directory and the directory name
        // corresponds to the tag name. We only search for directories
        // one level deep.
        var taglib = this.taglib;
        var path = this.filePath;
        var dirname = this.dirname;

        taglib.tagsDir = dir;

        if (dir != null) {
            if (Array.isArray(dir)) {
                for (var i = 0; i < dir.length; i++) {
                    scanTagsDir(path, dirname, dir[i], taglib, this.dependencyChain.append(`tags-dir[${i}]`));
                }
            } else {
                scanTagsDir(path, dirname, dir, taglib, this.dependencyChain.append(`tags-dir`));
            }
        }
    }

    taglibImports(imports) {
        if (!resolveFrom) {
            return;
        }
        // The "taglib-imports" property allows another taglib to be imported
        // into this taglib so that the tags defined in the imported taglib
        // will be part of this taglib.
        //
        // NOTE: If a taglib import refers to a package.json file then we read
        //       the package.json file and automatically import *all* of the
        //       taglibs from the installed modules found in the "dependencies"
        //       section
        var taglib = this.taglib;
        var dirname = this.dirname;
        var importPath;

        if (imports && Array.isArray(imports)) {
            for (var i=0; i<imports.length; i++) {
                var curImport = imports[i];
                if (typeof curImport === 'string') {
                    var basename = nodePath.basename(curImport);
                    if (basename === 'package.json') {
                        var packagePath = markoModules.resolveFrom(dirname, curImport);
                        var packageDir = nodePath.dirname(packagePath);
                        var pkg = jsonFileReader.readFileSync(packagePath);
                        var dependencies = pkg.dependencies;
                        if (dependencies) {
                            var dependencyNames = Object.keys(dependencies);
                            for (var j=0; j<dependencyNames.length; j++) {
                                var dependencyName = dependencyNames[j];

                                importPath = resolveFrom(packageDir, dependencyName + '/marko.json');

                                if (importPath) {
                                    taglib.addImport(importPath);
                                }
                            }
                        }
                    } else {
                        importPath = resolveFrom(dirname, curImport);
                        if (importPath) {
                            taglib.addImport(importPath);
                        } else {
                            throw new Error('Import not fount: ' + curImport + ' (from ' + dirname + ')');
                        }
                    }
                }
            }
        }
    }

    textTransformer(value) {
        // Marko allows a "text-transformer" to be registered. The provided
        // text transformer will be called for any static text found in a template.
        var taglib = this.taglib;
        var dirname = this.dirname;

        var transformer = new types.Transformer();

        if (typeof value === 'string') {
            value = {
                path: value
            };
        }

        propertyHandlers(value, {
            path(value) {
                var path = markoModules.resolveFrom(dirname, value);
                transformer.path = path;
            }

        }, this.dependencyChain.append('textTransformer').toString());

        ok(transformer.path, '"path" is required for transformer');

        taglib.addTextTransformer(transformer);
    }

    /**
     * Allows an ID to be explicitly assigned to a taglib.
     * The taglib ID is used to prevent the same taglib  (even if different versions)
     * from being loaded multiple times.
     *
     * NOTE: Introduced as part of fix for #73
     *
     * @param  {String} value The taglib ID
     */
    taglibId(value) {
        var taglib = this.taglib;
        taglib.id = value;
    }

    transformer(value) {
        // Marko allows a "text-transformer" to be registered. The provided
        // text transformer will be called for any static text found in a template.
        var taglib = this.taglib;
        var dirname = this.dirname;

        var transformer = new types.Transformer();

        if (typeof value === 'string') {
            value = {
                path: value
            };
        }

        propertyHandlers(value, {
            path(value) {
                var path = markoModules.resolveFrom(dirname, value);
                transformer.path = path;
            }

        }, this.dependencyChain.append('transformer').toString());

        ok(transformer.path, '"path" is required for transformer');

        taglib.addTransformer(transformer);
    }

    attributeGroups(value) {
        let taglib = this.taglib;
        let attributeGroups = taglib.attributeGroups || (taglib.attributeGroups = {});
        let dependencyChain = this.dependencyChain.append('attribute-groups');

        Object.keys(value).forEach((attrGroupName) => {
            let attrGroup = attributeGroups[attrGroupName] = {};
            let attrGroupDependencyChain = dependencyChain.append(attrGroupName);

            let rawAttrGroup = value[attrGroupName];

            Object.keys(rawAttrGroup).forEach((attrName) => {
                var rawAttrDef = rawAttrGroup[attrName];

                let attr = loaders.loadAttributeFromProps(
                    attrName,
                    rawAttrDef,
                    attrGroupDependencyChain.append('@' + attrName));

                attrGroup[attrName] = attr;
            });
        });
    }
}


function loadTaglibFromProps(taglib, taglibProps, dependencyChain) {
    ok(taglib, '"taglib" is required');
    ok(taglibProps, '"taglibProps" is required');
    ok(taglib.filePath, '"taglib.filePath" is required');

    if (!dependencyChain) {
        dependencyChain = new DependencyChain([taglib.filePath]);
    }

    var taglibLoader = new TaglibLoader(taglib, dependencyChain);

    try {
        taglibLoader.load(taglibProps);
    } catch(err) {
        throw createError('Unable to load taglib (' + dependencyChain + '): ' + err, err);
    }

    return taglib;
}

module.exports = loadTaglibFromProps;

/***/ }),
/* 155 */
/***/ (function(module, exports) {

// Rather than using a full-blown JavaScript parser, we are going to use a few regular expressions
// to tokenize the code and find what we are interested in
var tagStartRegExp = /(^\s*(?:(?:exports.(?:tag|TAG))|(?:TAG))\s*=\s*)\{/m;

// Tokens: "<string>", '<string>', /*<some comment*/, //<single line comment>, {, }, ;
var tokensRegExp = /"(?:[^"]|\\")*"|'(?:[^'])|(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*)|[\{\};]/g;

function extractTagDef(code) {

    var startMatches = tagStartRegExp.exec(code);

    var tagDefStart;
    var tagDefEnd;

    if (startMatches) {
        tagDefStart = startMatches.index + startMatches[1].length;
        var nextTokenMatches;
        tokensRegExp.lastIndex = tagDefStart;
        var depth = 0;

        while ((nextTokenMatches = tokensRegExp.exec(code))) {
            if (nextTokenMatches[0] === '{') {
                depth++;
                continue;
            } else if (nextTokenMatches[0] === '}') {
                if (--depth === 0) {
                    tagDefEnd = tokensRegExp.lastIndex;
                    break;
                }
            }
            else if (nextTokenMatches[0] === ';') {
                tagDefEnd = nextTokenMatches.index;
                break;
            }
        }

        if (tagDefStart != null && tagDefEnd != null) {
            var jsTagDef = code.substring(tagDefStart, tagDefEnd);
            var tagDefObject;

            try {
                // Try parsing it as JSON
                tagDefObject = JSON.parse(jsTagDef);
            } catch(e) {
                // Try parsing it as JavaScript
                try {
                    tagDefObject = eval('(' + jsTagDef + ')');
                } catch(e) {
                    tagDefObject = {};
                }
            }
            return tagDefObject;
        }
    } else {
        return null;
    }
}

exports.extractTagDef = extractTagDef;

/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;
var taglibTypes = __webpack_require__(4);
var Text = __webpack_require__(45);
var extend = __webpack_require__(5);

function transformerComparator(a, b) {
    a = a.priority;
    b = b.priority;

    if (a == null) {
        a = Number.MAX_VALUE;
    }

    if (b == null) {
        b = Number.MAX_VALUE;
    }

    return a - b;
}

function TAG_COMPARATOR(a, b) {
    a = a.name;
    b = b.name;
    return a.localeCompare(b);
}

function merge(target, source) {
    for (var k in source) {
        if (source.hasOwnProperty(k)) {
            if (target[k] && typeof target[k] === 'object' &&
                source[k] && typeof source[k] === 'object') {

                if (source.__noMerge) {
                    // Don't merge objects that are explicitly marked as "do not merge"
                    continue;
                }

                if (Array.isArray(target[k]) || Array.isArray(source[k])) {

                    var targetArray = target[k];
                    var sourceArray = source[k];


                    if (!Array.isArray(targetArray)) {
                        targetArray = [targetArray];
                    }

                    if (!Array.isArray(sourceArray)) {
                        sourceArray = [sourceArray];
                    }

                    target[k] = [].concat(targetArray).concat(sourceArray);
                } else {
                    var Ctor = target[k].constructor;
                    var newTarget = new Ctor();
                    merge(newTarget, target[k]);
                    merge(newTarget, source[k]);
                    target[k] = newTarget;
                }

            } else {
                target[k] = source[k];
            }
        }
    }

    return target;
}

/**
 * A taglib lookup merges in multiple taglibs so there is a single and fast lookup
 * for custom tags and custom attributes.
 */
class TaglibLookup {
    constructor() {
        this.merged = {
            attributeGroups: {}
        };
        this.taglibsById = {};
        this._inputFiles = null;

        this._sortedTags = undefined;
    }

    hasTaglib(taglib) {
        return this.taglibsById.hasOwnProperty(taglib.id);
    }

    _mergeNestedTags(taglib) {
        var Tag = taglibTypes.Tag;
        // Loop over all of the nested tags and register a new custom tag
        // with the fully qualified name

        var merged = this.merged;

        function handleNestedTags(tag, parentTagName) {
            tag.forEachNestedTag(function(nestedTag) {
                var fullyQualifiedName = parentTagName + ':' + nestedTag.name;
                // Create a clone of the nested tag since we need to add some new
                // properties
                var clonedNestedTag = new Tag();
                extend(clonedNestedTag, nestedTag);
                // Record the fully qualified name of the parent tag that this
                // custom tag is associated with.
                clonedNestedTag.parentTagName = parentTagName;
                clonedNestedTag.name = fullyQualifiedName;
                merged.tags[fullyQualifiedName] = clonedNestedTag;
                handleNestedTags(clonedNestedTag, fullyQualifiedName);
            });
        }

        taglib.forEachTag(function(tag) {
            handleNestedTags(tag, tag.name);
        });
    }

    addTaglib(taglib) {
        ok(taglib, '"taglib" is required');
        ok(taglib.id, '"taglib.id" expected');

        if (this.taglibsById.hasOwnProperty(taglib.id)) {
            return;
        }

        // console.log("TAGLIB:", taglib);

        this._sortedTags = undefined;

        this.taglibsById[taglib.id] = taglib;

        merge(this.merged, {
            tags: taglib.tags,
            transformers: taglib.transformers,
            textTransformers: taglib.textTransformers,
            attributes: taglib.attributes,
            patternAttributes: taglib.patternAttributes,
            attributeGroups: taglib.attributeGroups || {}
        });

        this._mergeNestedTags(taglib);
    }

    getTagsSorted() {
        var sortedTags = this._sortedTags;

        if (sortedTags === undefined) {
            sortedTags = this._sortedTags = [];
            this.forEachTag((tag) => {
                sortedTags.push(tag);
            });
            sortedTags.sort(TAG_COMPARATOR);
        }

        return sortedTags;
    }

    forEachTag(callback) {
        var tags = this.merged.tags;
        if (tags) {
            for (var tagName in tags) {
                if (tags.hasOwnProperty(tagName)) {
                    var tag = tags[tagName];
                    var result = callback(tag);
                    if (result === false) {
                        break;
                    }
                }
            }
        }
    }

    forEachAttribute(tagName, callback) {
        var tags = this.merged.tags;
        if (!tags) {
            return;
        }

        var globalAttributes = this.merged.attributes;
        var taglibAttributeGroups = this.merged.attributeGroups;



        function findAttributesForTagName(tagName) {
            var tag = tags[tagName];
            if (!tag) {
                return;
            }

            function handleAttr(attrDef) {
                if (attrDef.ref) {
                    attrDef = globalAttributes[attrDef.ref];
                }
                callback(attrDef, tag);
            }

            var attributes = tag.attributes;
            if (!attributes) {
                return;
            }

            for (var attrName in attributes) {
                if (attributes.hasOwnProperty(attrName)) {
                    handleAttr(attributes[attrName], tag);
                }
            }

            if (tag.attributeGroups) {
                for (let i=0; i<tag.attributeGroups.length; i++) {
                    let attributeGroupName = tag.attributeGroups[i];
                    let attributeGroup = taglibAttributeGroups[attributeGroupName];
                    if (attributeGroup) {
                        for (let attrName in attributeGroup) {
                            handleAttr(attributeGroup[attrName]);
                        }
                    }
                }
            }

            if (tag.patternAttributes) {
                tag.patternAttributes.forEach(handleAttr);
            }
        }

        findAttributesForTagName(tagName); // Look for an exact match at the tag level
        findAttributesForTagName('*'); // Including attributes that apply to all tags
    }

    getTag(element) {
        if (typeof element === 'string') {
            element = {
                tagName: element
            };
        }
        var tags = this.merged.tags;
        if (!tags) {
            return;
        }

        var tagName = element.tagName;
        return tags[tagName];
    }

    getAttribute(element, attr) {
        if (typeof element === 'string') {
            element = {
                tagName: element
            };
        }

        if (typeof attr === 'string') {
            attr = {
                name: attr
            };
        }

        var tags = this.merged.tags;
        if (!tags) {
            return;
        }

        var taglibAttributeGroups = this.merged.attributeGroups;

        var tagName = element.tagName;
        var attrName = attr.name;

        function findAttributeForTag(tag, attributes, attrName) {
            // try by exact match first
            var attribute = attributes[attrName];
            if (attribute === undefined) {
                if (tag.attributeGroups) {
                    for (let i=0; i<tag.attributeGroups.length; i++) {
                        let attributeGroupName = tag.attributeGroups[i];
                        let attributeGroup = taglibAttributeGroups[attributeGroupName];
                        if (attributeGroup) {
                            attribute = attributeGroup[attrName];
                            if (attribute !== undefined) {
                                break;
                            }
                        }
                    }
                }
            }

            if (attribute === undefined && attrName !== '*') {
                if (tag.patternAttributes) {
                    // try searching by pattern
                    for (var i = 0, len = tag.patternAttributes.length; i < len; i++) {
                        var patternAttribute = tag.patternAttributes[i];
                        if (patternAttribute.pattern.test(attrName)) {
                            attribute = patternAttribute;
                            break;
                        }
                    }
                }
            }

            return attribute;
        }

        var globalAttributes = this.merged.attributes;

        function tryAttribute(tagName, attrName) {
            var tag = tags[tagName];
            if (!tag) {
                return undefined;
            }

            return findAttributeForTag(tag, tag.attributes, attrName);
        }

        var attrDef = tryAttribute(tagName, attrName) || // Look for an exact match at the tag level
            tryAttribute('*', attrName) || // If not there, see if there is a exact match on the attribute name for attributes that apply to all tags
            tryAttribute(tagName, '*'); // Otherwise, see if there is a splat attribute for the tag

        if (attrDef && attrDef.ref) {
            attrDef = globalAttributes[attrDef.ref];
        }

        return attrDef;
    }

    forEachTemplateTransformer(callback, thisObj) {
        var transformers = this.merged.transformers;
        if (transformers && transformers.length) {
            transformers.forEach(callback, thisObj);
        }
    }

    forEachNodeTransformer(node, callback, thisObj) {
        /*
         * Based on the type of node we have to choose how to transform it
         */
        if (node.tagName || node.tagNameExpression) {
            this.forEachTagTransformer(node, callback, thisObj);
        } else if (node instanceof Text) {
            this.forEachTextTransformer(callback, thisObj);
        }
    }

    forEachTagTransformer(element, callback, thisObj) {
        if (typeof element === 'string') {
            element = {
                tagName: element
            };
        }

        var tagName = element.tagName;
        /*
         * If the node is an element node then we need to find all matching
         * transformers based on the URI and the local name of the element.
         */

        var transformers = [];

        function addTransformer(transformer) {
            if (!transformer || !transformer.getFunc) {
                throw new Error('Invalid transformer');
            }

            transformers.push(transformer);
        }

        /*
         * Handle all of the transformers for all possible matching transformers.
         *
         * Start with the least specific and end with the most specific.
         */

        if (this.merged.tags) {
            if (tagName) {
                if (this.merged.tags[tagName]) {
                    this.merged.tags[tagName].forEachTransformer(addTransformer);
                }
            }

            if (this.merged.tags['*']) {
                this.merged.tags['*'].forEachTransformer(addTransformer);
            }
        }

        transformers.sort(transformerComparator);

        transformers.forEach(callback, thisObj);
    }

    forEachTextTransformer(callback, thisObj) {
        if (this.merged.textTransformers) {
            this.merged.textTransformers.sort(transformerComparator);
            this.merged.textTransformers.forEach(callback, thisObj);
        }
    }

    getInputFiles() {
        if (!this._inputFiles) {
            var inputFilesSet = {};

            for (var taglibId in this.taglibsById) {
                if (this.taglibsById.hasOwnProperty(taglibId)) {

                    var taglibInputFiles = this.taglibsById[taglibId].getInputFiles();
                    var len = taglibInputFiles.length;
                    if (len) {
                        for (var i=0; i<len; i++) {
                            inputFilesSet[taglibInputFiles[i]] = true;
                        }
                    }
                }
            }

            this._inputFiles = Object.keys(inputFilesSet);
        }

        return this._inputFiles;
    }

    toString() {
        return 'lookup: ' + this.getInputFiles().join(', ');
    }
}

module.exports = TaglibLookup;

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var path = __webpack_require__(2);

function getRelativePath(absolutePath) {
    if (typeof window === 'undefined') {
        absolutePath = path.resolve(process.cwd(), absolutePath);
        return path.relative(process.cwd(), absolutePath);
    } else {
        return absolutePath;
    }
}

class PosInfo {
    constructor(path, line, column) {
        this.path = getRelativePath(path);
        this.line = line;
        this.column = column;
    }

    toString() {
        return this.path + (this.line != null ? (":" + this.line + ":" + this.column) : '');
    }
}

module.exports = PosInfo;

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var safeVarName = __webpack_require__(28);

class UniqueVars {
    constructor() {
        this.vars = {};
    }

    addVar(name, value) {
        if (typeof value !== 'string') {
            // Convert the non-string value into a string for easy comparison
            value = JSON.stringify(value);
        }

        name = safeVarName(name);

        var entry = this.vars[name];
        if (entry) {
            var vars = entry.vars;

            // See if there is already a variable with the requested value
            for (var i=0; i<vars.length; i++) {
                var curVar = vars[i];
                if (curVar.value === value) {
                    return curVar.name;
                }
            }

            let newEntry = {
                name: name + (++entry.counter),
                value: value
            };

            entry.vars.push(newEntry);
            return newEntry.name;
        } else {
            entry = {
                vars: [
                    {
                        name: name,
                        value: value
                    }
                ],
                counter: 1
            };

            this.vars[name] = entry;
        }

        return name;
    }
}

module.exports = UniqueVars;

/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(197);

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

var sha1 = __webpack_require__(205);

module.exports = function(str) {
    return sha1.sync(str);
};

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {


var lassoPackageRoot = __webpack_require__(71);
var path = __webpack_require__(2);
var lassoCachingFS = __webpack_require__(70);
var fs = __webpack_require__(8);
var stripJsonComments = __webpack_require__(35);
var fsReadOptions = { encoding: 'utf8' };

function parseJSONFile(path) {
    var json = fs.readFileSync(path, fsReadOptions);

    try {
        var taglibProps = JSON.parse(stripJsonComments(json));
        return taglibProps;
    } catch(e) {
        throw new Error('Unable to parse JSON file at path "' + path + '". Error: ' + e);
    }
}


function loadTags(file) {

    var raw = parseJSONFile(file);
    var tags = {};

    for (var k in raw) {
        if (raw.hasOwnProperty(k)) {
            if (k.charAt(0) === '<' && k.charAt(k.length - 1) === '>') {
                var tagName = k.substring(1, k.length - 1);
                tags[tagName] = true;
            }
        }
    }

    return tags;
}


var cache = {};

function getPackageRootDir(dirname) {
    try {
        return lassoPackageRoot.getRootDir(dirname);
    } catch(e) {
        return undefined;
    }
}

function isRegisteredElement(tagName, dir) {
    var packageRootDir = getPackageRootDir(dir);

    var currentDir = dir;

    while (true) {
        var filePath = path.join(currentDir, 'html-elements.json');
        if (lassoCachingFS.existsSync(filePath)) {
            var tags = cache[filePath];
            if (!tags) {
                tags = cache[filePath] = loadTags(filePath);
            }

            if (tags[tagName]) {
                return true;
            }
        }


        var parentDir = path.dirname(currentDir);
        if (!parentDir || parentDir === currentDir || parentDir === packageRootDir) {
            break;
        }
        currentDir = parentDir;
    }

    return false;
}

exports.isRegisteredElement = isRegisteredElement;

/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

var reservedWords = __webpack_require__(50);

module.exports = function isJavaScriptReservedWord(varName) {
    return reservedWords[varName] === true;
};


/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var safeVarName = __webpack_require__(28);
var ok = __webpack_require__(1).ok;

class MacrosContext {
    constructor() {
        this._byName = {};
    }

    isMacro(name) {
        if (!name) {
            return false;
        }

        if (name.type === 'Literal') {
            name = name.value;
        }

        return this._byName.hasOwnProperty(name);
    }

    getRegisteredMacro(name) {
        return this._byName[name];
    }

    registerMacro(name, params) {
        ok(name, '"name" is required');
        ok(typeof name === 'string', '"name" should be a string');
        if (params == null) {
            params = [];

        } else {
            ok(Array.isArray(params), '"params" should be an array');
        }


        var hasOut = false;
        var hasRenderBody = false;
        params.forEach((param) => {
            if (param === 'out') {
                hasOut = true;
            } else if (param === 'renderBody') {
                hasRenderBody = true;
            }
        });

        if (!hasOut) {
            params.push('out');
        }

        if (!hasRenderBody) {
            params.push('renderBody');
        }

        var paramIndexes = {};
        params.forEach((param, i) => {
            paramIndexes[param] = i;

            if (param === 'out') {
                hasOut = true;
            } else if (param === 'renderBody') {
                hasRenderBody = true;
            }
        });

        var functionName = 'macro_' + safeVarName(name);

        var macroDef = {
            name: name,
            params: params,
            functionName: functionName,
            getParamIndex: function(param) {
                return paramIndexes[param];
            }
        };

        this._byName[name] = macroDef;

        return macroDef;
    }
}

function createMacrosContext() {
    return new MacrosContext();
}

exports.createMacrosContext = createMacrosContext;

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

var parseJavaScript = __webpack_require__(51);

module.exports = function(src, builder) {
    return parseJavaScript(src, builder, true /* isExpression */ );
};

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ok = __webpack_require__(1).ok;

function parseJavaScriptArgs(args, builder) {
    ok(typeof args === 'string', '"args" should be a string');
    ok(builder, '"builder" is required');

    var parsed = builder.parseExpression('[' + args + ']');
    return parsed.elements;
}

module.exports = parseJavaScriptArgs;

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

var parseJavaScript = __webpack_require__(51);

module.exports = function(src, builder) {
    return parseJavaScript(src, builder, false /* isExpression */ );
};

/***/ }),
/* 167 */
/***/ (function(module, exports) {

module.exports = function removeDashes(str) {
    return str.replace(/-([a-z])/g, function (match, lower) {
        return lower.toUpperCase();
    });
};

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
Algorithm:

Walk the DOM tree to find all HtmlElementVDOM and TextVDOM nodes

a) If a node is static then move to a static variable. Depending on whether or not the node is a root or nested,
we will need to replace it with one of the following:
- out.n(staticVar)
- .n(staticVar)

b) If a node is HTML-only then generate code depending on if it is root or not:

- out.e('div', ...) | out.t('foo')
- .e('div', ...) || .t('foo')

c) Else, generate one of the following:

- out.beginElement()

*/


const Node = __webpack_require__(0);
const OPTIMIZER_CONTEXT_KEY = Symbol();

const OPTIONS_DEFAULT =             { optimizeTextNodes: true, optimizeStaticNodes: true };
const OPTIONS_OPTIMIZE_TEXT_NODES = { optimizeTextNodes: true, optimizeStaticNodes: false };

class OptimizerContext {
    constructor(context) {
        this.context = context;

        this.nextAttrsId = 0;
        this.nextNodeId = 0;
        this._nextConstIdFunc = null;
    }

    get nextConstIdFunc() {
        let nextConstIdFunc = this._nextConstIdFunc;
        if (!nextConstIdFunc) {
            let context = this.context;
            let builder = context.builder;
            let constId = this.context.helper('const');
            let fingerprintLiteral = builder.literal(context.getFingerprint(6));
            nextConstIdFunc = this._nextConstIdFunc = context.addStaticVar(
                'marko_const_nextId',
                builder.functionCall(constId, [ fingerprintLiteral ]));
        }
        return nextConstIdFunc;
    }
}

class NodeVDOM extends Node {
    constructor(variableIdentifier) {
        super('NodeVDOM');
        this.variableIdentifier = variableIdentifier;
    }

    writeCode(writer) {
        var builder = writer.builder;

        let funcCall = builder.functionCall(
            builder.identifier('n'),
            [
                this.variableIdentifier
            ]);

        if (this.isChild) {
            writer.write('.');
        } else {
            writer.write('out.');
        }

        writer.write(funcCall);
    }
}

function generateNodesForArray(nodes, context, options) {
    let builder = context.builder;

    var optimizerContext = context[OPTIMIZER_CONTEXT_KEY] ||
        (context[OPTIMIZER_CONTEXT_KEY] = new OptimizerContext(context));


    var optimizeStaticNodes = options.optimizeStaticNodes !== false;

    function generateStaticNode(node) {
        if (node.type === 'HtmlElementVDOM') {
            node.createElementId = context.helper('createElement');
        }/* else {
            node.createTextId = context.importModule('marko_createText', 'marko/vdom/createText');
        }*/

        node.nextConstId = builder.functionCall(optimizerContext.nextConstIdFunc, []);

        node.isStaticRoot = true;
        let staticNodeId = context.addStaticVar('marko_node' + (optimizerContext.nextNodeId++), node);

        return new NodeVDOM(staticNodeId);
    }

    function handleStaticAttributes(node) {
        var attributesArg = node.attributesArg;
        if (attributesArg) {
            node.isStaticRoot = true;
            let staticAttrsId = context.addStaticVar('marko_attrs' + (optimizerContext.nextAttrsId++), attributesArg);
            node.attributesArg = staticAttrsId;
        }
    }

    let finalNodes = [];
    let i = 0;

    while (i<nodes.length) {
        let node = nodes[i];
        if (node.type === 'HtmlElementVDOM') {
            if (optimizeStaticNodes) {
                if (node.isStatic) {
                    finalNodes.push(generateStaticNode(node));
                    doOptimizeNode(node, context, OPTIONS_OPTIMIZE_TEXT_NODES);
                } else {
                    if (node.isAttrsStatic) {
                        handleStaticAttributes(node);
                    }

                    finalNodes.push(node);
                }
            } else {
                finalNodes.push(node);
            }

        } else {
            finalNodes.push(node);
        }

        i++;
    }

    return finalNodes;
}

function doOptimizeNode(node, context, options) {
    let walker = context.createWalker({
        enterArray(nodes) {
            return generateNodesForArray(nodes, context, options);
        }
    });

    return walker.walk(node);
}

class VDOMOptimizer {
    optimize(node, context) {
        doOptimizeNode(node, context, OPTIONS_DEFAULT);
    }
}

module.exports = VDOMOptimizer;

/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Literal = __webpack_require__(3);
var Node = __webpack_require__(0);

function isStaticArray(array) {
    for (let i=0; i<array.length; i++) {
        if (!isStaticValue(array[i])) {
            return false;
        }
    }

    return true;
}

function isStaticObject(object) {
    for (var k in object) {
        if (object.hasOwnProperty(k)) {
            let v = object[k];
            if (!isStaticValue(v)) {
                return false;
            }
        }
    }
}

function isStaticValue(value) {
    if (value == null) {
        return true;
    }

    if (value instanceof Node) {
         if (value instanceof Literal) {
             return isStaticValue(value.value);
         } else {
             return false;
         }
    } else {
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return isStaticArray(value);
            } else {
                return isStaticObject(value);
            }
        } else {
            return true;
        }
    }
}

module.exports = isStaticValue;

/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var repeatedRegExp = /\[\]$/;
var componentUtil = __webpack_require__(16);
var attachBubblingEvent = componentUtil.$__attachBubblingEvent;
var extend = __webpack_require__(5);

/**
 * A ComponentDef is used to hold the metadata collected at runtime for
 * a single component and this information is used to instantiate the component
 * later (after the rendered HTML has been added to the DOM)
 */
function ComponentDef(component, componentId, globalComponentsContext, componentStack, componentStackLen) {
    this.$__globalComponentsContext = globalComponentsContext; // The AsyncWriter that this component is associated with
    this.$__componentStack = componentStack;
    this.$__componentStackLen = componentStackLen;
    this.$__component = component;
    this.id = componentId;

    this.$__roots =  null;            // IDs of root elements if there are multiple root elements
    this.$__children = null;          // An array of nested ComponentDef instances
    this.$__domEvents = undefined;         // An array of DOM events that need to be added (in sets of three)

    this.$__isExisting = false;

    this.$__willRerenderInBrowser = false;

    this.$__nextIdIndex = 0; // The unique integer to use for the next scoped ID
}

ComponentDef.prototype = {
    $__end: function() {
        this.$__componentStack.length = this.$__componentStackLen;
    },

    /**
     * Register a nested component for this component. We maintain a tree of components
     * so that we can instantiate nested components before their parents.
     */
    $__addChild: function (componentDef) {
        var children = this.$__children;

        if (children) {
            children.push(componentDef);
        } else {
            this.$__children = [componentDef];
        }
    },
    /**
     * This helper method generates a unique and fully qualified DOM element ID
     * that is unique within the scope of the current component. This method prefixes
     * the the nestedId with the ID of the current component. If nestedId ends
     * with `[]` then it is treated as a repeated ID and we will generate
     * an ID with the current index for the current nestedId.
     * (e.g. "myParentId-foo[0]", "myParentId-foo[1]", etc.)
     */
    elId: function (nestedId) {
        var id = this.id;
        if (nestedId == null) {
            return id;
        } else {
            if (typeof nestedId == 'string' && repeatedRegExp.test(nestedId)) {
                return this.$__globalComponentsContext.$__nextRepeatedId(id, nestedId);
            } else {
                return id + '-' + nestedId;
            }
        }
    },
    /**
     * Registers a DOM event for a nested HTML element associated with the
     * component. This is only done for non-bubbling events that require
     * direct event listeners to be added.
     * @param  {String} type The DOM event type ("mouseover", "mousemove", etc.)
     * @param  {String} targetMethod The name of the method to invoke on the scoped component
     * @param  {String} elId The DOM element ID of the DOM element that the event listener needs to be added too
     */
     e: function(type, targetMethod, elId, extraArgs) {
        if (targetMethod) {
            // The event handler method is allowed to be conditional. At render time if the target
            // method is null then we do not attach any direct event listeners.
            (this.$__domEvents || (this.$__domEvents = [])).push([
                type,
                targetMethod,
                elId,
                extraArgs]);
        }
    },
    /**
     * Returns the next auto generated unique ID for a nested DOM element or nested DOM component
     */
    $__nextComponentId: function() {
        var id = this.id;

        return id === null ?
            this.$__globalComponentsContext.$__nextComponentId(this.$__out) :
            id + '-c' + (this.$__nextIdIndex++);
    },

    d: function(handlerMethodName, extraArgs) {
        return attachBubblingEvent(this, handlerMethodName, extraArgs);
    }
};

ComponentDef.$__deserialize = function(o, types, globals, registry) {
    var id        = o[0];
    var typeName  = types[o[1]];
    var input     = o[2];
    var extra     = o[3];

    var state = extra.s;
    var componentProps = extra.w;

    var component = typeName /* legacy */ && registry.$__createComponent(typeName, id);

    if (extra.b) {
        component.$__bubblingDomEvents = extra.b;
    }

    // Preview newly created component from being queued for update since we area
    // just building it from the server info
    component.$__updateQueued = true;

    if (state) {
        var undefinedPropNames = extra.u;
        if (undefinedPropNames) {
            undefinedPropNames.forEach(function(undefinedPropName) {
                state[undefinedPropName] = undefined;
            });
        }
        // We go through the setter here so that we convert the state object
        // to an instance of `State`
        component.state = state;
    }

    component.$__input = input;

    if (componentProps) {
        extend(component, componentProps);
    }

    var scope = extra.p;
    var customEvents = extra.e;
    if (customEvents) {
        component.$__setCustomEvents(customEvents, scope);
    }

    component.$__global = globals;

    return {
        $__component: component,
        $__roots: extra.r,
        $__domEvents: extra.d,
        $__willRerenderInBrowser: extra._ === 1
    };
};

module.exports = ComponentDef;


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ComponentDef = __webpack_require__(170);
var componentsUtil = __webpack_require__(16);
var isServer = componentsUtil.$__isServer === true;

var EMPTY_OBJECT = {};

function GlobalComponentsContext(out) {
    this.$__roots = [];
    this.$__preserved = EMPTY_OBJECT;
    this.$__preservedBodies = EMPTY_OBJECT;
    this.$__componentsById = {};
    this.$__out = out;
    this.$__rerenderComponent = undefined;
    this.$__nextIdLookup = null;
    this.$__nextComponentId = componentsUtil.$__nextComponentIdProvider(out);
}

GlobalComponentsContext.prototype = {
    $__initComponents: function(doc) {
        var topLevelComponentDefs = null;

        this.$__roots.forEach(function(root) {
            var children = root.$__children;
            if (children) {
                // NOTE: ComponentsContext.$__initClientRendered is provided by
                //       index-browser.js to avoid a circular dependency
                ComponentsContext.$__initClientRendered(children, doc);
                if (topLevelComponentDefs === null) {
                    topLevelComponentDefs = children;
                } else {
                    topLevelComponentDefs = topLevelComponentDefs.concat(children);
                }
            }
        });

        this.$__roots = null;

        // Reset things stored in global since global is retained for
        // future renders
        this.$__out.global.components = undefined;

        return topLevelComponentDefs;
    },
    $__preserveDOMNode: function(elId, bodyOnly) {
        var preserved = bodyOnly === true ? this.$__preservedBodies : this.$__preserved;
        if (preserved === EMPTY_OBJECT) {
            if (bodyOnly === true) {
                preserved = this.$__preservedBodies = {};
            } else {
                preserved = this.$__preserved = {};
            }
        }
        preserved[elId] = true;
    },
    $__nextRepeatedId: function(parentId, id) {
        var nextIdLookup = this.$__nextIdLookup || (this.$__nextIdLookup = {});

        var indexLookupKey = parentId + '-' + id;
        var currentIndex = nextIdLookup[indexLookupKey];
        if (currentIndex == null) {
            currentIndex = nextIdLookup[indexLookupKey] = 0;
        } else {
            currentIndex = ++nextIdLookup[indexLookupKey];
        }

        return indexLookupKey.slice(0, -2) + '[' + currentIndex + ']';
    }
};

function ComponentsContext(out, parentComponentsContext, shouldAddGlobalRoot) {
    var root;

    var globalComponentsContext;

    if (parentComponentsContext === undefined) {
        globalComponentsContext = out.global.components;
        if (globalComponentsContext === undefined) {
            out.global.components = globalComponentsContext = new GlobalComponentsContext(out);
        }

        root = new ComponentDef(null, null, globalComponentsContext);

        if (shouldAddGlobalRoot !== false) {
            globalComponentsContext.$__roots.push(root);
        }
    } else {
        globalComponentsContext = parentComponentsContext.$__globalContext;
        var parentComponentStack = parentComponentsContext.$__componentStack;
        root = parentComponentStack[parentComponentStack.length-1];
    }

    this.$__globalContext = globalComponentsContext;
    this.$__out = out;
    this.$__componentStack = [root];
}

ComponentsContext.prototype = {
    $__createNestedComponentsContext: function(nestedOut) {
        return new ComponentsContext(nestedOut, this);
    },
    $__beginComponent: function(component, isSplitComponent) {
        var componentStack = this.$__componentStack;
        var origLength = componentStack.length;
        var parentComponentDef = componentStack[origLength - 1];

        var componentId = component.id;

        var componentDef = new ComponentDef(component, componentId, this.$__globalContext, componentStack, origLength);
        if (isServer) {
            // On the server
            if (parentComponentDef.$__willRerenderInBrowser === true) {
                componentDef.$__willRerenderInBrowser = true;
            } else {
                parentComponentDef.$__addChild(componentDef);
                if (isSplitComponent === false && this.$__out.global.noBrowserRerender !== true) {
                    componentDef.$__willRerenderInBrowser = true;
                }
            }
        } else {
            parentComponentDef.$__addChild(componentDef);
            this.$__globalContext.$__componentsById[componentId] = componentDef;
        }

        componentStack.push(componentDef);

        return componentDef;
    },

    $__nextComponentId: function() {
        var componentStack = this.$__componentStack;
        var parentComponentDef = componentStack[componentStack.length - 1];
        return parentComponentDef.$__nextComponentId();
    }
};

function getComponentsContext(out) {
    return out.data.components || (out.data.components = new ComponentsContext(out));
}

module.exports = exports = ComponentsContext;

exports.$__getComponentsContext = getComponentsContext;


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class ServerComponent {
    constructor(id, input, out, typeName, customEvents, scope) {
        this.id = id;
        this.$__customEvents = customEvents;
        this.$__scope = scope;
        this.$__updatedInput = undefined;
        this.$__input = undefined;
        this.$__state = undefined;
        this.typeName = typeName;
        this.$__bubblingDomEvents = undefined; // Used to keep track of bubbling DOM events for components rendered on the server
        this.$__bubblingDomEventsExtraArgsCount = 0;

        if (this.onCreate !== undefined) {
            this.onCreate(input, out);
        }

        if (this.onInput !== undefined) {
            var updatedInput = this.onInput(input, out) || input;

            if (this.$__input === undefined) {
                this.$__input = updatedInput;
            }

            this.$__updatedInput = updatedInput;
        } else {
            this.$__input = this.$__updatedInput = input;
        }

        if (this.onRender !== undefined) {
            this.onRender(out);
        }
    }

    set input(newInput) {
        this.$__input = newInput;
    }

    get input() {
        return this.$__input;
    }

    set state(newState) {
        this.$__state = newState;
    }

    get state() {
        return this.$__state;
    }

    get $__rawState() {
        return this.$__state;
    }
}

module.exports = ServerComponent;


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const copyProps = __webpack_require__(34);
const SERVER_WIDGET_KEY = Symbol();
const BaseServerComponent = __webpack_require__(172);

function createServerComponentClass(renderingLogic) {
    var renderingLogicProps = typeof renderingLogic === 'function' ?
        renderingLogic.prototype :
        renderingLogic;

    class ServerComponent extends BaseServerComponent {
    }

    copyProps(renderingLogicProps, ServerComponent.prototype);

    return ServerComponent;
}
function createComponent(renderingLogic, id, input, out, typeName, customEvents, scope) {
    var ServerComponent = renderingLogic[SERVER_WIDGET_KEY];
    if (!ServerComponent) {
        ServerComponent = renderingLogic[SERVER_WIDGET_KEY] = createServerComponentClass(renderingLogic);
    }

    var component = new ServerComponent(id, input, out, typeName, customEvents, scope);
    return component;
}

exports.$__isServer = true;
exports.$__createComponent = createComponent;


/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

var componentsUtil = __webpack_require__(16);
var componentLookup = componentsUtil.$__componentLookup;
var emitLifecycleEvent = componentsUtil.$__emitLifecycleEvent;

var ComponentsContext = __webpack_require__(171);
var getComponentsContext = ComponentsContext.$__getComponentsContext;
var repeatedRegExp = /\[\]$/;
var registry = __webpack_require__(173);
var copyProps = __webpack_require__(34);
var isServer = componentsUtil.$__isServer === true;

var COMPONENT_BEGIN_ASYNC_ADDED_KEY = '$wa';

function resolveComponentKey(globalComponentsContext, key, scope) {
    if (key[0] == '#') {
        return key.substring(1);
    } else {
        var resolvedId;

        if (repeatedRegExp.test(key)) {
            resolvedId = globalComponentsContext.$__nextRepeatedId(scope, key);
        } else {
            resolvedId = scope + '-' + key;
        }

        return resolvedId;
    }
}

function preserveComponentEls(existingComponent, out, globalComponentsContext) {
    var rootEls = existingComponent.$__getRootEls({});

    for (var elId in rootEls) {
        var el = rootEls[elId];

        // We put a placeholder element in the output stream to ensure that the existing
        // DOM node is matched up correctly when using morphdom.
        out.element(el.tagName, { id: elId });

        globalComponentsContext.$__preserveDOMNode(elId); // Mark the element as being preserved (for morphdom)
    }

    existingComponent.$__reset(); // The component is no longer dirty so reset internal flags
    return true;
}

function handleBeginAsync(event) {
    var parentOut = event.parentOut;
    var asyncOut = event.out;
    var componentsContext = parentOut.data.components;

    if (componentsContext !== undefined) {
        // All of the components in this async block should be
        // initialized after the components in the parent. Therefore,
        // we will create a new ComponentsContext for the nested
        // async block and will create a new component stack where the current
        // component in the parent block is the only component in the nested
        // stack (to begin with). This will result in top-level components
        // of the async block being added as children of the component in the
        // parent block.
        var nestedComponentsContext = componentsContext.$__createNestedComponentsContext(asyncOut);
        asyncOut.data.components = nestedComponentsContext;
    }
    // Carry along the component arguments
    asyncOut.$__componentArgs = parentOut.$__componentArgs;
}

function createRendererFunc(templateRenderFunc, componentProps, renderingLogic) {
    renderingLogic = renderingLogic || {};
    var onInput = renderingLogic.onInput;
    var typeName = componentProps.type;
    var roots = componentProps.roots;
    var assignedId = componentProps.id;
    var isSplit = componentProps.split === true;
    var shouldApplySplitMixins = isSplit;

    return function renderer(input, out) {
        var outGlobal = out.global;

        if (out.isSync() === false) {
            if (!outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY]) {
                outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY] = true;
                out.on('beginAsync', handleBeginAsync);
            }
        }

        var componentsContext = getComponentsContext(out);
        var globalComponentsContext = componentsContext.$__globalContext;

        var component = globalComponentsContext.$__rerenderComponent;
        var isRerender = component !== undefined;
        var id = assignedId;
        var isExisting;
        var customEvents;
        var scope;

        if (component) {
            id = component.id;
            isExisting = true;
            globalComponentsContext.$__rerenderComponent = null;
        } else {
            var componentArgs = out.$__componentArgs;

            if (componentArgs) {
                out.$__componentArgs = null;

                scope = componentArgs[0];

                if (scope) {
                    scope = scope.id;
                }

                var key = componentArgs[1];
                if (key != null) {
                    key = key.toString();
                }
                id = id || resolveComponentKey(globalComponentsContext, key, scope);
                customEvents = componentArgs[2];
            }
        }

        id = id || componentsContext.$__nextComponentId();

        if (isServer) {
            component = registry.$__createComponent(
                renderingLogic,
                id,
                input,
                out,
                typeName,
                customEvents,
                scope);
            input = component.$__updatedInput;
            component.$__updatedInput = undefined; // We don't want $__updatedInput to be serialized to the browser
        } else {
            if (!component) {
                if (isRerender) {
                    // Look in in the DOM to see if a component with the same ID and type already exists.
                    component = componentLookup[id];
                    if (component && component.$__type !== typeName) {
                        component = undefined;
                    }
                }

                if (component) {
                    isExisting = true;
                } else {
                    isExisting = false;
                    // We need to create a new instance of the component
                    component = registry.$__createComponent(typeName, id);

                    if (shouldApplySplitMixins === true) {
                        shouldApplySplitMixins = false;

                        var renderingLogicProps = typeof renderingLogic == 'function' ?
                            renderingLogic.prototype :
                            renderingLogic;

                        copyProps(renderingLogicProps, component.constructor.prototype);
                    }
                }

                // Set this flag to prevent the component from being queued for update
                // based on the new input. The component is about to be rerendered
                // so we don't want to queue it up as a result of calling `setInput()`
                component.$__updateQueued = true;

                if (customEvents !== undefined) {
                    component.$__setCustomEvents(customEvents, scope);
                }


                if (isExisting === false) {
                    emitLifecycleEvent(component, 'create', input, out);
                }

                input = component.$__setInput(input, onInput, out);

                if (isExisting === true) {
                    if (component.$__isDirty === false || component.shouldUpdate(input, component.$__state) === false) {
                        preserveComponentEls(component, out, globalComponentsContext);
                        return;
                    }
                }
            }

            component.$__global = outGlobal;

            emitLifecycleEvent(component, 'render', out);
        }

        var componentDef = componentsContext.$__beginComponent(component, isSplit);
        componentDef.$__roots = roots;
        componentDef.$__isExisting = isExisting;

        // Render the template associated with the component using the final template
        // data that we constructed
        templateRenderFunc(input, out, componentDef, component, component.$__rawState);

        componentDef.$__end();
    };
}

module.exports = createRendererFunc;

// exports used by the legacy renderer
createRendererFunc.$__resolveComponentKey = resolveComponentKey;
createRendererFunc.$__preserveComponentEls = preserveComponentEls;
createRendererFunc.$__handleBeginAsync = handleBeginAsync;


/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(30);

const path = __webpack_require__(2);
const resolveFrom = __webpack_require__(21);
const fs = __webpack_require__(8);
const fsReadOptions = { encoding: 'utf8' };
const MARKO_EXTENSIONS = Symbol('MARKO_EXTENSIONS');

function normalizeExtension(extension) {
    if (extension.charAt(0) !== '.') {
        extension = '.' + extension;
    }
    return extension;
}

function compile(templatePath, markoCompiler, compilerOptions) {
    if (compilerOptions) {
        compilerOptions = Object.assign({}, markoCompiler.defaultOptions, compilerOptions);
    } else {
        compilerOptions = markoCompiler.defaultOptions;
    }

    var writeToDisk = compilerOptions.writeToDisk;

    var templateSrc;
    var compiledSrc;

    if (writeToDisk === false) {
        // Don't write the compiled template to disk. Instead, load it
        // directly from the compiled source using the internals of the
        // Node.js module loading system.
        templateSrc = fs.readFileSync(templatePath, fsReadOptions);
        compiledSrc = markoCompiler.compile(templateSrc, templatePath);
    } else {
        var targetFile = templatePath + '.js';

        if (markoCompiler.defaultOptions.assumeUpToDate && fs.existsSync(targetFile)) {
            // If the target file already exists and "assumeUpToDate" then just use the previously
            // compiled template.
            return fs.readFileSync(targetFile, fsReadOptions);
        }

        var targetDir = path.dirname(templatePath);

        var isUpToDate = markoCompiler.checkUpToDate(targetFile);

        if (isUpToDate) {
            compiledSrc = fs.readFileSync(targetFile, fsReadOptions);
        } else {
            templateSrc = fs.readFileSync(templatePath, fsReadOptions);
        	compiledSrc = markoCompiler.compile(templateSrc, templatePath, compilerOptions);

            // Write to a temporary file and move it into place to avoid problems
            // assocatiated with multiple processes write to the same file. We only
            // write the compiled source code to disk so that stack traces will
            // be accurate.
            var filename = path.basename(targetFile);
            var tempFile = path.join(targetDir, '.' + process.pid + '.' + Date.now() + '.' + filename);
            fs.writeFileSync(tempFile, compiledSrc, fsReadOptions);
            fs.renameSync(tempFile, targetFile);
        }
    }

    // We attach a path to the compiled template so that hot reloading will work.
    return compiledSrc;
}

function getLoadedTemplate(path) {
    var cached = __webpack_require__.c[path];
    return cached && cached.exports.render ? cached.exports : undefined;
}

function install(options) {
    options = options || {};

    var requireExtensions = options.require ? // options.require introduced for testing
        options.require.extensions :
        (void 0);

    var compilerOptions = options.compilerOptions;

    if (compilerOptions) {
        __webpack_require__(14).configure(compilerOptions);
    } else {
        compilerOptions = {};
    }

    var extensions = [];

    if (options.extension) {
        extensions.push(options.extension);
    }

    if (options.extensions) {
        extensions = extensions.concat(options.extensions);
    }

    if (extensions.length === 0) {
        extensions.push('.marko');
    }

    function markoRequireExtension(module, filename) {
        var targetFile = filename + '.js';
        var cachedTemplate = getLoadedTemplate(targetFile) || getLoadedTemplate(filename);
        if (cachedTemplate) {
            // The template has already been loaded so use the exports of the already loaded template
            module.exports = cachedTemplate;
            return;
        }

        // Resolve the appropriate compiler relative to the location of the
        // marko template file on disk using the "resolve-from" module.
        var dirname = path.dirname(filename);
        var markoCompilerModulePath = resolveFrom(dirname, 'marko/compiler');
        var markoCompiler = !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());

        // Now use the appropriate Marko compiler to compile the Marko template
        // file to JavaScript source code:
        var compiledSrc = compile(filename, markoCompiler, compilerOptions);

        // Append ".js" to the filename since that is where we write the compiled
        // source code that is being loaded. This allows stack traces to match up.
        module._compile(compiledSrc, targetFile);
    }

    requireExtensions[MARKO_EXTENSIONS] = requireExtensions[MARKO_EXTENSIONS] ||
        (requireExtensions[MARKO_EXTENSIONS] = []);

    extensions.forEach((extension) => {
        extension = normalizeExtension(extension);
        requireExtensions[extension] = markoRequireExtension;
        requireExtensions[MARKO_EXTENSIONS].push(extension);
    });
}

install();

exports.install = install;

exports.getExtensions = function() {
    return (void 0)[MARKO_EXTENSIONS];
};


/***/ }),
/* 176 */
/***/ (function(module, exports) {

module.exports = {
	"_args": [
		[
			{
				"raw": "marko@4.3.1",
				"scope": null,
				"escapedName": "marko",
				"name": "marko",
				"rawSpec": "4.3.1",
				"spec": "4.3.1",
				"type": "version"
			},
			"/home/arthur/Downloads/markoerror"
		]
	],
	"_from": "marko@4.3.1",
	"_id": "marko@4.3.1",
	"_inCache": true,
	"_location": "/marko",
	"_nodeVersion": "7.9.0",
	"_npmOperationalInternal": {
		"host": "packages-12-west.internal.npmjs.com",
		"tmp": "tmp/marko-4.3.1.tgz_1494943538811_0.8558495517354459"
	},
	"_npmUser": {
		"name": "austinkelleher",
		"email": "austin.kell47@gmail.com"
	},
	"_npmVersion": "4.2.0",
	"_phantomChildren": {},
	"_requested": {
		"raw": "marko@4.3.1",
		"scope": null,
		"escapedName": "marko",
		"name": "marko",
		"rawSpec": "4.3.1",
		"spec": "4.3.1",
		"type": "version"
	},
	"_requiredBy": [
		"#USER",
		"/"
	],
	"_resolved": "http://localhost:4873/marko/-/marko-4.3.1.tgz",
	"_shasum": "2ed1c7d35966fc6d3fe7bd99999e4d9840ec6a9d",
	"_shrinkwrap": null,
	"_spec": "marko@4.3.1",
	"_where": "/home/arthur/Downloads/markoerror",
	"author": {
		"name": "Patrick Steele-Idem",
		"email": "pnidem@gmail.com"
	},
	"bin": {
		"markoc": "bin/markoc"
	},
	"browser": {
		"./node-require.js": "./node-require-browser.js"
	},
	"bugs": {
		"url": "https://github.com/marko-js/marko/issues"
	},
	"dependencies": {
		"app-module-path": "^2.2.0",
		"argly": "^1.0.0",
		"browser-refresh-client": "^1.0.0",
		"char-props": "~0.1.5",
		"complain": "^1.0.0",
		"deresolve": "^1.1.2",
		"escodegen": "^1.8.1",
		"esprima": "^3.1.1",
		"estraverse": "^4.2.0",
		"events": "^1.0.2",
		"events-light": "^1.0.0",
		"he": "^1.1.0",
		"htmljs-parser": "^2.3.2",
		"lasso-caching-fs": "^1.0.1",
		"lasso-modules-client": "^2.0.3",
		"lasso-package-root": "^1.0.1",
		"listener-tracker": "^2.0.0",
		"minimatch": "^3.0.2",
		"object-assign": "^4.1.0",
		"property-handlers": "^1.0.0",
		"raptor-async": "^1.1.2",
		"raptor-json": "^1.0.1",
		"raptor-logging": "^1.0.1",
		"raptor-polyfill": "^1.0.0",
		"raptor-promises": "^1.0.1",
		"raptor-regexp": "^1.0.0",
		"raptor-util": "^3.2.0",
		"resolve-from": "^2.0.0",
		"simple-sha1": "^2.1.0",
		"strip-json-comments": "^2.0.1",
		"try-require": "^1.2.1",
		"warp10": "^1.0.0"
	},
	"description": "Marko is an extensible, streaming, asynchronous, high performance, HTML-based templating language that can be used in Node.js or in the browser.",
	"devDependencies": {
		"async": "^2.1.4",
		"benchmark": "^2.1.1",
		"bluebird": "^3.4.7",
		"browser-refresh": "^1.6.0",
		"browser-refresh-taglib": "^1.1.0",
		"chai": "^3.3.0",
		"child-process-promise": "^2.0.3",
		"coveralls": "^2.11.9",
		"express": "^4.13.4",
		"fs-extra": "^2.0.0",
		"ignoring-watcher": "^1.0.2",
		"istanbul-lib-instrument": "^1.3.0",
		"jquery": "^3.1.1",
		"jsdom": "^9.6.0",
		"jshint": "^2.5.0",
		"lasso": "^2.4.1",
		"lasso-marko": "^2.1.0",
		"lasso-resolve-from": "^1.2.0",
		"md5-hex": "^2.0.0",
		"mkdirp": "^0.5.1",
		"mocha": "^3.2.0",
		"mocha-phantomjs-core": "^2.1.1",
		"mocha-phantomjs-istanbul": "0.0.2",
		"nyc": "^10.0.0",
		"open": "0.0.5",
		"phantomjs-prebuilt": "^2.1.13",
		"promise-polyfill": "^6.0.2",
		"request": "^2.72.0",
		"require-self-ref": "^2.0.1",
		"serve-static": "^1.11.1",
		"through": "^2.3.4",
		"through2": "^2.0.1"
	},
	"directories": {},
	"dist": {
		"shasum": "2ed1c7d35966fc6d3fe7bd99999e4d9840ec6a9d",
		"tarball": "http://localhost:4873/marko/-/marko-4.3.1.tgz"
	},
	"gitHead": "3d757a20f39bcb4dc5ae48b4b0d7ed7288e4c407",
	"homepage": "http://markojs.com/",
	"keywords": [
		"templating",
		"template",
		"async",
		"streaming",
		"components",
		"components",
		"ui",
		"vdom",
		"dom",
		"morphdom",
		"virtual",
		"virtual-dom"
	],
	"license": "MIT",
	"logo": {
		"url": "https://raw.githubusercontent.com/marko-js/branding/master/marko-logo-small.png"
	},
	"main": "runtime/index.js",
	"maintainers": [
		{
			"name": "Patrick Steele-Idem",
			"email": "pnidem@gmail.com"
		},
		{
			"name": "Michael Rawlings",
			"email": "ml.rawlings@gmail.com"
		},
		{
			"name": "Phillip Gates-Idem",
			"email": "phillip.idem@gmail.com"
		},
		{
			"name": "Martin Aberer"
		}
	],
	"minprops": {
		"exclude": [
			"$c",
			"b",
			"be",
			"bed",
			"c",
			"ca",
			"d",
			"e",
			"ed",
			"ee",
			"h",
			"id",
			"n",
			"r",
			"sa",
			"t"
		],
		"matchPrefix": "$__"
	},
	"name": "marko",
	"nyc": {
		"exclude": [
			"**/benchmark/**",
			"**/coverage/**",
			"**/test/**"
		]
	},
	"optionalDependencies": {},
	"publishConfig": {
		"registry": "https://registry.npmjs.org/"
	},
	"readme": "<p align=\"center\">\n    <a href=\"http://markojs.com/\"><img src=\"https://raw.githubusercontent.com/marko-js/branding/master/marko-logo-medium-cropped.png\" alt=\"Marko logo\" width=\"300\" /></a><br /><br />\n</p>\n\nMarko is a friendly (and fast!) UI library that makes building web apps fun.\nLearn more on [markojs.com](http://markojs.com/), and even [Try Marko Online!](http://markojs.com/try-online/)\n\n[![Build Status](https://travis-ci.org/marko-js/marko.svg?branch=master)](https://travis-ci.org/marko-js/marko)\n[![Coverage Status](https://coveralls.io/repos/github/marko-js/marko/badge.svg?branch=master&cache-bust=1)](https://coveralls.io/github/marko-js/marko?branch=master)\n[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/marko-js/marko)\n[![NPM](https://img.shields.io/npm/v/marko.svg)](https://www.npmjs.com/package/marko)\n[![Downloads](https://img.shields.io/npm/dm/marko.svg)](http://npm-stat.com/charts.html?package=marko)\n\n# Get Involved\n\n- **Contributing**: Pull requests are welcome!\n    - Read [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) and check out our [bite-sized](https://github.com/marko-js/marko/issues?q=is%3Aissue+is%3Aopen+label%3Adifficulty%3Abite-sized) and [help-wanted](https://github.com/marko-js/marko/issues?q=is%3Aissue+is%3Aopen+label%3Astatus%3Ahelp-wanted) issues\n    - Submit github issues for any feature enhancements, bugs or documentation problems\n- **Support**: Join our [gitter chat](https://gitter.im/marko-js/marko) to ask questions to get support from the maintainers and other Marko developers\n    - Questions/comments can also be posted as [github issues](https://github.com/marko-js/marko/issues)\n- **Discuss**: Tweet using the `#MarkoJS` hashtag and follow [@MarkoDevTeam](https://twitter.com/MarkoDevTeam)\n\n# Installation\n\n```bash\nnpm install marko --save\n```\n\n# Examples\n\nMarko provides an elegant and readable syntax for both single-file components\nand components broken into separate files. There are plenty of examples to play\nwith on [Marko's Try-Online](http://markojs.com/try-online/). Additional\n[component documentation](http://markojs.com/docs/components/) can be found on\nthe Marko.js website.\n\n## Single file\n\nThe following single-file component renders a button and a counter with the\nnumber of times the button has been clicked. [Try this example now!](http://markojs.com/try-online/?file=%2Fcomponents%2Fcomponents%2Fclick-count%2Findex.marko)\n\n__click-count.marko__\n```marko\nclass {\n    onCreate() {\n        this.state = { count:0 };\n    }\n    increment() {\n        this.state.count++;\n    }\n}\n\nstyle {\n    .count {\n        color:#09c;\n        font-size:3em;\n    }\n    .example-button {\n        font-size:1em;\n        padding:0.5em;\n    }\n}\n\n<div.count>\n    ${state.count}\n</div>\n<button.example-button on-click('increment')>\n    Click me!\n</button>\n```\n\n## Multi-file\n\nThe same component as above split into an `index.marko` template file,\n`component.js` containing your component logic, and `style.css` containing your\ncomponent style:\n\n__index.marko__\n```marko\n<div.count>\n    ${state.count}\n</div>\n<button.example-button on-click('increment')>\n    Click me!\n</button>\n```\n\n__component.js__\n```js\nmodule.exports = {\n    onCreate() {\n        this.state = { count:0 };\n    },\n    increment() {\n        this.state.count++;\n    }\n};\n```\n\n__style.css__\n```css\n.count {\n    color:#09c;\n    font-size:3em;\n}\n.example-button {\n    font-size:1em;\n    padding:0.5em;\n}\n```\n\n## Concise Syntax\n\nMarko also support a beautiful concise syntax as an alternative to the HTML\nsyntax. Find out more about the [concise syntax here](http://markojs.com/docs/concise/).\n\n```marko\n<!-- Marko HTML syntax -->\n<ul>\n    <li for(color in ['a', 'b', 'c'])>\n        ${color}\n    </li>\n</ul>\n```\n\n```marko\n// Marko concise syntax\nul\n    li for(color in ['a', 'b', 'c'])\n        -- ${color}\n```\n\n# Changelog\n\nSee [CHANGELOG.md](CHANGELOG.md)\n\n# Maintainers\n\n* [Patrick Steele-Idem](https://github.com/patrick-steele-idem) (Twitter: [@psteeleidem](http://twitter.com/psteeleidem))\n* [Michael Rawlings](https://github.com/mlrawlings) (Twitter: [@mlrawlings](https://twitter.com/mlrawlings))\n* [Phillip Gates-Idem](https://github.com/philidem/) (Twitter: [@philidem](https://twitter.com/philidem))\n* [Austin Kelleher](https://github.com/austinkelleher) (Twitter: [@AustinKelleher](https://twitter.com/AustinKelleher))\n* [Martin Aberer](https://github.com/tindli) (Twitter: [@metaCoffee](https://twitter.com/metaCoffee))\n\n# License\n\nMIT\n",
	"readmeFilename": "README.md",
	"repository": {
		"type": "git",
		"url": "git+https://github.com/marko-js/marko.git"
	},
	"scripts": {
		"coveralls": "nyc report --reporter=text-lcov | coveralls",
		"jshint": "jshint compiler/ runtime/ taglibs/ components/",
		"mocha": "mocha --ui bdd --reporter spec ./test/",
		"test": "npm run jshint -s && npm run mocha -s && npm run test-components -s && npm run test-components-deprecated -s",
		"test-async": "mocha --ui bdd --reporter spec ./test/async-render-test",
		"test-components": "npm run test-components-browser -s && npm run test-components-pages -s",
		"test-components-browser": "node test/browser-tests-runner/cli.js test/components-browser-tests.js --automated",
		"test-components-browser-deprecated": "node test/browser-tests-runner/cli.js test/deprecated-components-browser-tests.js --automated && npm run test-components-pages-deprecated -s",
		"test-components-browser-dev": "browser-refresh test/browser-tests-runner/cli.js test/components-browser-tests.js --server",
		"test-components-deprecated": "npm run test-components-browser-deprecated -s && npm run test-components-pages-deprecated -s",
		"test-components-pages": "node test/browser-tests-runner/cli.js --pages --automated",
		"test-components-pages-deprecated": "node test/browser-tests-runner/cli.js --pagesDeprecated --automated",
		"test-coverage": "npm run test-generate-coverage && nyc report --reporter=html && open ./coverage/index.html",
		"test-express": "mocha --ui bdd --reporter spec ./test/express-test",
		"test-fast": "mocha --ui bdd --reporter spec ./test/render-test",
		"test-generate-coverage": "nyc -asc npm run test",
		"test-page": "node test/browser-tests-runner/cli.js test/components-browser-tests.js --automated --page",
		"test-pages": "npm run test-components-pages",
		"test-taglib-loader": "mocha --ui bdd --reporter spec ./test/taglib-loader-test"
	},
	"version": "4.3.1"
};

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

var domInsert = __webpack_require__(180);

function getComponentDefs(result) {
    var componentDefs = result.$__components;

    if (!componentDefs) {
        throw Error('No component');
    }
    return componentDefs;
}

function RenderResult(out) {
   this.out = this.$__out = out;
   this.$__components = undefined;
}

module.exports = RenderResult;

var proto = RenderResult.prototype = {
    getComponent: function() {
        return this.getComponents()[0];
    },
    getComponents: function(selector) {
        if (this.$__components === undefined) {
            throw Error('Not added to DOM');
        }

        var componentDefs = getComponentDefs(this);

        var components = [];

        componentDefs.forEach(function(componentDef) {
            var component = componentDef.$__component;
            if (!selector || selector(component)) {
                components.push(component);
            }
        });

        return components;
    },

    afterInsert: function(doc) {
        var out = this.$__out;
        var globalComponentsContext = out.global.components;
        if (globalComponentsContext) {
            this.$__components = globalComponentsContext.$__initComponents(doc);
        } else {
            this.$__components = null;
        }

        return this;
    },
    getNode: function(doc) {
        return this.$__out.$__getNode(doc);
    },
    getOutput: function() {
        return this.$__out.$__getOutput();
    },
    toString: function() {
        return this.$__out.toString();
    },
    document: typeof document != 'undefined' && document
};

// Add all of the following DOM methods to Component.prototype:
// - appendTo(referenceEl)
// - replace(referenceEl)
// - replaceChildrenOf(referenceEl)
// - insertBefore(referenceEl)
// - insertAfter(referenceEl)
// - prependTo(referenceEl)
domInsert(
    proto,
    function getEl(renderResult, referenceEl) {
        return renderResult.getNode(referenceEl.ownerDocument);
    },
    function afterInsert(renderResult, referenceEl) {
        return renderResult.afterInsert(referenceEl.ownerDocument);
    });


/***/ }),
/* 178 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 178;

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

var patch = __webpack_require__(57).patch;
var Template = __webpack_require__(32);
patch(Template);


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

var extend = __webpack_require__(5);
var componentsUtil = __webpack_require__(16);
var destroyComponentForEl = componentsUtil.$__destroyComponentForEl;
var destroyElRecursive = componentsUtil.$__destroyElRecursive;

function resolveEl(el) {
    if (typeof el == 'string') {
        var elId = el;
        el = document.getElementById(elId);
        if (!el) {
            throw Error('Not found: ' + elId);
        }
    }
    return el;
}

function beforeRemove(referenceEl) {
    destroyElRecursive(referenceEl);
    destroyComponentForEl(referenceEl);
}

module.exports = function(target, getEl, afterInsert) {
    extend(target, {
        appendTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        prependTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.insertBefore(el, referenceEl.firstChild || null);
            return afterInsert(this, referenceEl);
        },
        replace: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            beforeRemove(referenceEl);
            referenceEl.parentNode.replaceChild(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        replaceChildrenOf: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);

            var curChild = referenceEl.firstChild;
            while(curChild) {
                var nextSibling = curChild.nextSibling; // Just in case the DOM changes while removing
                if (curChild.nodeType == 1) {
                    beforeRemove(curChild);
                }
                curChild = nextSibling;
            }

            referenceEl.innerHTML = '';
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        insertBefore: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.parentNode.insertBefore(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        insertAfter: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            el = el;
            var nextSibling = referenceEl.nextSibling;
            var parentNode = referenceEl.parentNode;
            if (nextSibling) {
                parentNode.insertBefore(el, nextSibling);
            } else {
                parentNode.appendChild(el);
            }
            return afterInsert(this, referenceEl);
        }
    });
};


/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(68);
module.exports = new EventEmitter();

/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isArray = Array.isArray;

function isFunction(arg) {
    return typeof arg == 'function';
}

function classList(arg, classNames) {
    var len;

    if (arg) {
        if (typeof arg == 'string') {
            if (arg) {
                classNames.push(arg);
            }
        } else if (typeof (len = arg.length) == 'number') {
            for (var i=0; i<len; i++) {
                classList(arg[i], classNames);
            }
        } else if (typeof arg == 'object') {
            for (var name in arg) {
                if (arg.hasOwnProperty(name)) {
                    var value = arg[name];
                    if (value) {
                        classNames.push(name);
                    }
                }
            }
        }
    }
}

function createDeferredRenderer(handler) {
    function deferredRenderer(input, out) {
        deferredRenderer.renderer(input, out);
    }

    // This is the initial function that will do the rendering. We replace
    // the renderer with the actual renderer func on the first render
    deferredRenderer.renderer = function(input, out) {
        var rendererFunc = handler.renderer || handler._ || handler.render;
        if (!isFunction(rendererFunc)) {
            throw Error('Invalid renderer');
        }
        // Use the actual renderer from now on
        deferredRenderer.renderer = rendererFunc;
        rendererFunc(input, out);
    };

    return deferredRenderer;
}

function resolveRenderer(handler) {
    var renderer = handler.renderer || handler._;

    if (renderer) {
        return renderer;
    }

    if (isFunction(handler)) {
        return handler;
    }

    // If the user code has a circular function then the renderer function
    // may not be available on the module. Since we can't get a reference
    // to the actual renderer(input, out) function right now we lazily
    // try to get access to it later.
    return createDeferredRenderer(handler);
}

/**
 * Internal helper method to prevent null/undefined from being written out
 * when writing text that resolves to null/undefined
 * @private
 */
exports.s = function strHelper(str) {
    return (str == null) ? '' : str.toString();
};

/**
 * Internal helper method to handle loops without a status variable
 * @private
 */
exports.f = function forEachHelper(array, callback) {
    if (isArray(array)) {
        for (var i=0; i<array.length; i++) {
            callback(array[i]);
        }
    } else if (isFunction(array)) {
        // Also allow the first argument to be a custom iterator function
        array(callback);
    }
};

/**
 * Helper to load a custom tag
 */
exports.t = function loadTagHelper(renderer, targetProperty, isRepeated) {
    if (renderer) {
        renderer = resolveRenderer(renderer);
    }

    return renderer;
};

/**
 * classList(a, b, c, ...)
 * Joines a list of class names with spaces. Empty class names are omitted.
 *
 * classList('a', undefined, 'b') --> 'a b'
 *
 */
exports.cl = function classListHelper() {
    var classNames = [];
    classList(arguments, classNames);
    return classNames.join(' ');
};


/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Simple wrapper that can be used to wrap a stream
 * to reduce the number of write calls. In Node.js world,
 * each stream.write() becomes a chunk. We can avoid overhead
 * by reducing the number of chunks by buffering the output.
 */
function BufferedWriter(wrappedStream) {
    this._buffer = '';
    this._wrapped = wrappedStream;
}

BufferedWriter.prototype = {
    write: function(str) {
        this._buffer += str;
    },

    flush: function() {
        if (this._buffer.length !== 0) {
            this._wrapped.write(this._buffer);
            this._buffer = '';
            if (this._wrapped.flush) {
                this._wrapped.flush();
            }
        }
    },

    end: function() {
        this.flush();
        if (!this._wrapped.isTTY) {
            this._wrapped.end();
        }
    },

    clear: function() {
        this._buffer = '';
    }
};

module.exports = BufferedWriter;

/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function StringWriter() {
    this.str = '';
}

StringWriter.prototype = {
    write: function(str) {
        this.str += str;
        return this;
    },

    /**
     * Converts the string buffer into a String.
     *
     * @returns {String} The built String
     */
    toString: function() {
        return this.str;
    }
};

module.exports = StringWriter;

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(30); // no-op in the browser, but enables extra features on the server

exports.createOut = __webpack_require__(29);
exports.load = __webpack_require__(187);
exports.events = __webpack_require__(181);

/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var nodePath = __webpack_require__(2);
var fs = __webpack_require__(8);
var Module = __webpack_require__(72).Module;
var compilerPath = nodePath.join(__dirname, '../../compiler');
var markoCompiler = !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
var cwd = process.cwd();
var fsOptions = {encoding: 'utf8'};

module.exports = function load(templatePath, templateSrc, options) {
    if (typeof templatePath === 'string' && nodePath.extname(templatePath) === '.js') {
        // assume compiled template
        return !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
    }

    if (arguments.length === 1) {
        return doLoad(templatePath);
    } else if (arguments.length === 2) {
        // see if second argument is templateSrc (a String)
        // or options (an Object)
        var lastArg = arguments[arguments.length - 1];
        if (typeof lastArg === 'string') {
            return doLoad(templatePath, templateSrc);
        } else {
            var finalOptions = templateSrc;
            return doLoad(templatePath, null, finalOptions);
        }
    } else if (arguments.length === 3) {
        // assume function called according to function signature
        return doLoad(templatePath, templateSrc, options);
    } else {
        throw new Error('Illegal arguments');
    }
};

function loadSource(templatePath, compiledSrc) {
    templatePath += '.js';

    // Short-circuit loading if the template has already been cached in the Node.js require cache
    var cached = __webpack_require__.c[templatePath];
    if (cached) {
        return cached.exports;
    }

    var templateModule = new Module(templatePath, module);
    templateModule.paths = Module._nodeModulePaths(nodePath.dirname(templatePath));
    templateModule.filename = templatePath;

    Module._cache[templatePath] = templateModule;

    templateModule._compile(
        compiledSrc,
        templatePath);

    return templateModule.exports;
}

function getCachedTemplate(path) {
    var cached = __webpack_require__.c[path];
    return cached && cached.exports.render ? cached.exports : undefined;
}

/**
 * This helper function will check the Node.js require cache for the previous
 * loaded template and it will also check the disk for the compiled template
 * if `options.assumeUpToDate` is true

 * @param  {String} templatePath The fully resolved path to the template
 * @param  {Object} options      The options for the template
 * @return {Template}            The loaded template or undefined
 */
function getPreviousTemplate(templatePath, options) {
    /*
    The require.cache is search in the following order:
    1) /path/to/my-template.js
    2) /path/to/my-template.marko.js
    3) /path/to/my-template.marko
     *
    If the template is not found in require.cache and `assumeUpToDate` is true
    then we will check the disk for the precompiled templates in the following
    order:
    1) /path/to/my-template.js
    2) /path/to/my-template.marko.js
    */
    var ext = nodePath.extname(templatePath);
    var targetFilePrecompiled = templatePath.slice(0, 0 - ext.length) + '.js';
    var targetFileDebug = templatePath + '.js';

    // Short-circuit loading if the template has already been cached in the Node.js require cache
    var cachedTemplate =
        getCachedTemplate(targetFilePrecompiled) ||
        getCachedTemplate(targetFileDebug) ||
        getCachedTemplate(templatePath);

    if (cachedTemplate) {
        return cachedTemplate;
    }

    // Just in case the the path wasn't a fully resolved file system path...
    templatePath = nodePath.resolve(cwd, templatePath);

    if (options.assumeUpToDate) {
        if (fs.existsSync(targetFilePrecompiled)) {
            return !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
        }

        if (fs.existsSync(targetFileDebug)) {
            return !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
        }
    }

    return undefined;
}

function createRenderProxy(template) {
    return function(data, out) {
        template._(data, out);
    };
}

function doLoad(templatePath, templateSrc, options) {
    options = Object.assign({}, markoCompiler.defaultOptions, options);

    var template;
    if (typeof templatePath.render === 'function') {
        template = templatePath;
    } else {
        templatePath = nodePath.resolve(cwd, templatePath);

        template = getPreviousTemplate(templatePath, options);
        if (!template) {
            var writeToDisk = options.writeToDisk;

            if (templateSrc == null) {
                templateSrc = fs.readFileSync(templatePath, fsOptions);
            }

            var compiledSrc = markoCompiler.compile(templateSrc, templatePath, options);

            if (writeToDisk === true) {
                var targetFile = templatePath + '.js';
                fs.writeFileSync(targetFile, compiledSrc, fsOptions);
            }

            template = loadSource(templatePath, compiledSrc);
        }
    }

    if (options.buffer === false) {
        var Template = template.constructor;

        template = new Template(
            template.path,
            createRenderProxy(template),
            options);
    }

    return template;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(193)(module)))

/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

if (process.env.BUNDLE) {
    // you cannot load templates dynamically within a bundle
    // all templates should be pre-compiled as part of the bundle
    module.exports = function(){};
} else {
    module.exports = __webpack_require__(186);
}

/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

var defaultCreateOut = __webpack_require__(29);
var extend = __webpack_require__(5);

function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
    try {
        renderFunc(finalData, finalOut);

        if (shouldEnd) {
            finalOut.end();
        }
    } catch(err) {
        var actualEnd = finalOut.end;
        finalOut.end = function() {};

        setTimeout(function() {
            finalOut.end = actualEnd;
            finalOut.error(err);
        }, 0);
    }
    return finalOut;
}

module.exports = function(target, renderer) {
    var renderFunc = renderer && (renderer.renderer || renderer.render || renderer);
    var createOut = target.createOut || renderer.createOut || defaultCreateOut;

    return extend(target, {
        createOut: createOut,

        renderToString: function(data, callback) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            if (callback) {
                out.on('finish', function() {
                       callback(null, out.toString(), out);
                   })
                   .once('error', callback);

                return safeRender(render, localData, out, true);
            } else {
                out.sync();
                render(localData, out);
                return out.toString();
            }
        },

        renderSync: function(data) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);
            out.sync();

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            render(localData, out);
            return out.$__getResult();
        },

        /**
         * Renders a template to either a stream (if the last
         * argument is a Stream instance) or
         * provides the output to a callback function (if the last
         * argument is a Function).
         *
         * Supported signatures:
         *
         * render(data)
         * render(data, out)
         * render(data, stream)
         * render(data, callback)
         *
         * @param  {Object} data The view model data for the template
         * @param  {AsyncStream/AsyncVDOMBuilder} out A Stream, an AsyncStream/AsyncVDOMBuilder instance, or a callback function
         * @return {AsyncStream/AsyncVDOMBuilder} Returns the AsyncStream/AsyncVDOMBuilder instance that the template is rendered to
         */
        render: function(data, out) {
            var callback;
            var finalOut;
            var finalData;
            var globalData;
            var render = renderFunc || this._;
            var shouldBuffer = this.$__shouldBuffer;
            var shouldEnd = true;

            if (data) {
                finalData = data;
                if ((globalData = data.$global)) {
                    finalData.$global = undefined;
                }
            } else {
                finalData = {};
            }

            if (out && out.$__isOut) {
                finalOut = out;
                shouldEnd = false;
                extend(out.global, globalData);
            } else if (typeof out == 'function') {
                finalOut = createOut(globalData);
                callback = out;
            } else {
                finalOut = createOut(
                    globalData, // global
                    out, // writer(AsyncStream) or parentNode(AsyncVDOMBuilder)
                    null, // state
                    shouldBuffer // ignored by AsyncVDOMBuilder
                );
            }

            if (callback) {
                finalOut
                    .on('finish', function() {
                        callback(null, finalOut.$__getResult());
                    })
                    .once('error', callback);
            }

            globalData = finalOut.global;

            globalData.template = globalData.template || this;

            return safeRender(render, finalData, finalOut, shouldEnd);
        }
    });
};


/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
This module is used to monkey patch `Template.prototype` to add a new `stream(templateData)` method. Since
this module is likely not needed in the browser, we have split out the code into a separate module. This module
is always loaded on the server, but if you need streaming in the browser you must add the following
line to your app:

    require('marko/stream');

*/
var stream = __webpack_require__(206);
var Template = __webpack_require__(32);
var AsyncStream = __webpack_require__(31);

function Readable(template, data, options) {
   Readable.$super.call(this);
   this._t = template;
   this._d = data;
   this._shouldBuffer = !options || options.shouldBuffer !== false;
   this._rendered = false;
}

Readable.prototype = {
   write: function(data) {
       if (data != null) {
           this.push(data);
       }
   },
   end: function() {
       this.push(null);
   },
   _read: function() {
       if (this._rendered) {
           return;
       }

       this._rendered = true;

       var template = this._t;
       var data = this._d;
       var globalData = data && data.$global;
       var shouldBuffer = this._shouldBuffer;
       var out = new AsyncStream(globalData, this, null, shouldBuffer);
       template.render(data, out);
       out.end();
   }
};

__webpack_require__(191)(Readable, stream.Readable);

Template.prototype.stream = function(data) {
    return new Readable(this, data, this._options);
};

/***/ }),
/* 190 */
/***/ (function(module, exports) {

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix, position) {
        var str = this;
        
        if (position) {
            str = str.substring(position);
        }
        
        if (str.length < suffix.length) {
            return false;
        }
        
        return str.slice(0 - suffix.length) == suffix;
    };
}

/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

var copyProps = __webpack_require__(34);

function inherit(ctor, superCtor, shouldCopyProps) {
    var oldProto = ctor.prototype;
    var newProto = ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            writable: true,
            configurable: true
        }
    });
    if (oldProto && shouldCopyProps !== false) {
        copyProps(oldProto, newProto);
    }
    ctor.$super = superCtor;
    ctor.prototype = newProto;
    return ctor;
}


module.exports = inherit;
inherit._inherit = inherit;


/***/ }),
/* 192 */
/***/ (function(module, exports) {

module.exports = function isObjectEmpty(o) {
    if (!o) {
        return true;
    }
    
    for (var k in o) {
        if (o.hasOwnProperty(k)) {
            return false;
        }
    }
    return true;
};

/***/ }),
/* 193 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 194 */
/***/ (function(module, exports) {

module.exports = require("browser-refresh-client");

/***/ }),
/* 195 */
/***/ (function(module, exports) {

module.exports = require("char-props");

/***/ }),
/* 196 */
/***/ (function(module, exports) {

module.exports = require("complain");

/***/ }),
/* 197 */
/***/ (function(module, exports) {

module.exports = require("deresolve");

/***/ }),
/* 198 */
/***/ (function(module, exports) {

module.exports = require("esprima");

/***/ }),
/* 199 */
/***/ (function(module, exports) {

module.exports = require("he");

/***/ }),
/* 200 */
/***/ (function(module, exports) {

module.exports = require("htmljs-parser");

/***/ }),
/* 201 */
/***/ (function(module, exports) {

module.exports = require("koa");

/***/ }),
/* 202 */
/***/ (function(module, exports) {

module.exports = require("koa-router");

/***/ }),
/* 203 */
/***/ (function(module, exports) {

module.exports = require("koa-static");

/***/ }),
/* 204 */
/***/ (function(module, exports) {

module.exports = require("raptor-regexp");

/***/ }),
/* 205 */
/***/ (function(module, exports) {

module.exports = require("simple-sha1");

/***/ }),
/* 206 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 207 */
/***/ (function(module, exports) {

module.exports = require("try-require");

/***/ }),
/* 208 */
/***/ (function(module, exports) {

module.exports = require("warp10");

/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(74);
module.exports = __webpack_require__(73);


/***/ })
/******/ ]);
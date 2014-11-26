ASTVisitor = function() { }

ASTVisitor.prototype = {
    constructor: ASTVisitor,

    // Public

    // Subclasses should override this to plug in their overridden visit methods.
    visitorForType: function(type)
    {
        if (type in ASTVisitor.DefaultCallbacks)
            return ASTVisitor.DefaultCallbacks[type];

        return this.defaultVisitor;
    },

    visitNode: function(node)
    {
        if (!node || !node.type)
            return;

        var callback = this.visitorForType(node.type);
        return callback.call(this, node);
    },

    visitList: function(nodeList)
    {
        if (!(nodeList instanceof Array) || !nodeList.length)
            return;

        var result = [];
        for (var i = 0; i < nodeList.length; ++i)
            result.push(this.visitNode(nodeList[i]));

        return result;
    },

    defaultVisitor: function(node)
    {
        for (var key in node) {
            var val = node[key];
            if (val instanceof Array)
                this.visitList(val);
            else if (val instanceof Object && val.type)
                this.visitNode(val);
        }
    }
};

module.exports = ASTVisitor;

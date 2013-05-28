/*
 * File: hilite.js
 * Prerequisites: protoype.js
 */
/**
 * Class to highlight specific keywords in a node and its child nodes
 *
 * Synopsis:
 *
 *   var hiliter = new KeywordHiliter("keywords.php", document.body);
 *   hiliter.execute();
 *
 * @version 1.0
 * @author Joris Verbogt <joris@ph8.nl>
 * @copyright &copy; Mangrove 2007
 */
var KeywordHiliter = Class.create();
KeywordHiliter.prototype = {
  /**
   * @param String The Url to connect to to fetch the keywords
   * @param Element The Element and its children to search for keywords
   */
  initialize: function(url,el) {
    this.url = url;
    this.el = el;
  },
  /**
   * Hilite a specific node, i.e., turn it into an abbreviation
   *
   * @param Node The node to highlight
   * @param RegExp The Expression to search for
   * @return The highlighted node, if matched
   */
  hiliteNode: function(node,matchRegExp) {
      var match = matchRegExp.exec(node.data);
      if (match) {
          var theNode = node.splitText(match.index);
          theNode.splitText(match[0].length);
          var spanNode = node.ownerDocument.createElement('ABBR');
          spanNode.title = this.keywords[match[0].toLowerCase()];
          node.parentNode.replaceChild(spanNode, theNode);
          spanNode.appendChild(theNode);
          return spanNode;
      } else {
          return node;
      }
  },
  /**
   * Fetch the keywords and their descriptions from the Url
   */
  fetchKeywords : function() {
    new Ajax.Request(this.url, {
      method: 'post',
      postBody: 'action=getKeywords',
      onSuccess: this._handleFetchKeywords.bind(this)
    });
  },
  /**
   * Set the keywords to the result of the Ajax request
   */
  _handleFetchKeywords: function(transport, json) {
    if (json) {
      this.keywords = json;
    } else {
      this.keywords = eval('(' + transport.responseText + ')');
    }
    this.execute();
  },
  /**
   * Find the keywords and highlight the nodes
   */
  execute: function() {
    if (!this.keywords || this.el.childNodes.length == 0) {
      return;
    }
    var keywordsRegExp = new RegExp($H(this.keywords).keys().join("|"), "i");

    var skipElementsRegExp = /^(script|style|textarea|pre|a)/i;
    var node = this.el.childNodes[0];
    var depth = 1;

    while (node && depth > 0) {
        if (node.nodeType == 1) { // ELEMENT_NODE
            if (!skipElementsRegExp.test(node.tagName) && node.childNodes.length > 0) {
                node = node.childNodes[0];
                depth++;
                continue;
            }
        } else if (node.nodeType == 3) { // TEXT_NODE
            node = this.hiliteNode(node,keywordsRegExp);
        }
        while (!node.nextSibling && depth > 0) {
            node = node.parentNode;
            depth --;
        }
        if (node.nextSibling) {
            node = node.nextSibling;
        }
    }
  }
}
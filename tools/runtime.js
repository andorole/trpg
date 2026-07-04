/*
 * Claude Design の x-dc テンプレート（sc-if / sc-for / {{ 変数 }} / onClick）を
 * そのまま解釈して描画するミニランタイム。support.js（React ベースのプレビュー用）の代替。
 * 状態変更のたびにテンプレート全体を再構築する（プロトタイプの再レンダーと同等）。
 */
(function () {
  var cache = new Map();
  function compile(expr) {
    var fn = cache.get(expr);
    if (!fn) {
      fn = new Function('__s', 'with(__s){return(' + expr + ');}');
      cache.set(expr, fn);
    }
    return fn;
  }
  function evalExpr(expr, scope) {
    return compile(expr)(scope);
  }
  // "{{ expr }}" 単体の属性値から式を取り出す
  function single(text) {
    var m = /^\s*\{\{\s*([\s\S]+?)\s*\}\}\s*$/.exec(text || '');
    return m ? m[1] : null;
  }
  function interpolate(text, scope) {
    if (text.indexOf('{{') === -1) return text;
    return text.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, function (_, expr) {
      var v = evalExpr(expr, scope);
      return v == null ? '' : String(v);
    });
  }
  function build(nodes, scope, parent) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        parent.appendChild(document.createTextNode(interpolate(node.nodeValue, scope)));
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      var tag = node.localName;
      if (tag === 'sc-if') {
        var cond = single(node.getAttribute('value'));
        if (cond && evalExpr(cond, scope)) build(node.childNodes, scope, parent);
        continue;
      }
      if (tag === 'sc-for') {
        var listExpr = single(node.getAttribute('list'));
        var as = node.getAttribute('as') || 'item';
        var list = (listExpr && evalExpr(listExpr, scope)) || [];
        for (var j = 0; j < list.length; j++) {
          var child = Object.assign({}, scope);
          child[as] = list[j];
          build(node.childNodes, child, parent);
        }
        continue;
      }
      var el = document.createElementNS(node.namespaceURI, tag);
      for (var k = 0; k < node.attributes.length; k++) {
        var attr = node.attributes[k];
        if (attr.name.indexOf('hint-placeholder') === 0) continue;
        if (attr.name === 'onclick') {
          var handlerExpr = single(attr.value);
          var fn = handlerExpr ? evalExpr(handlerExpr, scope) : null;
          if (typeof fn === 'function') el.addEventListener('click', fn);
          continue;
        }
        el.setAttribute(attr.name, interpolate(attr.value, scope));
      }
      build(node.childNodes, scope, el);
      parent.appendChild(el);
    }
  }
  window.DCLogic = class DCLogic {
    mount(rootEl, templateEl) {
      this._root = rootEl;
      this._tpl = templateEl.content;
      this.render();
    }
    setState(update) {
      var patch = typeof update === 'function' ? update(this.state) : update;
      Object.assign(this.state, patch);
      this.render();
    }
    render() {
      var scope = this.renderVals();
      var frag = document.createDocumentFragment();
      build(this._tpl.childNodes, scope, frag);
      this._root.replaceChildren(frag);
    }
  };
})();

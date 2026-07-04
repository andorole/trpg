/*
 * 全作品共通のゲームエンジン。ダイス・d20判定・localStorage 永続化と、
 * シェル（DCLogic コンポーネント）へのゲーム状態の合流（attach）を担う。
 * 作品ごとの中身（シナリオ・画面の値）は games/<id>.game.js が window.__GAME__ に定義する。
 */
(function () {
  function rollDie(sides) {
    return 1 + Math.floor(Math.random() * sides);
  }
  function pickKeys(obj, keys) {
    var o = {};
    for (var i = 0; i < keys.length; i++) o[keys[i]] = obj[keys[i]];
    return o;
  }
  window.GameEngine = {
    rollDie: rollDie,
    clamp: function (v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    },
    // d20 判定。20 は大成功、1 は大失敗（出目優先）
    check: function (mod, dc) {
      var die = rollDie(20);
      var total = die + mod;
      var outcome = die === 20 ? 'crit' : die === 1 ? 'fumble' : total >= dc ? 'success' : 'fail';
      return { die: die, mod: mod, total: total, dc: dc, outcome: outcome, ok: outcome === 'crit' || outcome === 'success' };
    },
    outcomeText: function (outcome) {
      return { crit: '大成功', success: '成功', fail: '失敗', fumble: '大失敗' }[outcome] || '';
    },
    attach: function (app, game) {
      var key = 'trpg-game-' + game.id;
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
      Object.assign(app.state, game.initialState(), saved || {});
      if (game.migrate) game.migrate(app.state);
      var baseRenderVals = app.renderVals.bind(app);
      app.renderVals = function () {
        var vals = baseRenderVals();
        return Object.assign(vals, game.vals(app, vals));
      };
      var baseSetState = app.setState.bind(app);
      app.setState = function (update) {
        baseSetState(update);
        try { localStorage.setItem(key, JSON.stringify(pickKeys(app.state, game.persist))); } catch (e) {}
      };
      // ゲーム状態のみ初期値へ戻す（device / play / screen は保持）
      app._resetGame = function () {
        try { localStorage.removeItem(key); } catch (e) {}
        Object.assign(app.state, game.initialState());
        app.render();
      };
    },
  };
})();

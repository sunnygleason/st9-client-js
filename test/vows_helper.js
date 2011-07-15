
var assert  = require('assert');

function add_test(suite, name, todo, validate) {
  var t = {};
  t[name] = { topic : todo, 'result must match' : validate };
  suite.addBatch(t);
}

exports.add_test = add_test;

function add_n_tests(suite, n, name_gen, todo_gen, validate_gen) {
  for (var i = 1; i <= n; i++) {
    add_test(suite, name_gen(i), todo_gen(i), validate_gen(i));
  }
}

exports.add_n_tests = add_n_tests;

function r_eq(code, body, reason) {
	return function(a, s) {
      assert.equal(a.status, code);
      assert.deepEqual(a.body, body);
      assert.equal(a.reason, reason);
	};
}

exports.r_eq = r_eq;

function r_like(code, some_body, reason) {
	return function(a, s) {
      assert.equal(a.status, code);
      for (k in some_body) {
        assert.deepEqual(a.body[k], some_body[k]);
      }
      assert.equal(a.reason, reason);
	};
}

exports.r_like = r_like;

function make_test(name, todo, validate) {
  return { name: name, f : todo, v : validate };
}

// make_test : not exported
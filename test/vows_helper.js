
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
      if (a.body != null && body != null) {
        assert.deepEqual(a.body, body);
      }
      assert.equal(a.reason, reason);
      assert.equal(a.status, code);
	};
}

exports.r_eq = r_eq;

function r_like(code, some_body, reason) {
  return function(a, s) {
    if (a.body == null && some_body == null) {
      // ok, same
    } else {
      for (k in some_body) {
        assert.deepEqual(a.body[k], some_body[k]);
      }
    }
    if (reason) {
      assert.equal(a.reason, reason);
    }
    assert.equal(a.status, code);
  };
}

exports.r_like = r_like;

function r_like_multi(code, body, reason) {
	return function(a, s) {
      var actual = a.body.split("\n");
      var expected = body.split("\n");
      assert.equal(actual.length, expected.length);

      for (var i = 0; i < actual.length; i++) {
          if (actual[i] == "") {
              continue;
          }
          var aJson = JSON.parse(actual[i]);
          var eJson = JSON.parse(expected[i]);
          var tryJson = {};

          for (k in eJson) {
            tryJson[k] = aJson[k];
          }

          assert.equal(expected[i], JSON.stringify(tryJson));
      }

      assert.equal(a.reason, reason);
      assert.equal(a.status, code);
	};
}

exports.r_like_multi = r_like_multi;

function make_test(name, todo, validate) {
  return { name: name, f : todo, v : validate };
}

// make_test : not exported
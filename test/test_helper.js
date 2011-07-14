
var assert  = require('assert');

function make_test(name, todo, validate) {
  return { name: name, f : todo, v : validate };
}

exports.make_test = make_test;

function r_eq(code, body, reason) {
	return function(a) {
      assert.equal(a.status, code);
      assert.deepEqual(a.body, body);
      assert.equal(a.reason, reason);
	};
}

exports.r_eq = r_eq;

function r_like(code, some_body, reason) {
	return function(a) {
      assert.equal(a.status, code);
      for (k in some_body) {
        assert.deepEqual(a.body[k], some_body[k]);
      }
      assert.equal(a.reason, reason);
	};
}

exports.r_like = r_like;

function fold_tasks(alist, accum, cc) {
  var next = alist.shift();
  if (!next) {
    if (cc) {
	  cc(accum);
    }
    return;
  }

  console.log("executing: " + next.name);
  return next.f(function(ret){
	  accum.push(ret);
	  if (next.v) {
        next.v(ret);
	  }
	  fold_tasks(alist, accum, cc);
	}, accum[accum.length - 1]);
}

exports.fold_tasks = fold_tasks;
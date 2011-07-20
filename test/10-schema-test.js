
var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var client  = new st9.St9Client('localhost', 7331);
var s = vows.describe('st9 entity tests');

function point0() { return test_schema.point_schema(true, true); }
function point1() { return test_schema.point_schema(true, false); }
function point2() { return test_schema.point_schema(false, true); }

function awesome0() { return test_schema.awesome_schema(true, true); }
function awesome1() { return test_schema.awesome_schema(true, false); }
function awesome2() { return test_schema.awesome_schema(false, true); }

function all0() { return test_schema.alltypes_schema(); }

function inc(x, f, d) {
  var v = x[f];
  if ((typeof v === 'string') || v instanceof String) {
    // this is a special-case hack just to inc/dec maximum long integers;
    // it is not a real addition function!!!
    var c = parseInt(new String(v[v.length - 1]));
    c += ((v[0] == '-') ? -d : d);
    x[f] = v.substring(0, v.length - 1) + c.toString();
  } else {
    x[f] = v + d;
  }

  return x;
}

h.add_test(s, 'nuke[0]', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

[point0, point1, point2].forEach(function(x) {
	h.add_test(s, 'schema_create_' + x.name, function() { client.schema_create(x.name, x(), this.callback); }, h.r_like(200, x(), null));

	h.add_n_tests(s, 10,
	  function(i) { return 'entity_create_' + x.name + '[' + i + ']' },
	  function(i) { return function() { client.entity_create(x.name, {x:i,y:-i}, this.callback); } },
	  function(i) { return h.r_like(200, {kind:x.name, version:1, x:i, y:-i}, null) }
	);
	
	h.add_n_tests(s, 10,
	  function(i) { return 'entity_delete_' + x.name + '[' + i + ']' },
	  function(i) { return function() { client.entity_delete(x.name + ":" + i, this.callback); } },
	  function(i) { return h.r_like(200, null, null) }
	);
});

[awesome0, awesome1, awesome2].forEach(function(x) {
	h.add_test(s, 'schema_create_' + x.name, function() { client.schema_create(x.name, x(), this.callback); }, h.r_like(200, x(), null));

	h.add_n_tests(s, 10,
	  function(i) { return 'entity_create_' + x.name + '[' + i + ']' },
	  function(i) { return function() { client.entity_create(x.name, {isAwesome:(i % 2 == 0)}, this.callback); } },
	  function(i) { return h.r_like(200, {isAwesome:(i % 2 == 0)}, null) }
	);

	h.add_n_tests(s, 10,
	  function(i) { return 'entity_delete_' + x.name + '[' + i + ']' },
	  function(i) { return function() { client.entity_delete(x.name + ":" + i, this.callback); } },
	  function(i) { return h.r_like(200, null, null) }
	);
});

h.add_test(s, 'schema_create[6]', function() { client.schema_create('all0', all0(), this.callback); }, h.r_like(200, all0(), null));

h.add_n_tests(s, 10,
  function(i) { return 'entity_create_all0[' + i + ']' },
  function(i) { return function() { client.entity_create('all0', test_schema.make_alltypes_max(), this.callback); } },
  function(i) { return h.r_like(200, test_schema.make_alltypes_max(), null) }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_create_all0[' + i + ']' },
  function(i) { return function() { client.entity_create('all0', test_schema.make_alltypes_min(), this.callback); } },
  function(i) { return h.r_like(200, test_schema.make_alltypes_min(), null) }
);

['u1','u2','u4','u8','i1','i2','i4','i8'].forEach(function(x) {
  h.add_test(s, 'schema_create_all0_max_' + x, function() { client.entity_create('all0', inc(test_schema.make_alltypes_max(), x, 1), this.callback); },
    h.r_eq(400, null, "'" + x + "' must be less than or equal to " + (test_schema.make_alltypes_max()[x])));
});

['u1','u2','u4','u8','i1','i2','i4','i8'].forEach(function(x) {
  h.add_test(s, 'schema_create_all0_min_' + x, function() { client.entity_create('all0', inc(test_schema.make_alltypes_min(), x, -1), this.callback); },
    h.r_eq(400, null, "'" + x + "' must be greater than or equal to " + (test_schema.make_alltypes_min()[x])));
});

h.add_test(s, 'schema_create_all0_max_smallstring',
  function() {
    var x = test_schema.make_alltypes_max();
    x.s += " ";
    client.entity_create('all0', x, this.callback);
  },
  h.r_eq(400, null, "'s' length must be less than or equal to 255"));

s.export(module);


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

s.export(module);

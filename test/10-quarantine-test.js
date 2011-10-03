
var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var client  = new st9.St9Client('localhost', 7331);
var s = vows.describe('st9 quarantine tests');

var point0 = function() { return test_schema.point_schema(true, true) };
var point1 = function() { return test_schema.point_schema(true, false) };
var point2 = function() { return test_schema.point_schema(false, true) };


h.add_test(s, 'nuke[0]', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));
h.add_test(s, 'schema_create[0]', function() { client.schema_create('foo', point0(), this.callback); }, h.r_like(200, point0(), null));

h.add_n_tests(s, 10,
  function(i) { return 'entity_create200[' + i + ']' },
  function(i) { return function() { client.entity_create('foo', {x:i,y:-i}, this.callback); } },
  function(i) { return h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null) }
);

h.add_n_tests(s, 5,
  function(i) { return 'entity_get_200[' + i + ']' },
  function(i) { return function() { client.entity_get('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null); }
);

h.add_test(s, 'index get entity (pre-quarantine)',
  function() { client.index_get('foo', "xy", "x eq 1 and y eq -1", this.callback); },
  h.r_like(200, {results:[{id:'@foo:190272f987c6ac27'}]}, null));

h.add_n_tests(s, 10,
  function(i) { return 'entity_not_quarantined_200[' + i + ']' },
  function(i) { return function() { client.entity_quarantine_get('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, {'$quarantined':false}, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_not_quarantined_remove_200[' + i + ']' },
  function(i) { return function() { client.entity_quarantine_remove('foo:' + i, this.callback); } },
  function(i) { return h.r_like(404, null, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_quarantine_200[' + i + ']' },
  function(i) { return function() { client.entity_quarantine_set('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, null, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_quarantine_already_200[' + i + ']' },
  function(i) { return function() { client.entity_quarantine_set('foo:' + i, this.callback); } },
  function(i) { return h.r_like(404, null, null); }
);

h.add_test(s, 'index get entity (post-quarantine)',
  function() { client.index_get('foo', "xy", "x eq 1 and y eq -1", this.callback); },
  h.r_like(200, {results:[]}, null));

h.add_n_tests(s, 10,
  function(i) { return 'entity_is_quarantined_200[' + i + ']' },
  function(i) { return function() { client.entity_quarantine_get('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, {'$quarantined':true}, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_quarantine_remove_200[' + i + ']' },
  function(i) { return function() { client.entity_quarantine_remove('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, null, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_not_quarantined_200[' + i + ']' },
  function(i) { return function() { client.entity_quarantine_get('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, {'$quarantined':false}, null); }
);

h.add_test(s, 'index get entity (post-remove-quarantine)',
  function() { client.index_get('foo', "xy", "x eq 1 and y eq -1", this.callback); },
  h.r_like(200, {results:[{id:'@foo:190272f987c6ac27'}]}, null));

s.export(module);

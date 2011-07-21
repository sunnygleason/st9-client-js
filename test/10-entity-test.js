
var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var client  = new st9.St9Client('localhost', 7331);
var s = vows.describe('st9 entity tests');

var point0 = function() { return test_schema.point_schema(true, true) };
var point1 = function() { return test_schema.point_schema(true, false) };
var point2 = function() { return test_schema.point_schema(false, true) };


h.add_test(s, 'nuke[0]', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));
h.add_test(s, 'schema_create[0]', function() { client.schema_create('foo', point0(), this.callback); }, h.r_like(200, point0(), null));

h.add_test(s, 'entity_create_ok_y_null',   function() { client.entity_create('foo', {x:1}, this.callback); }, h.r_like(200, {kind:"foo",version:1,x:1}, null));

h.add_test(s, 'entity_create_bad_type_empty',   function() { client.entity_create('', {x:1,y:-1}, this.callback); }, h.r_like(400, null, "Missing entity 'type' in path"));
h.add_test(s, 'entity_create_bad_type_unknown', function() { client.entity_create('bar', {x:1,y:-1}, this.callback); }, h.r_like(400, null, "Invalid entity 'type': bar"));
h.add_test(s, 'entity_create_bad_x_string',     function() { client.entity_create('foo', {x:"something",y:-1}, this.callback); }, h.r_like(400, null, "'x' is not a valid integer"));
h.add_test(s, 'entity_create_bad_x_bool',       function() { client.entity_create('foo', {x:true,y:-1}, this.callback); }, h.r_like(400, null, "'x' is not a valid integer"));
h.add_test(s, 'entity_create_bad_x_null',       function() { client.entity_create('foo', {y:-1}, this.callback); }, h.r_like(400, null, 'attribute must not be null: x'));

h.add_test(s, 'entity_create_bad_entity_null',   function() { client.entity_create('foo', null, this.callback); }, h.r_like(400, null, "Invalid entity 'value'"));
h.add_test(s, 'entity_create_bad_entity_array',  function() { client.entity_create('foo', [1, 2, 3], this.callback); }, h.r_like(400, null, "Invalid entity 'value'"));
h.add_test(s, 'entity_create_bad_entity_string', function() { client.entity_create('foo', "not_json", this.callback); }, h.r_like(400, null, "Invalid entity 'value'"));
h.add_test(s, 'entity_create_bad_entity_empty',  function() { client.entity_create('foo', "", this.callback); }, h.r_like(400, null, "Invalid entity 'value'"));

h.add_test(s, 'entity_get_bad_id_null',      function() { client.entity_get(null, this.callback); }, h.r_like(400, null, 'Invalid key'));
h.add_test(s, 'entity_get_bad_id_array',     function() { client.entity_get([1,2], this.callback); }, h.r_like(400, null, 'Invalid key'));
h.add_test(s, 'entity_get_bad_id_string[0]', function() { client.entity_get('foo:', this.callback); }, h.r_like(400, null, 'Invalid key'));
h.add_test(s, 'entity_get_bad_id_string[1]', function() { client.entity_get(':1', this.callback); }, h.r_like(400, null, "Invalid entity 'type': "));
h.add_test(s, 'entity_get_bad_id_string[2]', function() { client.entity_get('@foo:1', this.callback); }, h.r_like(400, null, 'Invalid key'));
h.add_test(s, 'entity_get_bad_id_empty',     function() { client.entity_get('', this.callback); }, h.r_like(400, null, "Missing entity 'id' in path"));

h.add_test(s, 'entity_multiget_bad_key[0]',
  function() { client.entity_multiget([':909'], this.callback); },
  h.r_eq(400, null, "Invalid entity 'type': "));

h.add_test(s, 'entity_multiget_bad_keys',
  function() { client.entity_multiget(['foo:'], this.callback); },
  h.r_eq(400, null, "Invalid key"));

h.add_test(s, 'entity_multiget_bad_keys',
  function() { client.entity_multiget(['@foo:1'], this.callback); },
  h.r_eq(400, null, "Invalid key"));

h.add_test(s, 'nuke[1]', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));
h.add_test(s, 'schema_create[1]', function() { client.schema_create('foo', point0(), this.callback); }, h.r_like(200, point0(), null));

h.add_n_tests(s, 10,
  function(i) { return 'entity_create200[' + i + ']' },
  function(i) { return function() { client.entity_create('foo', {x:i,y:-i}, this.callback); } },
  function(i) { return h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null) }
);

h.add_test(s, 'entity_multiget_found',
  function() { client.entity_multiget(['foo:1', 'foo:2', 'foo:3'], this.callback); },
  h.r_eq(200, {"foo:1":{"id":"@foo:190272f987c6ac27","kind":"foo","version":"1","x":1,"y":-1},"foo:2":{"id":"@foo:ce4ad6a1cd6293d9","kind":"foo","version":"1","x":2,"y":-2},"foo:3":{"id":"@foo:573c812fe6841168","kind":"foo","version":"1","x":3,"y":-3}}, null));

h.add_test(s, 'entity_multiget_missing',
  function() { client.entity_multiget(['foo:909', 'foo:202', 'foo:303'], this.callback); },
  h.r_eq(200, {"foo:909":null,"foo:202":null,"foo:303":null}, null));

h.add_test(s, 'entity_multiget_bad_type',
  function() { client.entity_multiget(['bar:909', 'bar:202', 'bar:303'], this.callback); },
  h.r_eq(400, null, "Invalid entity 'type': bar"));

h.add_n_tests(s, 10,
  function(i) { return 'entity_get_200[' + i + ']' },
  function(i) { return function() { client.entity_get('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null); }
);

var n = Date.now();

h.add_n_tests(s, 10,
  function(i) { return 'entity_update_200[' + i + ']' },
  function(i) {
    return function() {
	  client.entity_get('foo:' + i,
        // slightly tricky, because we must capture this.callback in x
        // so that we can pass it in the call to client.entity_update
	    function(x) { return function(a) {
          a.body.z = n;
          client.entity_update('foo:' + i, a.body, x);
	    }}(this.callback));
	  };
	},
  function(i) { return h.r_like(200, {kind:'foo', version:2, x:i, y:-i, z:n}, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_get_and_update_200[' + i + ']' },
  function(i) {
    return function() {
	  return function(cc) {
        client.entity_get_and_update('foo:' + i, function(a) { a.u = "get_and_update works ["+ i + "]"; return a; }, cc);
      }(this.callback);
    };},
  function(i) { return h.r_like(200, {kind:'foo', version:3, x:i, y:-i, z:n, u:"get_and_update works ["+ i + "]"}, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_update_400[' + i + ']' },
  function(i) {
    return function() {
	  client.entity_get('foo:' + i,
        // slightly tricky, because we must capture this.callback in x
        // so that we can pass it in the call to client.entity_update
	    function(x) { return function(a) {
          a.body.x = "abadstring";
          client.entity_update('foo:' + i, a.body, x);
	    }}(this.callback));
	  };
	},
  function(i) { return h.r_like(400, null, "'x' is not a valid integer"); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_delete[' + i + ']' },
  function(i) { return function() { client.entity_delete('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, null, null); }
);

h.add_n_tests(s, 10,
  function(i) { return 'entity_get_404[' + i + ']' },
  function(i) { return function() { client.entity_get('foo:' + i, this.callback); } },
  function(i) { return h.r_like(404, null, null); }
);

s.export(module);

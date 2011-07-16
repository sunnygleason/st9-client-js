
var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var schema  = function() { return test_schema.point_schema(true, true) };

var client  = new st9.St9Client('localhost', 7331);
var badhost = new st9.St9Client('doesntexistasdf.com', 7331);
var badport = new st9.St9Client('localhost', 7330);

var s = vows.describe('st9 quick smoke tests');

h.add_test(s, 'connectivity failure : bad host', function() { badhost.admin_export(this.callback); }, h.r_eq(null, null, "ENOTFOUND, Domain name not found"));
h.add_test(s, 'connectivity failure : bad port', function() { badport.admin_export(this.callback); }, h.r_eq(null, null, "ECONNREFUSED, Connection refused"));

h.add_test(s, 'nuke', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

h.add_test(s, 'export_all', function() { client.admin_export(this.callback); }, h.r_eq(200, '{"id":"@$schema:1a9ec16ad6118ca9","kind":"$schema","$type":"$key","version":"1","attributes":[],"indexes":[],"counters":[]}\n', null));

h.add_test(s, 'nuke', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

h.add_test(s, 'schema_create[0]', function() { client.schema_create('foo', schema(), this.callback); }, h.r_like(200, schema(), null));
h.add_test(s, 'schema_create[1]', function() { client.schema_create('foo', schema(), this.callback); }, h.r_eq(409, null, "schema already exists"));

h.add_n_tests(s, 10,
  function(i) { return 'entity_create[' + i + ']' },
  function(i) { return function() { client.entity_create('foo', {x:i,y:-i}, this.callback); } },
  function(i) { return h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null) }
);

h.add_test(s, 'entity_multiget',
  function() { client.entity_multiget(['foo:1', 'foo:2', 'foo:3'], this.callback); },
  h.r_eq(200, {"foo:1":{"id":"@foo:190272f987c6ac27","kind":"foo","version":"1","x":1,"y":-1},"foo:2":{"id":"@foo:ce4ad6a1cd6293d9","kind":"foo","version":"1","x":2,"y":-2},"foo:3":{"id":"@foo:573c812fe6841168","kind":"foo","version":"1","x":3,"y":-3}}, null));

h.add_test(s, 'index_get[0]', function() { client.index_get("foo", "xy", "x lt 5", this.callback); },
  h.r_eq(200, {"kind":"foo","index":"xy","query":"x lt 5","results":[{"id":"@foo:190272f987c6ac27"},{"id":"@foo:ce4ad6a1cd6293d9"},{"id":"@foo:573c812fe6841168"},{"id":"@foo:f79fe6c8ee441b18"}],"pageSize":100,"next":null,"prev":null}, null));

h.add_test(s, 'index_get[1]', function() { client.index_get("foo", "xy", "x gt 5", this.callback); },
  h.r_eq(200, {"kind":"foo","index":"xy","query":"x gt 5","results":[{"id":"@foo:9c7897f5fe867388"},{"id":"@foo:0f32df4fcddc0f69"},{"id":"@foo:3c968c214299530c"},{"id":"@foo:d714f06f550102b5"},{"id":"@foo:0c747610470ef631"}],"pageSize":100,"next":null,"prev":null}, null));

h.add_test(s, 'index_get[2]', function() { client.index_get("foo", "xy", "x gt 500", this.callback); },
  h.r_eq(200, {"kind":"foo","index":"xy","query":"x gt 500","results":[],"pageSize":100,"next":null,"prev":null}, null));

h.add_test(s, 'index_get[3]', function() { client.index_get("foo", "xy", "x in (1, 2, 3)", this.callback); },
  h.r_eq(200, {"kind":"foo","index":"xy","query":"x in (1, 2, 3)","results":[{id:'@foo:190272f987c6ac27'},{id:'@foo:ce4ad6a1cd6293d9'},{id:'@foo:573c812fe6841168'}],"pageSize":100,"next":null,"prev":null}, null));

h.add_test(s, 'index_get[4]', function() { client.index_get("foo", "xy", "x in (1, 2, 3) and id in (2, 3)", this.callback); },
  h.r_eq(400, null, "invalid attribute value for 'id'"));

h.add_test(s, 'index_get[5]', function() { client.index_get("foo", "xy", 'x in (1, 2, 3) and id in ("@foo:190272f987c6ac27", "@foo:573c812fe6841168")', this.callback); },
  h.r_eq(200, {"kind":"foo","index":"xy","query":'x in (1, 2, 3) and id in ("@foo:190272f987c6ac27", "@foo:573c812fe6841168")',"results":[{id:'@foo:190272f987c6ac27'},{id:'@foo:573c812fe6841168'}],"pageSize":100,"next":null,"prev":null}, null));

h.add_test(s, 'counter_get[0]', function() { client.counter_get("foo", "by_x", [5], this.callback); },
  h.r_eq(200, {"kind":"foo","counter":"by_x","query":{"x":5},"results":[{"count":1}],"pageSize":1000,"next":null,"prev":null}, null));

h.add_test(s, 'counter_get[1]', function() { client.counter_get("foo", "by_x", [600], this.callback); },
  h.r_eq(200, {"kind":"foo","counter":"by_x","query":{"x":600},"results":[],"pageSize":1000,"next":null,"prev":null}, null));

h.add_n_tests(s, 10,
  function(i) { return 'entity_get_200[' + i + ']' },
  function(i) { return function() { client.entity_get('foo:' + i, this.callback); } },
  function(i) { return h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null); }
);

var n = Date.now();

h.add_n_tests(s, 10,
  function(i) { return 'entity_update[' + i + ']' },
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

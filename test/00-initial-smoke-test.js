
var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var h            = require('./test_helper.js');

var schema  = test_schema.point_schema(true, true);
var client  = new st9.St9Client('localhost', 7331);
var badhost = new st9.St9Client('loclahost', 7331);
var badport = new st9.St9Client('localhost', 7330);

var tasks = []

tasks.push(h.make_test("badhost", function(x) { return badhost.admin_export(x); }, h.r_eq(null, null, "ENOTFOUND, Domain name not found")));
tasks.push(h.make_test("badport", function(x) { return badport.admin_export(x); }, h.r_eq(null, null, "ECONNREFUSED, Connection refused")));
tasks.push(h.make_test("nuke", function(x) { return client.admin_nuke(false, x); }, h.r_eq(200, null, null)));
tasks.push(h.make_test("schema_create[0]", function(x) { return client.schema_create('foo', schema, x); }, h.r_like(200, schema, null)));
tasks.push(h.make_test("schema_create[1]", function(x) { return client.schema_create('foo', schema, x); },   h.r_eq(409, null, "schema already exists")));

for (var i = 1; i <= 10; i++) {
  tasks.push(
	h.make_test("entity_create[" + i + "]",
	  (function(v) {
		  return function(x) {
			return client.entity_create('foo', {x:v,y:-v}, x);
          }
         }(i)),
      h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null)));
}

tasks.push(
	h.make_test("entity_multiget",
	  (function(v) {
		  return function(x) {
			return client.entity_multiget(['foo:1', 'foo:2', 'foo:3'], x);
        }
       }(i)),
       h.r_eq(200, {"foo:1":{"id":"@foo:190272f987c6ac27","kind":"foo","version":"1","x":1,"y":-1},"foo:2":{"id":"@foo:ce4ad6a1cd6293d9","kind":"foo","version":"1","x":2,"y":-2},"foo:3":{"id":"@foo:573c812fe6841168","kind":"foo","version":"1","x":3,"y":-3}}, null)));

tasks.push(
	h.make_test("index_get[0]",
	  (function(v) {
		  return function(x) {
			return client.index_get("foo", "xy", "x lt 5", x);
        }
       }(i)),
       h.r_eq(200, {"kind":"foo","index":"xy","query":"x lt 5","results":[{"id":"@foo:190272f987c6ac27"},{"id":"@foo:ce4ad6a1cd6293d9"},{"id":"@foo:573c812fe6841168"},{"id":"@foo:f79fe6c8ee441b18"}],"pageSize":100,"next":null,"prev":null}, null)));

tasks.push(
	h.make_test("index_get[1]",
	  (function(v) {
		  return function(x) {
			return client.index_get("foo", "xy", "x gt 5", x);
        }
       }(i)),
       h.r_eq(200, {"kind":"foo","index":"xy","query":"x gt 5","results":[{"id":"@foo:9c7897f5fe867388"},{"id":"@foo:0f32df4fcddc0f69"},{"id":"@foo:3c968c214299530c"},{"id":"@foo:d714f06f550102b5"},{"id":"@foo:0c747610470ef631"}],"pageSize":100,"next":null,"prev":null}, null)));

tasks.push(
	h.make_test("index_get[2]",
	  (function(v) {
		  return function(x) {
			return client.index_get("foo", "xy", "x gt 500", x);
        }
       }(i)),
       h.r_eq(200, {"kind":"foo","index":"xy","query":"x gt 500","results":[],"pageSize":100,"next":null,"prev":null}, null)));

tasks.push(
	h.make_test("counter_get[0]",
	  (function(v) {
		  return function(x) {
			return client.counter_get("foo", "by_x", [5], x);
        }
       }(i)),
       h.r_eq(200, {"kind":"foo","counter":"by_x","query":{"x":5},"results":[{"count":1}],"pageSize":1000,"next":null,"prev":null}, null)));

var n = Date.now();

for (var i = 1; i <= 10; i++) {
  tasks.push(
	h.make_test("entity_get[" + i + "]",
      (function(v) { return function(x) { return client.entity_get('foo:' + v, x); } }(i)),
      h.r_like(200, {kind:'foo', version:1, x:i, y:-i}, null)));

  tasks.push(
	h.make_test("entity_update[" + i + "]",
	(function(v) {
      return function(x, a) {
          a.body.z = n;
          return client.entity_update('foo:' + v, a.body, x);
        }
    }(i)),
    h.r_like(200, {kind:'foo', version:2, x:i, y:-i, z : n}, null)));
}

for (var i = 1; i <= 10; i++) {
  tasks.push(
	h.make_test("entity_delete[" + i + "]",
    (function(v) { return function(x) { return client.entity_delete('foo:' + v, x); } }(i)),
    h.r_eq(200, null, null)));
}

for (var i = 1; i <= 10; i++) {
  tasks.push(
	h.make_test("entity_get[" + i + "]",
      (function(v) { return function(x) { return client.entity_get('foo:' + v, x); } }(i)),
      h.r_like(404, null, null)));
}

// h.fold_tasks(tasks, [], function(a){ console.log(a); });
h.fold_tasks(tasks, []);


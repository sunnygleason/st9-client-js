var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var client  = new st9.St9Client('localhost', 7331);
var s = vows.describe('st9 entity tests');

var a_schema = { attributes : [], indexes : [], counters : [], fulltexts : [] };


h.add_test(s, 'nuke[0]', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));
h.add_test(s, 'schema_create[0]', function() { client.schema_create('foo', a_schema, this.callback); }, h.r_like(200, a_schema, null));

//Random playful things
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo', {x:1,y:2011}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo', {null:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo', null, this.callback); }, h.r_eq(400, null, "Invalid entity 'value'"));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo', {null:{x:"y",y:"x"}}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo', {null:{null:{null:{null:{null:{null:{null:{null:{null:{null:{null:"null"}}}}}}}}}}}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo', {"":"Null:null"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{"":":"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{þ:"þ"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{null:null}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{nu:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{"{}":{}}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{x:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{uuu:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{uuu:23,uuu:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{uuu:900719925474099223,uuu:""}, this.callback); }, h.r_like(200, {uuu:''}, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{uuu:999900719925474099223}, this.callback); }, h.r_like(200, {uuu:999900719925474099223}, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{uuu:900719*925474099223>>1}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{null:123}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{x:"jhg"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{y:"jhg"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{yh:"jhg"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{y:"jhg",x:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{y:"jhg",xh:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{yh:"jhg",xh:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{y:123,x:""}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{y:123,x:"sdf"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'nuke[0]', function() { client.entity_create('foo',{y:123,x:456}, this.callback); }, h.r_like(200, null, null));

// schema endpoint tests
var point_schema = {"attributes":[{"name":"x","type":"I32"},{"name":"y","type":"I32"}],"indexes":[{"name":"xy","cols":[{"name":"x","sort":"ASC"},{"name":"y","sort":"ASC"},{"name":"id","sort":"ASC"}]}],"counters":[],"fulltexts":[]};

h.add_test(s, 'schema_create', function() { client.schema_create('point', point_schema, this.callback); }, h.r_like(200, point_schema, null));
h.add_test(s, 'schema_get', function() { client.schema_get('point', this.callback); }, h.r_like(200, point_schema, null));
h.add_test(s, 'entity_create', function() { client.entity_create('point',{"x":1,"y":-1}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('point',{"x":2,"y":1}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('point',{"x":1,"y":true}, this.callback); }, h.r_eq(400, null, "'y' is not a valid integer"));
h.add_test(s, 'index_get', function() { client.index_get('point', "xy", "x+eq+1", this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'index_get', function() { client.index_get('point', "xy", "x+ne+-1+and+y+eq+1", this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'schema_delete', function() { client.schema_delete('point', this.callback); }, h.r_like(200, null, null));

// misc tests
h.add_test(s, 'entity_create', function() { client.entity_create('rawr',{"isAwesome":false}, this.callback); }, h.r_like(400, null, "Invalid entity 'type': rawr"));
h.add_test(s, 'entity_get', function() { client.entity_get('rawr', this.callback); }, h.r_eq(400, null, 'Invalid key'));
h.add_test(s, 'entity_create', function() { client.entity_create('foo:1', {}, this.callback); }, h.r_like(400, null, "Invalid entity 'type': foo:1"));
h.add_test(s, 'entity_create', function() { client.entity_create('foo',{"foo":true}, this.callback); }, h.r_eq(200, {id: '@foo:7d9c725a1a203dd4',kind: 'foo',version: '1',foo:true}, null));
h.add_test(s, 'entity_get', function() { client.entity_get('foo:1', this.callback); }, h.r_eq(200, {id: '@foo:190272f987c6ac27',kind: 'foo',version: '1',x: 1,y: 2011}, null));
h.add_test(s, 'schema_delete', function() { client.schema_delete('foo:1', this.callback); }, h.r_eq(404, null, "type not found"));

h.add_test(s, 'schema_create', function() { client.schema_create('message',{"attributes":[{"name":"msg","type":"UTF8_SMALLSTRING"},{"name":"hotness","type":"ENUM","values":["COOL","HOT"]}],"indexes":[{"name":"hotmsg","cols":[{"name":"hotness","sort":"ASC"},{"name":"msg","sort":"ASC"},{"name":"id","sort":"ASC"}]}],"counters":[],"fulltexts":[]}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('message',{"msg":"hello world","hotness":"COOL"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('message',{"msg":"fly like a G6","hotness":"HOT"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('message',{"msg":"\"double\" 'quotes'","hotness":"HOT"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('message',{"msg":"\"","hotness":"COOL"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('message',{"msg":'"',"hotness":"COOL"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'entity_create', function() { client.entity_create('message',{"msg":"''","hotness":"COOL"}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'index_get', function() { client.index_get('message', "hotmsg", "hotness+eq+\"COOL\"", this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'index_get', function() { client.index_get('message', "hotmsg", "hotness+eq+\"HOT\"", this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'index_get', function() { client.index_get('message', "hotmsg", "hotness+eq+\"HOT\"+and+msg+eq+\"\\\"double\\\" 'quotes'\"", this.callback); },
  h.r_eq(200,{kind:'message',index:'hotmsg',query:"hotness eq \"HOT\" and msg eq \"\\\"double\\\" 'quotes'\"",results:[{id:'@message:07324836639510fe'}],pageSize:100,next:null,prev:null}, null));
h.add_test(s, 'index_get', function() { client.index_get('message', "hotmsg", "hotness+eq+\"COOL\"+and+msg+eq+\"\\\"\"", this.callback); },
  h.r_eq(200,{kind:'message',index:'hotmsg',query:"hotness eq \"COOL\" and msg eq \"\\\"\"",results:[{id:'@message:27955107deb3f41d'},{id:'@message:f5bc7f381e996933'}],pageSize:100,next:null,prev:null}, null));

var awesome_schema = {"attributes":[{"name":"isAwesome","type":"BOOLEAN"}],"indexes":[],"counters":[],"fulltexts":[]};

h.add_test(s, 'schema_create', function() { client.schema_create('awesome','a string literal will break you', this.callback); }, h.r_eq(400, null, 'invalid schema definition json'));
h.add_test(s, 'schema_create', function() { client.schema_create('awesome', awesome_schema, this.callback); }, h.r_eq(200,{id: '@$schema:9d5e5cfb941662e6',kind: '$schema',version: '1',attributes: [{name:'isAwesome',type:'BOOLEAN'}],indexes:[],counters:[],"fulltexts":[]}, null));
h.add_test(s, 'schema_create', function() { client.entity_create('awesome',{"target":"foo:1","isAwesome":true,"hotness":"COOL","year":1970}, this.callback); }, h.r_eq(200, {id:'@awesome:fc5f6a3761d6f960',kind:'awesome',version:'1',target:'foo:1',isAwesome:true,hotness:'COOL',year:1970}, null));
h.add_test(s, 'schema_create', function() { client.entity_create('awesome',{"target":"foo:2","isAwesome":false,"hotness":"TEH_HOTNESS","year":1980}, this.callback); }, h.r_like(200, null, null));

s.export(module);


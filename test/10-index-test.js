
var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var client  = new st9.St9Client('localhost', 7331);
var s = vows.describe('st9 index tests');

var point_schema = test_schema.point_schema(true, true);
var uniq_string_schema = test_schema.uniq_string_schema();

h.add_test(s, 'nuke[0]', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

// Create Schema
h.add_test(s, 'create point_schema', function() { client.schema_create('point', point_schema, this.callback); }, h.r_like(200, null, null));

// Entity Tests
h.add_test(s, 'get entity that does not exist', function() { client.index_get('point', "xy", "x+gt+2+y+eq+1", this.callback); }, h.r_like(200, {results:[]}, null));
h.add_test(s, 'create entity[0]', function() { client.entity_create('point', {"x":1,"y":9}, this.callback); }, h.r_like(200, null , null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('point', "xy", "x eq 1 and y eq 9", this.callback); }, h.r_like(200, {results:[{id:'@point:5eae81437e481933'}]}, null));
h.add_test(s, 'create entity[1]', function() { client.entity_create('point', {"x":2,"y":9}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'create entity[2]', function() { client.entity_create('point', {"x":3,"y":9}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'create entity[3]', function() { client.entity_create('point', {"x":4,"y":2}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'create entity[4]', function() { client.entity_create('point', {"x":8,"y":2}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'create entity[5]', function() { client.entity_create('point', {"x":0,"y":0}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'create entity[6]', function() { client.entity_create('point', {"x":3,"y":0}, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'get entity[0] out of 7', function() { client.index_get('point', "xy", "x eq 1 and y eq 9", this.callback); }, h.r_like(200, {results:[{id:'@point:5eae81437e481933'}]}, null));

h.add_test(s, 'entity_index_all',
  function() { client.index_get('point', 'all', null, this.callback); },
  h.r_eq(200,{ kind: 'point', index: 'all', results: [{ id: '@point:5eae81437e481933' },{ id: '@point:99713f76ab052eca' },{ id: '@point:277a4b8b9de927dc' },{ id: '@point:b6be3461e212d989' },{ id: '@point:f9897dd1fa8114df' },{ id: '@point:4d1515c73734221f' },{ id: '@point:e4470596bba7cf09' }],pageSize: 100,next: null,prev: null}, null));

// Operator Tests
h.add_test(s, 'get entity ne', function() { client.index_get('point', "xy", "x ne 1", this.callback); }, h.r_like(200, {results:[{id:'@point:4d1515c73734221f'},{id:'@point:99713f76ab052eca'},{id:'@point:e4470596bba7cf09'},{id:'@point:277a4b8b9de927dc'},{id:'@point:b6be3461e212d989'},{id:'@point:f9897dd1fa8114df'}]}, null));
h.add_test(s, 'get entity ne', function() { client.index_get('point', "xy", "x ne 1", this.callback); }, h.r_like(200, {results:[{id:'@point:4d1515c73734221f'},{id:'@point:99713f76ab052eca'},{id:'@point:e4470596bba7cf09'},{id:'@point:277a4b8b9de927dc'},{id:'@point:b6be3461e212d989'},{id:'@point:f9897dd1fa8114df'}]}, null));
h.add_test(s, 'get entity gt', function() { client.index_get('point', "xy", "x gt 3", this.callback); }, h.r_like(200, {results:[{id:'@point:b6be3461e212d989'},{id:'@point:f9897dd1fa8114df'}]}, null));
h.add_test(s, 'get entity ge', function() { client.index_get('point', "xy", "x ge 3", this.callback); }, h.r_like(200, {results:[{id:'@point:e4470596bba7cf09'},{id:'@point:277a4b8b9de927dc'},{id:'@point:b6be3461e212d989'},{id:'@point:f9897dd1fa8114df'}]}, null));
h.add_test(s, 'get entity lt', function() { client.index_get('point', "xy", "x lt 3", this.callback); }, h.r_like(200, {results:[{id:'@point:4d1515c73734221f'},{id:'@point:5eae81437e481933'},{id:'@point:99713f76ab052eca'}]}, null));
h.add_test(s, 'get entity le', function() { client.index_get('point', "xy", "x le 2", this.callback); }, h.r_like(200, {results:[{id:'@point:4d1515c73734221f'},{id:'@point:5eae81437e481933'},{id:'@point:99713f76ab052eca'}]}, null));
h.add_test(s, 'get entity le', function() { client.index_get('point', "xy", "x le 2", this.callback); }, h.r_like(200, {results:[{id:'@point:4d1515c73734221f'},{id:'@point:5eae81437e481933'},{id:'@point:99713f76ab052eca'}]}, null));

// Type Tests
h.add_test(s, 'nuke[1]', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

var alltypes_min  = function() { return test_schema.make_alltypes_min(); };
var alltypes_max  = function() { return test_schema.make_alltypes_max(); };
var alltypes_rand = function() { return test_schema.make_alltypes_rand(); };
var alltypes      = function() { return test_schema.alltypes_schema(); };


var awesome_dynamic_type_schema = function(theType) {
   if (theType == "ENUM") {
     return {
       attributes:[
         {name:'awesome',type:theType,nullable:false,values:["FOO","BAR","BAZ","QUUX"]},
         {name:'cool',type:theType,nullable:false,values:["FOO","BAR","BAZ","QUUX"]}],
       indexes:[{name:'awesomesauce',cols:[
         {name:'awesome',sort:'ASC'},
         {name:'cool',sort:'ASC'},
         {name:'id',sort:'ASC'}]}],
       counters:[],fulltexts:[]};
   };

   return {
     attributes:[
       {name:'awesome',type:theType,nullable:false},
       {name:'cool',type:theType,nullable:false}],
     indexes:[{name:'awesomesauce',cols:[
       {name:'awesome',sort:'ASC'},
       {name:'cool',sort:'ASC'},
       {name:'id',sort:'ASC'}]}],
     counters:[],fulltexts:[]};
}

var awesome_min_dynamic_type_entity = function(theTypeName) { 
  var min = alltypes_min()[theTypeName];
  return {"awesome":min,"cool":min};
};

var awesome_max_dynamic_type_entity = function(theTypeName) { 
  var max = alltypes_max()[theTypeName];
  return {"awesome":max,"cool":max};
};

var awesome_rand_dynamic_type_entity = function(theTypeName) { 
  var rand = alltypes_rand()[theTypeName];
  return {"awesome":rand,"cool":rand};
};

var query = function(theType, theStuff) {
  if (theType === "UTF8_TEXT" || theType === "ENUM" || theType === "UTF8_SMALLSTRING" || theType === "REFERENCE" || theType === "UTC_DATE_SECS") {
    return "\"" + theStuff + "\"";
  }

  return theStuff;
};

// Create a schema for each type
h.add_n_tests(s, alltypes().attributes.length,
  function(i) { return 'create schema type ' + alltypes().attributes[i-1].type; },
  function(i) { return function() { client.schema_create('awesomeness_' + alltypes().attributes[i-1].type, awesome_dynamic_type_schema(alltypes().attributes[i-1].type), this.callback); }},
  function(i) { 
    var type = alltypes().attributes[i-1].type;
    if (type === "ANY" || type === "ARRAY" || type === "MAP" || type === "UTF8_TEXT") {
      return h.r_eq(400, null, 'Attribute type not supported in index: ' + type);
    } else {
      return h.r_like(200, null, null);
    }});

// create min entities
h.add_n_tests(s, alltypes().attributes.length,
  function(i) { return 'create entity type ' + alltypes().attributes[i-1].type; },
  function(i) { return function() { client.entity_create('awesomeness_' + alltypes().attributes[i-1].type, awesome_min_dynamic_type_entity(alltypes().attributes[i-1].name), this.callback); }},
  function(i) { 
    var type = alltypes().attributes[i-1].type;
    return h.r_like(200, awesome_min_dynamic_type_entity(alltypes().attributes[i-1].name), null);
  });

// create max entities
h.add_n_tests(s, alltypes().attributes.length,
    function(i) { return 'create entity type ' + alltypes().attributes[i-1].type },
    function(i) { return function() { client.entity_create('awesomeness_' + alltypes().attributes[i-1].type, awesome_max_dynamic_type_entity(alltypes().attributes[i-1].name), this.callback); }},
    function(i) { return h.r_like(200, awesome_max_dynamic_type_entity(alltypes().attributes[i-1].name), null); });

// create random entities
h.add_n_tests(s, alltypes().attributes.length,
  function(i) { return 'create entity type ' + alltypes().attributes[i-1].type },
  function(i) { return function() { client.entity_create('awesomeness_' + alltypes().attributes[i-1].type, awesome_rand_dynamic_type_entity(alltypes().attributes[i-1].name), this.callback); }},
  function(i) { return h.r_like(200, awesome_rand_dynamic_type_entity(alltypes().attributes[i-1].name), null); });
 
["eq", "ne", "gt", "ge", "lt", "le"].forEach(function(o) {
h.add_n_tests(s, alltypes().attributes.length,
  function(i) { return 'index get ' + o + ' (rand) type: ' + alltypes().attributes[i-1].type + ' attribute: ' + alltypes().attributes[i-1].name },
  function(i) { return function() {
    client.index_get('awesomeness_' + alltypes().attributes[i-1].type, "awesomesauce", 
      "awesome " + o + " " + query(alltypes().attributes[i-1].type, alltypes_rand()[alltypes().attributes[i-1].name]), this.callback);
    }},
  function(i) {
    var type = alltypes().attributes[i-1].type;
    if (type === "ANY" || type === "ARRAY" || type === "MAP") {
      return h.r_eq(400, null, 'Invalid query: awesome ' + o + ' '+ alltypes_rand()[alltypes().attributes[i-1].name]);
    } else if (type === "UTF8_TEXT") {
      return h.r_like(400, null, null);
    }
    return h.r_like(200, null, null);
  });    
});

// Create Schema for cases where indexes have same name in different entities
h.add_test(s, 'create uniq1_string_schema', function() { client.schema_create('uniq_email1', uniq_string_schema, this.callback); }, h.r_like(200, null, null));
h.add_test(s, 'create uniq2_string_schema', function() { client.schema_create('uniq_email2', uniq_string_schema, this.callback); }, h.r_like(200, null, null));

// Entity tests for cases where indexes have same name in different entities
h.add_test(s, 'get entity that does not exist', function() { client.index_get('uniq_email1', "email", 'email+eq+"food@bar.com"', this.callback); }, h.r_like(200, {results:[]}, null));
h.add_test(s, 'create entity[0]', function() { client.entity_create('uniq_email1', {"email":"food@bar.com"}, this.callback); }, h.r_like(200, null , null));
h.add_test(s, 'create entity[1]', function() { client.entity_create('uniq_email1', {"email":"fool@bar.com"}, this.callback); }, h.r_like(200, null , null));
h.add_test(s, 'create entity[2]', function() { client.entity_create('uniq_email1', {"email":"foop@bar.com"}, this.callback); }, h.r_like(200, null , null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email1', "email", 'email+eq+"food@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email1:c5a3d107174ed1f4'}]}, null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email1', "email", 'email+eq+"FOOD@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email1:c5a3d107174ed1f4'}]}, null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email1', "email", 'email+eq+"fool@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email1:5aa90f7c3d637929'}]}, null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email1', "email", 'email+eq+"FOOl@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email1:5aa90f7c3d637929'}]}, null));
h.add_test(s, 'entity_unique_ok[1]', function() { client.unique_get('uniq_email1', 'email', 'email+eq+"FOOl@bar.com"', this.callback); }, h.r_like(200, {email:"fool@bar.com"}, null));
h.add_test(s, 'entity_unique_ok[1]', function() { client.unique_get('uniq_email1', 'email', 'email+eq+"FOOd@bar.com"', this.callback); }, h.r_like(200, {email:"food@bar.com"}, null));

h.add_test(s, 'get entity that does not exist', function() { client.index_get('uniq_email2', "email", 'email+eq+"food@bar.com"', this.callback); }, h.r_like(200, {results:[]}, null));
h.add_test(s, 'create entity[0]', function() { client.entity_create('uniq_email2', {"email":"foop@bar.com"}, this.callback); }, h.r_like(200, null , null));
h.add_test(s, 'create entity[0]', function() { client.entity_create('uniq_email2', {"email":"fool@bar.com"}, this.callback); }, h.r_like(200, null , null));
h.add_test(s, 'create entity[0]', function() { client.entity_create('uniq_email2', {"email":"food@bar.com"}, this.callback); }, h.r_like(200, null , null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email2', "email", 'email+eq+"food@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email2:734721d6ab7c6496'}]}, null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email2', "email", 'email+eq+"FOOD@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email2:734721d6ab7c6496'}]}, null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email2', "email", 'email+eq+"fool@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email2:40e59c58808e32ff'}]}, null));
h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email2', "email", 'email+eq+"FOOl@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email2:40e59c58808e32ff'}]}, null));
h.add_test(s, 'entity_unique_ok[1]', function() { client.unique_get('uniq_email2', 'email', 'email+eq+"FOOl@bar.com"', this.callback); }, h.r_like(200, {email:"fool@bar.com"}, null));
h.add_test(s, 'entity_unique_ok[1]', function() { client.unique_get('uniq_email2', 'email', 'email+eq+"FOOd@bar.com"', this.callback); }, h.r_like(200, {email:"food@bar.com"}, null));

h.add_test(s, 'get entity[0] out of 1', function() { client.index_get('uniq_email1', "email", 'email+eq+"food@bar.com"', this.callback); }, h.r_like(200, {results:[{id:'@uniq_email1:c5a3d107174ed1f4'}]}, null));

s.export(module);

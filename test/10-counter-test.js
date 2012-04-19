var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var client  = new st9.St9Client('localhost', 7331);
var s = vows.describe('st9 entity tests');


var alltypes = {
	'min' : function() { return test_schema.make_alltypes_min(); },
	'max' : function() { return test_schema.make_alltypes_max(); },
	'rand' : function() { return test_schema.make_alltypes_rand(); },
};

var alltypes_schema = function() { return test_schema.alltypes_schema(); };

var awesome_dynamic_type_schema = function(theType) {
	if (theType == "ENUM") {
		return { attributes:[{name:'awesome', type:theType, nullable:false, values:["FOO","BAR","BAZ","QUUX"]},
													{name:'cool',type:theType, nullable:false, values:["FOO","BAR","BAZ","QUUX"]}],
				     indexes:[],
			  		 counters:[{name:'byAwesome',cols:[{name:'awesome',sort:'ASC'}]},
                       {name:'byCool',cols:[{name:'cool',sort:'ASC'}]},
                       {name:'byAwesomeCool',cols:[{name:'awesome',sort:'ASC'},
                                                 {name:'cool',sort:'ASC'}]}],
                      fulltexts:[]};
    }
	return { attributes:[{name:'awesome', type:theType, nullable:false},
												{name:'cool',type:theType, nullable:false}],
					 indexes:[],
					 counters:[{name:'byAwesome',cols:[{name:'awesome',sort:'ASC'}]},
                     {name:'byCool',cols:[{name:'cool',sort:'ASC'}]},
                     {name:'byAwesomeCool',cols:[{name:'awesome',sort:'ASC'},
                                                 {name:'cool',sort:'ASC'}]}],
                     fulltexts:[]};
};


var awesome_dynamic_type_entity = function(which_awe, which_cool, theTypeName) {
  return {"awesome":alltypes[which_awe]()[theTypeName], "cool":alltypes[which_cool]()[theTypeName]};
};

var query = function(theType, theStuff) {
							if (theType == "UTF8_TEXT" || theType == "ENUM" || theType == "UTF8_SMALLSTRING") {
								return "\"" + theStuff + "\"";
							} 
							return theStuff;};


h.add_test(s, 'nuke', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));


// Create a schema for each type
h.add_n_tests(s, 16, 
	function(i) { return 'create schema type ' + alltypes_schema().attributes[i].type },
	function(i) { return function() { client.schema_create('awesomeness_' + alltypes_schema().attributes[i].type, awesome_dynamic_type_schema(alltypes_schema().attributes[i].type), this.callback); }},
	function(i) { 
		var type = alltypes_schema().attributes[i].type
		if (type == "ARRAY" || type == "MAP" || type == "UTF8_TEXT") {
			return h.r_eq(400, null, 'Attribute type not supported in counter: ' + type);
		} else {
			return h.r_like(200, null, null);
		}});

// Create several points for each type
h.add_n_tests(s, 16, 
	function(i) { return 'create min entity type ' + alltypes_schema().attributes[i].type },
	// create min entities
	function(i) { return function() { client.entity_create('awesomeness_' + alltypes_schema().attributes[i].type, awesome_dynamic_type_entity('min', 'min', alltypes_schema().attributes[i].name), this.callback); }},
	function(i) { 
		var type = alltypes_schema().attributes[i].type
			return h.r_like(200, null, null);
		});
h.add_n_tests(s, 16, 
	function(i) { return 'create max entity type ' + alltypes_schema().attributes[i].type },
	// create max entities
	function(i) { return function() { client.entity_create('awesomeness_' + alltypes_schema().attributes[i].type, awesome_dynamic_type_entity('max', 'max', alltypes_schema().attributes[i].name), this.callback); }},
	function(i) { 
			return h.r_like(200, null, null);
		});
h.add_n_tests(s, 16, 
	function(i) { return 'create rand entity type ' + alltypes_schema().attributes[i].type },
	// create random entities
	function(i) { return function() { client.entity_create('awesomeness_' + alltypes_schema().attributes[i].type, awesome_dynamic_type_entity('rand', 'rand', alltypes_schema().attributes[i].name), this.callback); }},
	function(i) { 
			return h.r_like(200, null, null);
		});
h.add_n_tests(s, 16, 
	function(i) { return 'create rand/min entity type ' + alltypes_schema().attributes[i].type },
	// create random/min entities
	function(i) { return function() { client.entity_create('awesomeness_' + alltypes_schema().attributes[i].type, awesome_dynamic_type_entity('rand', 'min', alltypes_schema().attributes[i].name), this.callback); }},
	function(i) { 
			return h.r_like(200, null, null);
		});

h.add_n_tests(s, 16, 
	function(i) { return 'counter get type ' + alltypes_schema().attributes[i].type },
	function(i) { 
    var elem = alltypes['rand']()[alltypes_schema().attributes[i].name];
		return function() { client.counter_get('awesomeness_' + 
																						alltypes_schema().attributes[i].type, 
                                           'byAwesome', 
                                           [elem], this.callback); }},
	function(i) {
		var type = alltypes_schema().attributes[i].type;
		if (type == "UTF8_TEXT" || type == "MAP" || type == "ARRAY") { 
			return h.r_eq(400, null, 'schema or index not found awesomeness_' + type + '.byAwesome');
		} else if (type == "BOOLEAN") {
			return h.r_like(200, {results:[{ count: 3 }]}, null);
		} else if (type == "REFERENCE" || type == "ENUM") {
			return h.r_like(200, {results:[{ count: 4 }]}, null);
		} else {
		return h.r_like(200, {results:[{ count: 2 }]}, null); 
		}});

h.add_n_tests(s, 16, 
	function(i) { return 'counter get type ' + alltypes_schema().attributes[i].type },
	function(i) {
    var elem = alltypes['min']()[alltypes_schema().attributes[i].name];
		return function() { client.counter_get('awesomeness_' + alltypes_schema().attributes[i].type, 
                                           'byAwesome', 
                                           [elem], this.callback); }},
	function(i) {
		var type = alltypes_schema().attributes[i].type;
		if (type == "UTF8_TEXT" || type == "MAP" || type == "ARRAY") { 
			return h.r_eq(400, null, 'schema or index not found awesomeness_' + type + '.byAwesome');
		} else if (type == "BOOLEAN") {
			return h.r_like(200, {results:[{ count: 3 }]}, null);
		} else if (type == "REFERENCE" || type == "ENUM") {
			return h.r_like(200, {results:[{ count: 4 }]}, null);
		} else if (type == "UTF8_SMALLSTRING") {
			return h.r_eq(400, null, 'counter parameter may not be empty');
		} else {
			return h.r_like(200, {results:[{ count: 1 }]}, null);
		}});

h.add_n_tests(s, 16, 
	function(i) { return 'counter get type ' + alltypes_schema().attributes[i].type },
	function(i) { 
        var elem = alltypes['max']()[alltypes_schema().attributes[i].name];
		return function() { client.counter_get('awesomeness_' + alltypes_schema().attributes[i].type, 
                                           'byAwesome', 
                                           [elem], this.callback); }},
	function(i) {
		var type = alltypes_schema().attributes[i].type;
		if (type == "UTF8_TEXT" || type == "MAP" || type == "ARRAY") { 
			return h.r_eq(400, null, 'schema or index not found awesomeness_' + type + '.byAwesome');
		} else if (type == "BOOLEAN") {
			return h.r_like(200, {results:[{ count: 1 }]}, null);
		} else if (type == "REFERENCE" || type == "ENUM") {
			return h.r_like(200, {results:[{ count: 4 }]}, null);
		} else {
		return h.r_like(200, {results:[{ count: 1 }]}, null); 
		}});

s.export(module);

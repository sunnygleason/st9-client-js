var st9          = require('../lib/st9.js');
var test_schema  = require('./schema_helper.js');
var vows         = require('vows');
var h            = require('./vows_helper.js');

var client  = new st9.St9Client('localhost', 7331);
var s = vows.describe('st9 index tests');

h.add_test(s, 'nuke', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

h.add_test(s, 'schema_create[3]',    function() { client.schema_create('uniq', test_schema.uniq_schema(), this.callback); }, h.r_like(200, test_schema.uniq_schema(), null));

h.add_test(s, 'entity_create_ok[0]', function() { client.entity_create('uniq', {x:1,y:-1}, this.callback); }, h.r_like(200, {x:1,y:-1}, null));
h.add_test(s, 'entity_create_ok[1]', function() { client.entity_create('uniq', {x:2,y:-1}, this.callback); }, h.r_like(200, {x:2,y:-1}, null));
h.add_test(s, 'entity_create_bad[2]', function() { client.entity_create('uniq', {x:1,y:-1}, this.callback); }, h.r_like(409, null, "unique index constraint violation"));

h.add_test(s, 'entity_unique_ok[0]', function() { client.unique_get('uniq', 'uniq_x', "x eq 0", this.callback); }, h.r_like(404, null, null));
h.add_test(s, 'entity_unique_ok[0]', function() { client.unique_get('uniq', 'uniq_x', "x eq 1", this.callback); }, h.r_like(200, {x:1,y:-1}, null));
h.add_test(s, 'entity_unique_ok[0]', function() { client.unique_get('uniq', 'uniq_x', "x eq 2", this.callback); }, h.r_like(200, {x:2,y:-1}, null));
h.add_test(s, 'entity_unique_ok[0]', function() { client.unique_get('uniq', 'uniq_x', "x eq 3", this.callback); }, h.r_like(404, null, null));

h.add_test(s, 'nuke', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

h.add_test(s, 'schema_create[3]',    function() { client.schema_create('uniq2', test_schema.uniq_compound_schema(), this.callback); }, h.r_like(200, test_schema.uniq_compound_schema(), null));

h.add_test(s, 'entity_create_ok[0]', function() { client.entity_create('uniq2', {x:1,y:-1}, this.callback); }, h.r_like(200, {x:1,y:-1}, null));
h.add_test(s, 'entity_create_ok[1]', function() { client.entity_create('uniq2', {x:2,y:-1}, this.callback); }, h.r_like(200, {x:2,y:-1}, null));
h.add_test(s, 'entity_create_ok[2]', function() { client.entity_create('uniq2', {x:1,y:-2}, this.callback); }, h.r_like(200, {x:1,y:-2}, null));
h.add_test(s, 'entity_create_bad[3]', function() { client.entity_create('uniq2', {x:1,y:-1}, this.callback); }, h.r_like(409, null, "unique index constraint violation"));

h.add_test(s, 'entity_unique_ok[0]', function() { client.unique_get('uniq2', 'uniq_xy', "x eq 0", this.callback); }, h.r_like(400, null, 'unique index query must specify all fields'));
h.add_test(s, 'entity_unique_ok[1]', function() { client.unique_get('uniq2', 'uniq_xy', "x eq 0 and y eq 0", this.callback); }, h.r_like(404, null, null));
h.add_test(s, 'entity_unique_ok[2]', function() { client.unique_get('uniq2', 'uniq_xy', "x eq 1 and y eq -1", this.callback); }, h.r_like(200, {x:1,y:-1}, null));
h.add_test(s, 'entity_unique_ok[3]', function() { client.unique_get('uniq2', 'uniq_xy', "x eq 2 and y eq -1", this.callback); }, h.r_like(200, {x:2,y:-1}, null));
h.add_test(s, 'entity_unique_ok[4]', function() { client.unique_get('uniq2', 'uniq_xy', "x eq 3 and y eq 3", this.callback); }, h.r_like(404, null, null));

h.add_test(s, 'nuke', function() { client.admin_nuke(false, this.callback); }, h.r_eq(200, null, null));

h.add_test(s, 'schema_create[3]',    function() { client.schema_create('uniq3', test_schema.uniq_xform_schema(), this.callback); }, h.r_like(200, test_schema.uniq_xform_schema(), null));

h.add_test(s, 'entity_create_ok[0]', function() { client.entity_create('uniq3', {e:"foo@bar.com"}, this.callback); }, h.r_like(200, {e:"foo@bar.com"}, null));
h.add_test(s, 'entity_create_ok[1]', function() { client.entity_create('uniq3', {e:"bar@bar.com"}, this.callback); }, h.r_like(200, {e:"bar@bar.com"}, null));
h.add_test(s, 'entity_create_bad[3]', function() { client.entity_create('uniq3', {e:"FOO@bar.com"}, this.callback); }, h.r_like(409, null, "unique index constraint violation"));

h.add_test(s, 'entity_unique_ok[0]', function() { client.unique_get('uniq3', 'uniq_e', 'e eq "foo"', this.callback); }, h.r_like(404, null, null));
h.add_test(s, 'entity_unique_ok[1]', function() { client.unique_get('uniq3', 'uniq_e', 'e eq "foo@bar.com"', this.callback); }, h.r_like(200, {e:"foo@bar.com"}, null));
h.add_test(s, 'entity_unique_ok[2]', function() { client.unique_get('uniq3', 'uniq_e', 'e eq "FOO@BAR.COM"', this.callback); }, h.r_like(200, {e:"foo@bar.com"}, null));
h.add_test(s, 'entity_unique_ok[4]', function() { client.unique_get('uniq3', 'uniq_e', "e eq null", this.callback); }, h.r_like(404, null, null));

s.export(module);

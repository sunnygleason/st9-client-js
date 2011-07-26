
var make_schema = function(attrs, indexes, counts) {
  var ret_val = {attributes:attrs};
  ret_val.indexes  = (indexes || []);
  ret_val.counters = (counts || []);

  return ret_val;
};

exports.make_schema = make_schema;

var point_schema = function(index, count) {
  return make_schema(
    [{name:"x",type:"I32",nullable:false},{"name":"y","type":"I32"}],
    (index ? [{"name":"xy","cols":[{"name":"x","sort":"ASC"},{"name":"y","sort":"ASC"},{"name":"id","sort":"ASC"}]}] : []),
    (count ? [{"name":"by_x","cols":[{"name":"x","sort":"ASC"}]}] : []));
}

exports.point_schema = point_schema;

var awesome_schema = function(index, count) {
  return make_schema(
    [{name:"isAwesome",type:"BOOLEAN",nullable:false}],
    (index ? [{"name":"is_awesome_asc","cols":[{"name":"isAwesome","sort":"ASC"},{"name":"id","sort":"ASC"}]}] : []),
    (count ? [{"name":"by_awesomeness","cols":[{"name":"isAwesome","sort":"ASC"}]}] : []));
}

exports.awesome_schema = awesome_schema;

var alltypes_schema = function() {
  return make_schema([
      {name:"a",type:"ANY",nullable:false},
      {name:"b",type:"BOOLEAN",nullable:false},
      {name:"u1",type:"U8",nullable:false},
      {name:"u2",type:"U16",nullable:false},
      {name:"u4",type:"U32",nullable:false},
      {name:"u8",type:"U64",nullable:false},
      {name:"i1",type:"I8",nullable:false},
      {name:"i2",type:"I16",nullable:false},
      {name:"i4",type:"I32",nullable:false},
      {name:"i8",type:"I64",nullable:false},
      {name:"d",type:"UTC_DATE_SECS",nullable:false},
      {name:"e",type:"ENUM",nullable:false,values:["FOO","BAR","BAZ","QUUX"]},
      {name:"l",type:"ARRAY",nullable:false},
      {name:"m",type:"MAP",nullable:false},
      {name:"r",type:"REFERENCE",nullable:false},
      {name:"s",type:"UTF8_SMALLSTRING",nullable:false},
      {name:"t",type:"UTF8_TEXT",nullable:false},
    ],[],[]);
}

exports.alltypes_schema = alltypes_schema;

var make_alltypes_max = function() {
  return {
    a : [{foo:["bar"]},[{nested:true},1]],
    b : true,
    u1 : 255,
    u2 : 65535,
    u4 : 4294967295,
    u8 : "18446744073709551615",
    i1 : 127,
    i2 : 32767,
    i4 : 2147483647,
    i8 : "9223372036854775807",
    d : "20110101T000000Z",
    e : "FOO",
    l : ["list","of","stuff"],
    m : {isMap:true,isArray:false},
    r : "@foo:CAFECAFECAFECAFE",
    s : "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
        "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
        "123456789012345",
    t : "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
        "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
        "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
        "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" +
        "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890"
  };
}

exports.make_alltypes_max = make_alltypes_max;

var make_alltypes_min = function() {
  return {
    a : [{}],
    b : false,
    u1 : 0,
    u2 : 0,
    u4 : 0,
    u8 : 0,
    i1 : -128,
    i2 : -32768,
    i4 : -2147483648,
    i8 : "-9223372036854775808",
    d : "20110101T000000Z",
    e : "FOO",
    l : [],
    m : {},
    r : "@foo:CAFECAFECAFECAFE",
    s : "",
    t : ""
  };
}

exports.make_alltypes_min = make_alltypes_min;

exports.make_alltypes_min = make_alltypes_min;

var make_alltypes_rand = function() {
  return {
    a : [{}],
    b : false,
    u1 : 3,
    u2 : 5,
    u4 : 17,
    u8 : 9203,
    i1 : -14,
    i2 : -37,
    i4 : -21,
    i8 : "-9238",
    d : "20110101T000000Z",
    e : "FOO",
    l : ["foo", "bar"],
    m : {"foo":"bar", "baz":"quux"},
    r : "@foo:CAFECAFECAFECAFE",
    s : "alskdjhf",
    t : "alskdjhfaksjhdfl"
  };
}

exports.make_alltypes_rand = make_alltypes_rand;


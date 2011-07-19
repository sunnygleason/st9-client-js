
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
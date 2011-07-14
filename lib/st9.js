
var request = require('request');

var St9Client = function(host, port) {
  this.host = host;
  this.port = port;
  this.base = "http://" + host + ":" + port
}

St9Client.prototype = {
  _do_request : function(method, path, body, cc) {
    var req_opts = {
	  uri : this.base + path,
	  method : method,
	  body : body,
	  headers : {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
	  },
	  timeout : 5000
    };

    var ret_val = new St9Result(req_opts, cc);
    request(req_opts, ret_val._handler());
  },
  _get : function(path, cc) {
    this._do_request('GET', path, null, cc);
  },
  _post : function(path, body, cc) {
    this._do_request('POST', path, JSON.stringify(body), cc);
  },
  _put : function(path, body, cc) {
    this._do_request('PUT', path, JSON.stringify(body), cc);
  },
  _delete : function(path, cc) {
    this._do_request('DELETE', path, null, cc);
  },
  admin_nuke : function(preserveSchema, cc) {
	this._post("/1.0/nuke?preserveSchema=" + !!preserveSchema, null, cc);
  },
  admin_export : function(cc) {
	this._get("/1.0/x", cc);
  },
  admin_import : function(json_rows, cc) {
	this._post("/1.0/x", json_rows, cc);
  },
  schema_get : function(type, cc) {
	this._get("/1.0/s/" + type, cc);
  },
  schema_create : function(type, body, cc) {
	this._post("/1.0/s/" + type, body, cc);
  },
  schema_update : function(type, body, cc) {
	this._put("/1.0/s/" + type, body, cc);
  },
  schema_delete : function(type, cc) {
	this._delete("/1.0/s/" + type, cc);
  },
  entity_get : function(id, cc) {
	this._get("/1.0/e/" + id, cc);
  },
  entity_multiget : function(ids, cc) {
	var q = ids.map(function(x) { return "k=" + x; }).join("&");
	
	this._get("/1.0/e/multi?" + q, cc);
  },
  entity_create : function(type, body, cc) {
	this._post("/1.0/e/" + type, body, cc);
  },
  entity_update : function(id, body, cc) {
	this._put("/1.0/e/" + id, body, cc);
  },
  entity_delete : function(id, cc) {
	this._delete("/1.0/e/" + id, cc);
  },
  index_get : function(type, index, query, cc) {
	this._get("/1.0/i/" + type + "." + index + "?q=" + escape(query), cc);
  },
  counter_get : function(type, counter, values, cc) {
	this._get("/1.0/c/" + type + "." + counter + "/" + values.join("/"), cc);
  }
}

var St9Result = function(req, cc) {
  this.request = req;
  this.finished = false;
  this.error = false;
  this.error_detail = null;
  this.statusCode = null;
  this.reason = null;
  this.t1 = Date.now();
  this.t2 = null;
  this.cc = cc;
};

St9Result.prototype = {
  _handler : function() {
    var ret = this;
    return function(error, response, result) {
      ret._decode(error, response, result);
      ret.finished = true;
      ret.t2 = Date.now();

      if (ret.cc) {
        ret.cc(ret);
      }
    };
  },
  _decode : function(error, response, result) {
	  if (!error) {
        this.status = response.statusCode;
        if (this.status >= 200 && this.status < 300) {
          this.error = false;
          this.body   = result.length > 0 ? JSON.parse(result) : null;
        } else if (this.status >= 400 && this.status < 500) {
          this.error  = true;
          this.reason = result.length > 0 ? result : null;
          this.body   = null;
        } else {
          this.error = true;
          this.reason = result;
        }
      } else {
        this.error = true;
        this.error_detail = error;
        this.status = null;
        this.reason = error["message"];
        this.body   = null;
      }
  },
  isError : function() {
    return !!this.finished && !!this.error;
  },
  isFinished : function() {
    return !!this.finished;
  },
  requestTimeMS : function() {
    return this.finished ? (this.t2 - this.t1) : undefined;
  }
};

exports.St9Client = St9Client;

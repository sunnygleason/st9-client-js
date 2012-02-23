
var request = require('request');

var St9Client = function(host, port) {
  this.host = host;
  this.port = port;
  this.base = "http://" + host + ":" + port
}

St9Client.prototype = {
  _do_request : function(method, path, body, options, cc) {
    var req_opts = {
	  uri : this.base + path,
	  method : method,
	  body : body,
	  headers : (options && options.headers) ? options.headers : {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
	  },
	  is_json : (options && options.is_json) ? options.is_json : true,
	  timeout : 5000
    };

    var ret_val = new St9Result(req_opts, cc);
    return request(req_opts, ret_val._handler());
  },
  _get : function(path, options, cc) {
    return this._do_request('GET', path, null, options, cc);
  },
  _post : function(path, body, options, cc) {
    return this._do_request('POST', path, JSON.stringify(body), options, cc);
  },
  _put : function(path, body, options, cc) {
    return this._do_request('PUT', path, JSON.stringify(body), options, cc);
  },
  _delete : function(path, options, cc) {
    return this._do_request('DELETE', path, null, options, cc);
  },
  admin_nuke : function(preserveSchema, cc) {
    return this._post("/1.0/nuke?preserveSchema=" + !!preserveSchema, null, null, cc);
  },
  admin_export : function(cc) {
    return this._get("/1.0/x", { headers : {}, json:false }, cc);
  },
  admin_import : function(json_rows, cc) {
    return this._post("/1.0/x", json_rows, null, cc);
  },
  schema_get : function(type, cc) {
    return this._get("/1.0/s/" + type, null, cc);
  },
  schema_create : function(type, body, cc) {
    return this._post("/1.0/s/" + type, body, null, cc);
  },
  schema_update : function(type, body, cc) {
    return this._put("/1.0/s/" + type, body, null, cc);
  },
  // schema_get_and_update : function(type, body_fun, cc) {
  //   return this.schema_get(type,
  //     (function(client, x) { return function(a) {
  //       return client.schema_update(type, body_fun(a.body), x);
  //     };})(this, cc));
  // },
  schema_delete : function(type, cc) {
    return this._delete("/1.0/s/" + type, null, cc);
  },
  entity_get : function(id, cc) {
    return this._get("/1.0/e/" + id, null, cc);
  },
  entity_multiget : function(ids, cc) {
	var q = ids.map(function(x) { return "k=" + x; }).join("&");
	
    return this._get("/1.0/e/multi?" + q, null, cc);
  },
  entity_create : function(type, body, cc) {
    return this._post("/1.0/e/" + type, body, null, cc);
  },
  entity_update : function(id, body, cc) {
    return this._put("/1.0/e/" + id, body, null, cc);
  },
  entity_get_and_update : function(id, body_fun, cc) {
    return this.entity_get(id,
      (function(client, x) { return function(a) {
        return client.entity_update(id, body_fun(a.body), x);
      };})(this, cc));
  },
  entity_delete : function(id, cc) {
    return this._delete("/1.0/e/" + id, null, cc);
  },
  entity_quarantine_get : function(id, cc) {
    return this._get("/1.0/q/" + id, null, cc);
  },
  entity_quarantine_set : function(id, cc) {
    return this._post("/1.0/q/" + id, null, null, cc);
  },
  entity_quarantine_remove : function(id, cc) {
    return this._delete("/1.0/q/" + id, null, cc);
  },
  index_get : function(type, index, query, cc) {
    return this._get("/1.0/i/" + type + "." + index + "?q=" + escape(query), null, cc);
  },
  unique_get : function(type, index, query, cc) {
    return this._get("/1.0/u/" + type + "." + index + "?q=" + escape(query), null, cc);
  },
  counter_get : function(type, counter, values, cc) {
    var query = (values == null || values.length == 0) ? "" : "/" + values.map(escape).join("/");
	
    return this._get("/1.0/c/" + type + "." + counter + query, null, cc);
  }
}

var St9Result = function(req, cc) {
  this.request = req;
  this.finished = false;
  this.error = false;
  this.error_detail = null;
  this.statusCode = null;
  this.reason = null;
  this.content_type = null;
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
        this.content_type = response.headers['content-type'];
        if (this.status >= 200 && this.status < 300) {
          this.error = false;
          this.body   = (result && result.length > 0) ? ((this.content_type == "application/json") ? JSON.parse(result) : result) : null;
        } else if (this.status >= 400 && this.status < 500) {
          this.error  = true;
          this.reason = (result && result.length > 0) ? result : null;
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

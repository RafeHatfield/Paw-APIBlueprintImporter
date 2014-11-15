// Generated by CoffeeScript 1.8.0
(function() {
  var APIBlueprintImporter;

  APIBlueprintImporter = function() {
    this.importBlueprint = function(context, blueprint) {
      var ast, baseHost, metadata, resourceGroup, resourceGroups, _i, _j, _len, _len1, _ref, _results;
      ast = blueprint["ast"];
      metadata = ast["metadata"];
      baseHost = "";
      _ref = ast["metadata"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        metadata = _ref[_i];
        if (metadata["name"] === "HOST") {
          baseHost = metadata["value"];
        }
      }
      resourceGroups = ast["resourceGroups"];
      _results = [];
      for (_j = 0, _len1 = resourceGroups.length; _j < _len1; _j++) {
        resourceGroup = resourceGroups[_j];
        _results.push(this.importResourceGroup(context, baseHost, resourceGroup));
      }
      return _results;
    };
    this.importResourceGroup = function(context, baseHost, resourceGroup) {
      var name, request, requestGroup, resource, resources, _i, _len;
      name = resourceGroup["name"];
      resources = resourceGroup["resources"];
      console.log("Importing resource group " + name);
      requestGroup = context.createRequestGroup(name);
      for (_i = 0, _len = resources.length; _i < _len; _i++) {
        resource = resources[_i];
        request = this.importResource(context, baseHost, resource);
        requestGroup.appendChild(request);
      }
      return requestGroup;
    };
    this.importResource = function(context, baseHost, resource) {
      var action, actions, name, request, requestGroup, url, _i, _len;
      name = resource["name"];
      actions = resource["actions"];
      console.log("Importing resource " + name);
      url = baseHost + resource["uriTemplate"];
      requestGroup = context.createRequestGroup(name);
      for (_i = 0, _len = actions.length; _i < _len; _i++) {
        action = actions[_i];
        request = this.importResourceAction(context, url, action);
        requestGroup.appendChild(request);
      }
      return requestGroup;
    };
    this.importResourceAction = function(context, url, action) {
      var example, examples, method, name, request, requestGroup, _i, _len;
      name = action["name"];
      if (name.length === 0) {
        name = action["description"];
        if (name.length === 0) {
          name = "Example";
        }
      }
      examples = action["examples"];
      method = action["method"];
      console.log("Importing resource action '" + name + "' " + examples.length + " examples");
      if (examples.length > 0) {
        requestGroup = context.createRequestGroup(name);
        for (_i = 0, _len = examples.length; _i < _len; _i++) {
          example = examples[_i];
          request = this.importExample(context, method, url, example);
          requestGroup.appendChild(request);
        }
        return requestGroup;
      } else {
        request = context.createRequest(name, method, url);
      }
      return request;
    };
    this.importExample = function(context, method, url, example) {
      var name, request, requestExample, requestGroup, requests, _i, _len;
      name = example["name"];
      requests = example["requests"];
      if (name.length === 0) {
        name = example["description"];
        if (name.length === 0) {
          name = "Example";
        }
      }
      console.log("Importing example " + name);
      if (requests !== void 0 && requests.length > 0) {
        requestGroup = context.createRequestGroup(name);
        for (_i = 0, _len = requests.length; _i < _len; _i++) {
          requestExample = requests[_i];
          request = this.importExampleRequest(context, method, url, requestExample);
          requestGroup.appendChild(request);
        }
        return requestGroup;
      } else {
        request = context.createRequest(name, method, url);
      }
      return request;
    };
    this.importExampleRequest = function(context, method, url, exampleRequest) {
      var body, exampleHeaders, header, headers, key, name, request, value, _i, _len;
      name = exampleRequest["name"];
      exampleHeaders = exampleRequest["headers"];
      body = exampleRequest["body"];
      console.log("Importing example request " + name);
      headers = {};
      if (exampleHeaders) {
        for (_i = 0, _len = exampleHeaders.length; _i < _len; _i++) {
          header = exampleHeaders[_i];
          key = header["name"];
          value = header["value"];
          headers[key] = value;
        }
      }
      request = context.createRequest(name, method, url);
      request.headers = headers;
      request.body = body;
      return request;
    };
    this.importString = function(context, string) {
      var blueprint, http_request;
      http_request = new NetworkHTTPRequest();
      http_request.requestUrl = "https://api.apiblueprint.org/parser";
      http_request.requestMethod = "POST";
      http_request.requestTimeout = 3600;
      http_request.requestBody = string;
      http_request.setRequestHeader("Content-Type", "text/vnd.apiblueprint+markdown; version=1A; charset=utf-8");
      http_request.setRequestHeader("Accept", "application/vnd.apiblueprint.parseresult.raw+json");
      if (http_request.send() && (http_request.responseStatusCode === 200)) {
        blueprint = JSON.parse(http_request.responseBody);
        this.importBlueprint(context, blueprint);
        return true;
      }
      throw new Error("HTTP Request failed: " + http_request.responseStatusCode);
    };
  };

  APIBlueprintImporter.identifier = "io.apiary.PawExtensions.APIBlueprintImporter";

  APIBlueprintImporter.title = "API Blueprint Importer";

  if (typeof registerImporter !== 'undefined') {
    registerImporter(APIBlueprintImporter);
  } else if (typeof module !== 'undefined') {
    module.exports = APIBlueprintImporter;
  }

}).call(this);

(function (angular, wizer, _) {
    "use strict";

    var ArgsParser = wizer.utils.ArgsParser;

    if (!angular) return;
    angular
        .module("wizer.data")
        .factory("$SPListDataSource", [
            "$q", "$http", "$DataSource",
            function ($q, $http, $DataSource) {
                var convertPostData = function (listName, itemToPost, updatingItem) {
                    return _.chain({}).extend(itemToPost, {
                        "__metadata": {
                            "type": "SP.Data." + listName + "ListItem"
                        }
                    }).omit(updatingItem ? "" : [
                        "Id",
                        "ID"
                    ]).value();
                };
                var dataSourceConfigs = function () {
                    var dsConfigs = {};

                    // Constructor.
                    _.set(dsConfigs, "init", function (splist, configs) {
                        this.$$splist = splist;
                        this.$super.init.call(this, configs);
                    });

                    // Transport.
                    /**
                     * Configs for creating item to the list.
                     */
                    _.set(dsConfigs, "transport.create", function (options) {
                        var self = this;
                        return $http
                            .post(this.$$getItemUrl(), convertPostData(this.$$splist.$configs.listName, options.item), _.extendClone(this.$$defaultHttpConfigs().create(), options.httpConfigs))
                            .then(function (data) {
                                return self.get(_.get(data, "data.d.Id"), options.httpConfigs);
                            });
                    });
                    /**
                     * Configs for getting item from the list.
                     */
                    _.set(dsConfigs, "transport.read", function (options) {
                        return $http
                            .get(this.$$getItemUrl(options.itemId), _.mergeClone(this.$$defaultHttpConfigs().get(), options.httpConfigs))
                            .then(function (data) {
                                return _.get(data, "data.d" + (options.method === "getList" ? ".results" : ""));
                            });
                    });
                    /**
                     * Configs for updating exsting item to the list.
                     */
                    _.set(dsConfigs, "transport.update", function (options) {
                        var self = this;

                        var itemId = _.get(options, "item.Id");
                        if (!(itemId > 0))
                            return $q.reject(String.format("Invalid itemId. Expect positive interger, but get {0}", itemId));

                        return $http
                            .post(this.$$getItemUrl(itemId), convertPostData(this.$$splist.$configs.listName, options.item, true), _.extendClone(this.$$defaultHttpConfigs().update(), options.httpConfigs))
                            // Because successful update will not return anything so that we have to get data manually.
                            .then(function () {
                                return self.get(itemId, options.httpConfigs);
                            });
                    });
                    /**
                     * Configs for removing item from the list.
                     */
                    _.set(dsConfigs, "transport.remove", function (options) {
                        return $http
                            .post(this.$$getItemUrl(options.itemId), undefined, _.extendClone(this.$$defaultHttpConfigs().remove(), options.httpConfigs))
                            .then(function (data) {
                                return data.data;   // should be nothing ("").
                            });
                    });

                    // CRUD.
                    /**
                     * (itemId[, httpConfigs])
                     */
                    _.set(dsConfigs, "get", function (itemId, httpConfigs) {
                        return this.$$invokeTransport("read", {
                            method: "get",
                            itemId: itemId,
                            httpConfigs: httpConfigs
                        });
                    });
                    /**
                     * ([[itemIds][, httpConfigs]])
                     */
                    _.set(dsConfigs, "getAll", function (itemIds, httpConfigs) {
                        var args = new ArgsParser([
                            {itemIds: "Array", httpConfigs: "Object"},
                            {httpConfigs: "Object"}
                        ]).parse(arguments);
                        if (_.any(args.itemIds)) {
                            httpConfigs = httpConfigs || {};

                            var idQuery = _.reduce(args.itemIds, function (memo, id, index) {
                                memo += String.format("(Id eq {0})", id);
                                memo += (index < args.itemIds.length - 1) ? " or " : "";
                                return memo;
                            }, "");

                            var filter = _.get(httpConfigs, "params.$filter", "");
                            filter = (!!filter) ? String.format("({0}) and ({1})", filter, idQuery) : idQuery;

                            _.set(httpConfigs, "params.$filter", filter);
                        }

                        return this.$$invokeTransport("read", {
                            method: "getList",
                            httpConfigs: httpConfigs
                        });
                    });
                    /**
                     * (item[, httpConfigs])
                     */
                    _.set(dsConfigs, "add", function (item, httpConfigs) {
                        return this.$$invokeTransport("create", {
                            item: item,
                            httpConfigs: httpConfigs
                        });
                    });
                    /**
                     * (item[, httpConfigs])
                     */
                    _.set(dsConfigs, "update", function (item, httpConfigs) {
                        return this.$$invokeTransport("update", {
                            item: item,
                            httpConfigs: httpConfigs
                        });
                    });
                    /**
                     * (itemId[, httpConfigs])
                     */
                    _.set(dsConfigs, "remove", function (itemId, httpConfigs) {
                        return this.$$invokeTransport("remove", {
                            itemId: itemId,
                            httpConfigs: httpConfigs
                        });
                    });

                    // Utils
                    /**
                     * Get list Rest url.
                     */
                    _.set(dsConfigs, "$$getListUrl", function () {
                        return String.format("{0}/_api/lists/getByTitle('{1}')", this.$$splist.$configs.siteUrl, this.$$splist.$configs.listName);
                    });
                    /**
                     * Get item Rest url.
                     * If !itemId -> get all items Rest url.
                     * @param itemId
                     */
                    _.set(dsConfigs, "$$getItemUrl", function (itemId) {
                        var url = this.$$getListUrl() + "/items";
                        url += (itemId > 0) ? String.format("({0})", itemId) : "";
                        return url;
                    });
                    /**
                     * Get the transport configurations.
                     * @param transportName
                     * @returns {*|{headers}}
                     */
                    _.set(dsConfigs, "$$getTransport", function (transportName) {
                        var transportConfigs = _.get(this, "transport." + transportName);
                        if (!transportConfigs)
                            throw new Error(String.format("No {0} transport configurations.", transportName));

                        return transportConfigs;
                    });
                    /**
                     * Call the transport configurations.
                     * @param transportName
                     * @returns {*}
                     */
                    _.set(dsConfigs, "$$invokeTransport", function (transportName) {
                        var transport = this.$$getTransport(transportName);
                        if (_.isFunction(transport)) {
                            return $q.when(transport.apply(this, _.rest(arguments)));
                        }
                    });
                    /**
                     * Get default `httpConfigs`.
                     */
                    _.set(dsConfigs, "$$defaultHttpConfigs", function () {
                        var self = this;
                        return {
                            create: function () {
                                return {
                                    headers: {
                                        "accept": "application/json;odata=verbose",
                                        "content-type": "application/json;odata=verbose",
                                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                                    }
                                }
                            },
                            get: function () {
                                return _.extend(getQueryConfigs(), {
                                    headers: {
                                        accept: "application/json;odata=verbose"
                                    }
                                });
                            },
                            update: function () {
                                return _.extend(getQueryConfigs(), {
                                    headers: {
                                        "accept": "application/json;odata=verbose",
                                        "content-type": "application/json;odata=verbose",
                                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                        "IF-MATCH": "*",
                                        "X-HTTP-Method": "MERGE"
                                    }
                                });
                            },
                            remove: function () {
                                return {
                                    headers: {
                                        "accept": "application/json;odata=verbose",
                                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                                        "IF-MATCH": "*",
                                        "X-HTTP-Method": "DELETE"
                                    }
                                }
                            }
                        };

                        function getQueryConfigs() {
                            var configs = {};

                            if (_.any(self.$$splist.$configs.select))
                                _.set(configs, "params.$select", self.$$splist.$configs.select.join(","));
                            if (_.any(self.$$splist.$configs.expand))
                                _.set(configs, "params.$expand", self.$$splist.$configs.expand.join(","));

                            return configs;
                        }
                    });

                    return dsConfigs;
                }();

                return $DataSource.extend(dataSourceConfigs);
            }
        ]);

})(angular, wizer, _);
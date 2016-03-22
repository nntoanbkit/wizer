var wizer = wizer || {};
wizer.sharepoint = function (sharepoint, _) {
    "use strict";

    var SPListField = wizer.Class.extend({
        /**
         * Create a new field with name and field configs.
         * @param {String} name - name of the field.
         * @param {Object} configs - optional field configurations.
         */
        init: function (name, configs) {
            if (!_.isString(name))
                throw new Error("Expect name is a string, but got " + name);

            this.name = name;
            _.defaultsDeep(this, configs, {
                /**
                 * Type of value of this field.
                 * The avaible options are:
                 *  - lookup
                 *  - multilookup
                 *  - datetime
                 *  - json
                 *  - "" (default value)
                 */
                type: "",
                /**
                 * Get this field from server but does not update its value when save.
                 * @type {Boolean}
                 */
                readonly: false,
                /**
                 * Expand if this is lookup field.
                 * If value is `true` then default lookup field is `Id` and `Title`.
                 * @type {Boolean|String|Array<String>}
                 */
                expand: false,
                /**
                 * Parsing configurations.
                 */
                parsers: {
                    /**
                     * Parse value of request object.
                     * @param {*} value - the value of this field of request object.
                     * @param {Object} request - the request object.
                     * @returns {Promise|*} - if the return value is `undefined` or promise which resolve to
                     * `undefined` then the field is left intact. Otherwise, new value will be assigned to this field.
                     * It's use full when you want to delete/rename some properties of request object.
                     */
                    request: null,
                    /**
                     * Parse value of request object.
                     * @param {*} value - the value of this field of reponse object.
                     * @param {Object} reponse - the reponse object.
                     * @returns {Promise|*} - if the return value is `undefined` or promise which resolve to
                     * `undefined` then the field is left intact. Otherwise, new value will be assigned to this field.
                     * It's use full when you want to delete/rename some properties of reponse object.
                     */
                    response: null
                }
            });

            // Normalize configs
            this.$normalizeConfigs();
        },

        // Protected methods
        $normalizeConfigs: function () {
            makeArray(this.parsers, "request");
            makeArray(this.parsers, "response");

            function makeArray(obj, prop) {
                obj[prop] = function () {
                    var value = obj[prop];

                    if (_.isArray(value)) return value;
                    if (null != value) return [value];
                    return [];
                }();
            }
        }
    });

    /**
     * Normalize SPList fields configurations.
     * @param fieldConfigs
     * @returns {*}
     */
    SPListField.parseConfigs = function (fieldConfigs) {
        if (_.isArray(fieldConfigs)) {
            return _.map(fieldConfigs, function (field) {
                if (_.isString(field)) return new SPListField(field);
                if (_.isObject(field)) return new SPListField(field.name, field);
            });
        }

        if (_.isObject(fieldConfigs)) {
            return _.map(fieldConfigs, function (config, key) {
                return new SPListField(key, config);
            });
        }

        return [];
    };

    sharepoint.SPListField = SPListField;
    return sharepoint;
}(wizer.sharepoint || {}, _);
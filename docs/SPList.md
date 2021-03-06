# SPList class
Represent a list on a Microsoft SharePoint Foundation Web site. SPList instances use SharePoint REST service to interact with the real list on the web site.
 
## Table of contents

- [Usage](#usage)
- [Configurations](#configurations)
- [Instance methods](#instance-methods)
    - [get](#getitemid-httpconfigs)
    - [create](#createitem-httpconfigs)
    - [update](#updateitem-httpconfigs)
    - [remove](#removeitemid-httpconfigs)

## Usage

````javascript
angular
    .module("myApp", ["wizer"])
    .controller("MainController", ["$scope", "$$SPList",
        function ($scope, $$SPList) {
            $scope.vm = {};
            
            var roomList = new $$SPList({
                siteUrl: "dev.fanxipan.net",
                listName: "Rooms"
            });
            
            roomList.getAll().then(function (allRooms) {
                $scope.vm.allRooms = allRooms;
            });
        }
    ]);
````

## Configurations
Create a new instance of SPList class.

````javascript
var list = new $$SPList(configs);
````
 
The `configs` object has the following properties:

Property        | Type          | Details    
--------------- | ------------- | --------------------------------------------
siteUrl         | `String`      | The url of the web where the the list is on.
listName        | `String`      | Display name of the list.

## Instance methods

### get(itemId[, httpConfigs])
Get the item with specified id on the list.

**Parameters**

Param                       | Type          | Details
--------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------
itemId                      | `Number`      | The id of the item want to retrieve.
httpConfigs *(optional)*    | `Object`      | The httpConfigs object used by `$http` service. Set this object will overwrite the default configurations.

**Return**

Type        | Details
----------- | -----------------------------------------------------------------------
`Promise`   | A promise object which will resolve to a list item when get successful.

### create(item[, httpConfigs])
Create a new item on the list.

**Parameter**

Param                       | Type          | Details
--------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------
item                        | `Object`      | The item to add to the list.<br/> **Note:** The `Id`, `ID` properties of `item` object will be ignored if presence.
httpConfigs *(optional)*    | `Object`      | The httpConfigs object used by `$http` service. Set this object will overwrite the default configurations.

**Return**

Type        | Details
----------- | ---------------------------------------------------------------------------------
`Promise`   | A promise object which will resolve to newly created item when create successful.

### update(item[, httpConfigs])
Update an existing item on the list.

**Parameter**

Param                       | Type          | Details
--------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------
item                        | `Object`      | The item to update.<br/> **Note:** The `item` object must have `Id` property to work correctly.
httpConfigs *(optional)*    | `Object`      | The httpConfigs object used by `$http` service. Set this object will overwrite the default configurations.

**Return**

Type        | Details
----------- | ---------------------------------------------------------------------------
`Promise`   | A promise object which will resolve to updated item when update successful.

### remove(itemId[, httpConfigs])
Remove (delete) an existing item from the list.

**Parameter**

Param                       | Type          | Details
--------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------
itemId                      | `Number`      | The `Id` of the item to be removed.
httpConfigs *(optional)*    | `Object`      | The httpConfigs object used by `$http` service. Set this object will overwrite the default configurations.

**Return**

Type        | Details
----------- | -----------------------------------------------------------
`Promise`   | A promise object which will resolve when remove successful.

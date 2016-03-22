# SPList class
Represent a list on a Microsoft SharePoint Foundation Web site. SPList instances use SharePoint REST service to interact with the real list on the web site.

## Inheritance hierarchy
- [wizer.Class](/docs/wizer/core/Class.md)
    - wizer.sharepoint.SPList
        - [wizer.sharepoint.AngularSPList](/docs/wizer/sharepoint/AngularSPList.md)
            - [wizer.sharepoint.AngularDocumentLibrary](/docs/wizer/sharepoint/AngularSPDocumentLibrary.md)
 
## Table of contents

- [Instance methods](#instance-methods)
    - [define](#definelistconfigs)

## Instance methods

### define(listConfigs)
Create new list instance with new list configurations. Old configs options if overritten if new ones are presences.

**Parameter**

Param           | Type          | Details
--------------- | ------------- | --------------------------------------------------
listConfigs     | `Object`      | New [list configurations object](#configurations).

**Return**

Type        | Details
----------- | ----------------------------------------
`Object`    | A list instance with new configurations.

**Example**

````javascript
// The base list instance.
var roomList = new $SPList({
    siteUrl: "http://rooms.net",
    listName: "Rooms"
});

// Inherit all functionalities of `roomList` but point to another list ("VIPRooms").
var vipRoomList = roomList.define({
    listName: "VIPRooms"
});
````
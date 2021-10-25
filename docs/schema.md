# WASP API GraphQL Schema

This document describes the GraphQL API schema for `wasp-api`

<details>
  <summary><strong>Table of Contents</strong></summary>

  * [Query](#query)
  * [Mutation](#mutation)
  * [Objects](#objects)
    * [IngestConfiguration](#ingestconfiguration)
    * [JWT](#jwt)
    * [NotificationPreferences](#notificationpreferences)
    * [Reading](#reading)
    * [Thing](#thing)
    * [ThingDataset](#thingdataset)
    * [UpdatedAt](#updatedat)
    * [User](#user)
  * [Inputs](#inputs)
    * [DatasetsFilterInput](#datasetsfilterinput)
    * [IngestConfigurationInput](#ingestconfigurationinput)
    * [NotificationPreferencesInput](#notificationpreferencesinput)
    * [ReadingsFilterInput](#readingsfilterinput)
    * [ThingInput](#thinginput)
    * [UpdateThingInput](#updatethinginput)
  * [Enums](#enums)
    * [ThingStatus](#thingstatus)
    * [UserType](#usertype)
  * [Scalars](#scalars)
    * [Boolean](#boolean)
    * [Date](#date)
    * [Float](#float)
    * [Int](#int)
    * [JSON](#json)
    * [String](#string)

</details>

## Query
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>thing</strong></td>
<td valign="top"><a href="#thing">Thing</a></td>
<td>

Get a single thing identified by the provided uuid

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">uuid</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The identifier of the desired thing

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>things</strong></td>
<td valign="top">[<a href="#thing">Thing</a>!]!</td>
<td>

Get things in the system

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Get the currently authenticated user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>users</strong></td>
<td valign="top">[<a href="#user">User</a>!]!</td>
<td>

Get users in the system. (Admin only)

</td>
</tr>
</tbody>
</table>

## Mutation
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>login</strong></td>
<td valign="top"><a href="#jwt">JWT</a>!</td>
<td>

Authenticates a user in the system

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">password</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createThing</strong></td>
<td valign="top"><a href="#thing">Thing</a>!</td>
<td>

Register a new thing to the system

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">thing</td>
<td valign="top"><a href="#thinginput">ThingInput</a>!</td>
<td>

The description of the thing to be created

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateThing</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Updates the metadata of a thing in the system

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">uuid</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The identifier of the thing to update

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">thing</td>
<td valign="top"><a href="#updatethinginput">UpdateThingInput</a>!</td>
<td>

Description of the update to the thing

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createUser</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

Register a new user to the system (Admin only)

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The username of the new user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">email</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The email address of the new user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">isAdmin</td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Whether the new user should also be an Admin user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUserNotificationPreferences</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Updates the notification preferences for the currently authenticated user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">notificationPreferences</td>
<td valign="top"><a href="#notificationpreferencesinput">NotificationPreferencesInput</a>!</td>
<td>

The current users new notification preferences

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUserPassword</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Updates the password of the currently authenticated user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">password</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The current user's new password

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>resetUserPassword</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Reset the specified users password. Sends the user an email requiring them to update their password (Admin only)

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The username of the user to reset

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUserType</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Update the type of the specified user. Can be used to change the user type to/from admin and to remove a user (Admin only)

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The username of the target user

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">type</td>
<td valign="top"><a href="#usertype">UserType</a>!</td>
<td>

The type to set the target user to

</td>
</tr>
</tbody>
</table>

## Objects

### IngestConfiguration

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>ingest</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the ingest the thing can send data via

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ingestId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

Identifier of the new thing for the ingest

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>configuration</strong></td>
<td valign="top"><a href="#json">JSON</a>!</td>
<td>

The network configuration of the new thing for the ingest

</td>
</tr>
</tbody>
</table>

### JWT

Javascript Web Token

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>expires</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>token</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### NotificationPreferences

User notification preferences

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>receiveWarnings</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Does the user receive emails for warning events

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>receiveAlerts</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Does the user receive emails for alert events

</td>
</tr>
</tbody>
</table>

### Reading

Represent a value of a dataset made at a specific timestamp

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>timestamp</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td>

The timestamp the reading was made at

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>value</strong></td>
<td valign="top"><a href="#float">Float</a></td>
<td>

The value associated with the reading

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>thing</strong></td>
<td valign="top"><a href="#thing">Thing</a>!</td>
<td>

The thing that generated this reading

</td>
</tr>
</tbody>
</table>

### Thing

A generic IoT Thing

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>uuid</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The identifier for the thing

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The type of thing

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ingests</strong></td>
<td valign="top">[<a href="#ingestconfiguration">IngestConfiguration</a>!]!</td>
<td>

The ingest configuration for the thing

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>datasets</strong></td>
<td valign="top">[<a href="#thingdataset">ThingDataset</a>!]!</td>
<td>

Time series datasets measured from this thing

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#datasetsfilterinput">DatasetsFilterInput</a></td>
<td>

(Optional) filter for datasets

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#thingstatus">ThingStatus</a>!</td>
<td>

The connectivity status of the thing

</td>
</tr>
</tbody>
</table>

### ThingDataset

A dataset for a thing

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>thing</strong></td>
<td valign="top"><a href="#thing">Thing</a>!</td>
<td>

thing that the dataset is associated with

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The type of the measurement in the dataset (e.g. temperature)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>label</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

A label describing the semantic meaning of the dataset (e.g. air_temperature)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readings</strong></td>
<td valign="top">[<a href="#reading">Reading</a>!]!</td>
<td>

The readings for this dataset

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#readingsfilterinput">ReadingsFilterInput</a>!</td>
<td>

(Optional) filter for readings

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>count</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td>

The readings count for this dataset

</td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">filter</td>
<td valign="top"><a href="#readingsfilterinput">ReadingsFilterInput</a>!</td>
<td>

(Optional) filter for readings

</td>
</tr>
</tbody>
</table>

### UpdatedAt

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>region</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>timestamp</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### User

A user

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>username</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The unique username of the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

The email address of the user. Should be not null (see WASP-64)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#usertype">UserType</a>!</td>
<td>

Type of the user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td>

Timestamp at which the user was created

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>passwordExpiry</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td>

Timestamp when the user's password will expire

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdBy</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td>

The user that created this user

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>notificationPreferences</strong></td>
<td valign="top"><a href="#notificationpreferences">NotificationPreferences</a>!</td>
<td>

Notification preferences of this user

</td>
</tr>
</tbody>
</table>

## Inputs

### DatasetsFilterInput

Used to filter dataset types

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>types</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td>

The types and labels of datasets to return

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>labels</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### IngestConfigurationInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>ingest</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The name of the ingest the thing can send data via

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ingestId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td>

(Optional) Overrides thingId as the Identifier of the thing for the ingest

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>configuration</strong></td>
<td valign="top"><a href="#json">JSON</a>!</td>
<td>

The network configuration of the new thing for the ingest

</td>
</tr>
</tbody>
</table>

### NotificationPreferencesInput

Specifier for user notification preferences

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>receiveWarnings</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Whether the user should receive email alerts for warning events

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>receiveAlerts</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td>

Whether the user should receive email alerts for alert events

</td>
</tr>
</tbody>
</table>

### ReadingsFilterInput

Used to filter the reading ranges returned for a given dataset

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>limit</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td>

(Optional) limit on the number of results returned (maximum 100000)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>startTimestamp</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td>

(Optional) Includes only readings after this time (exclusive)

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>endTimestamp</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td>

(Optional) Includes only readings before this time (inclusive)

</td>
</tr>
</tbody>
</table>

### ThingInput

Description of a thing to create

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td>

The type of the new thing

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ingests</strong></td>
<td valign="top">[<a href="#ingestconfigurationinput">IngestConfigurationInput</a>!]!</td>
<td>

Ingest configuration for the new thing

</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>metadata</strong></td>
<td valign="top"><a href="#json">JSON</a></td>
<td>

Metadata for configuring the thing

</td>
</tr>
</tbody>
</table>

### UpdateThingInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>metadata</strong></td>
<td valign="top"><a href="#json">JSON</a></td>
<td>

Metadata for configuring the thing

</td>
</tr>
</tbody>
</table>

## Enums

### ThingStatus

The connectivity status of a thing

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>neverConnected</strong></td>
<td>

The thing has never been seen

</td>
</tr>
<tr>
<td valign="top"><strong>offline</strong></td>
<td>

The thing has been seen but has not communicated as recently as expected

</td>
</tr>
<tr>
<td valign="top"><strong>online</strong></td>
<td>

The thing has communicated recently as expected

</td>
</tr>
</tbody>
</table>

### UserType

Type of a user

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>admin</strong></td>
<td>

An administrator who can add/reset/remove users

</td>
</tr>
<tr>
<td valign="top"><strong>user</strong></td>
<td>

A regular user of the system

</td>
</tr>
<tr>
<td valign="top"><strong>removed</strong></td>
<td>

A former user of the system

</td>
</tr>
</tbody>
</table>

## Scalars

### Boolean

The `Boolean` scalar type represents `true` or `false`.

### Date

Date custom scalar type

### Float

The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).

### Int

The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.

### JSON

The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).

### String

The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.


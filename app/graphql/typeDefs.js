const { gql } = require('apollo-server-express')

const typeDefs = gql`
  # directive definition used by arrayLengthDirective
  directive @maxArrayLength(length: Int!) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
  directive @boundedInteger(min: Int!, max: Int!) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

  type Query {
    "Get a single thing identified by the provided uuid"
    thing("The identifier of the desired thing" uuid: String!): Thing
    "Get things in the system"
    things: [Thing!]!
    "Get the currently authenticated user"
    user: User!
    "Get users in the system. (Admin only)"
    users: [User!]!
  }

  type Mutation {
    "Register a new thing to the system"
    createThing("The description of the thing to be created" thing: ThingInput!): Thing!
    "Updates the metadata of a thing in the system"
    updateThing(
      "The identifier of the thing to update"
      uuid: String!
      "Description of the update to the thing"
      thing: UpdateThingInput!
    ): Boolean!
    "Register a new user to the system (Admin only)"
    createUser(
      "The username of the new user"
      username: String!
      "Whether the new user should also be an Admin user"
      isAdmin: Boolean!
    ): NewUser!
    "Updates the password of the currently authenticated user"
    updateUserPassword("The current user's new password" password: String!): Boolean!
    "Reset the specified users password. (Admin only)"
    resetUserPassword("The username of the user to reset" username: String!): String!
    "Update the type of the specified user. Can be used to change the user type to/from admin and to remove a user (Admin only)"
    updateUserType(
      "The username of the target user"
      username: String!
      "The type to set the target user to"
      type: UserType!
    ): Boolean!
  }

  "Description of a thing to create"
  input ThingInput {
    "The type of the new thing"
    type: String!
    "Ingest configuration for the new thing"
    ingests: [IngestConfigurationInput!]!
    "Metadata for configuring the thing"
    metadata: JSON = null
  }

  input IngestConfigurationInput {
    "The name of the ingest the thing can send data via"
    ingest: String!
    "(Optional) Overrides thingId as the Identifier of the thing for the ingest"
    ingestId: String = null
    "The network configuration of the new thing for the ingest"
    configuration: JSON!
  }

  input UpdateThingInput {
    "Metadata for configuring the thing"
    metadata: JSON
  }

  "Javascript Web Token"
  type JWT {
    expires: Date!
    token: String!
  }

  type UpdatedAt {
    region: String!
    type: String!
    timestamp: Date!
  }

  "The connectivity status of a thing"
  enum ThingStatus {
    "The thing has never been seen"
    neverConnected
    "The thing has been seen but has not communicated as recently as expected"
    offline
    "The thing has communicated recently as expected"
    online
  }

  "A generic IoT Thing"
  type Thing {
    "The identifier for the thing"
    uuid: String!
    "The type of thing"
    type: String!
    "The ingest configuration for the thing"
    ingests: [IngestConfiguration!]!
    "Time series datasets measured from this thing"
    datasets("(Optional) filter for datasets" filter: DatasetsFilterInput = null): [ThingDataset!]!
    "The connectivity status of the thing"
    status: ThingStatus!
  }

  "Used to filter dataset types"
  input DatasetsFilterInput {
    "The types and labels of datasets to return"
    types: [String!] = null @maxArrayLength(length: 10)
    labels: [String!] = null @maxArrayLength(length: 10)
  }

  "Used to filter the reading ranges returned for a given dataset"
  input ReadingsFilterInput {
    "(Optional) limit on the number of results returned (maximum 100000)"
    limit: Int = 100000 @boundedInteger(min: 1, max: 100000)
    "(Optional) Includes only readings after this time (exclusive)"
    startTimestamp: Date = null
    "(Optional) Includes only readings before this time (inclusive)"
    endTimestamp: Date = null
  }

  type IngestConfiguration {
    "The name of the ingest the thing can send data via"
    ingest: String!
    "Identifier of the new thing for the ingest"
    ingestId: String!
    "The network configuration of the new thing for the ingest"
    configuration: JSON!
  }

  "A dataset for a thing"
  type ThingDataset {
    "thing that the dataset is associated with"
    thing: Thing!
    "The type of the measurement in the dataset (e.g. temperature)"
    type: String!
    "A label describing the semantic meaning of the dataset (e.g. air_temperature)"
    label: String!
    "The readings for this dataset"
    readings("(Optional) filter for readings" filter: ReadingsFilterInput! = {}): [Reading!]!
    "The readings count for this dataset"
    count("(Optional) filter for readings" filter: ReadingsFilterInput! = {}): Int!
  }

  "Represent a value of a dataset made at a specific timestamp"
  type Reading {
    "The timestamp the reading was made at"
    timestamp: Date!
    "The value associated with the reading"
    value: Float
    "The thing that generated this reading"
    thing: Thing!
  }

  "A user"
  type User {
    "The unique username of the user"
    username: String!
    "Type of the user"
    type: UserType!
    "Timestamp at which the user was created"
    createdAt: Date!
    "The user that created this user"
    createdBy: User!
  }

  "A new user"
  type NewUser {
    "The unique username of the user"
    username: String!
    "Type of the user"
    type: UserType!
    "Timestamp at which the user was created"
    createdAt: Date!
    "The password for the new user"
    password: String!
    "The user that created this user"
    createdBy: User!
  }

  "Type of a user"
  enum UserType {
    "An administrator who can add/reset/remove users"
    admin
    "A regular user of the system"
    user
    "A former user of the system"
    removed
  }

  scalar Date

  scalar JSON
`

module.exports = typeDefs

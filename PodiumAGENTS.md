This file is simply the list of documentation I have found in their API references for you to use as we create our messaging system.

The webhook object
A webhook.

Attribute	Type	Description
disabled	boolean	Whether the webhook is disabled or not.
url	string	URL that webhook events will be sent to.
secret	string	Secret used to sign webhook events.
uid	string	Podium unique identifier for webhook.
organizationUid	string	Podium unique identifier for location.
locationUid	string	Podium unique identifier for location.
createdAt	string	When the webhook was created.
updatedAt	string	When the webhook was last updated.
eventTypes	array[string]	Event types that will be sent to webhook. Possible values: ["contact.created", "contact.deleted", "contact.merged", "contact.unchanged", "contact.updated", "invoice.created", "invoice.disabled", "invoice.marked_as_paid", "invoice.payment_created", "invoice.payment_failed", "invoice.payment_succeeded", "invoice.refund_created", "invoice.refund_failed", "message.failed", "message.received", "message.sent", "review.created", "review.invite_link_created", "review.invite_link_updated", "review.response_created", "review.response_updated", "review.updated"]
JSON

{
  "disabled": false,
  "url": "https://www.podium.com/",
  "secret": "",
  "uid": "00000000-0000-0000-0000-000000000000",
  "organizationUid": "00000000-0000-0000-0000-000000000000",
  "locationUid": "00000000-0000-0000-0000-000000000000",
  "createdAt": "2015-01-23T23:50:07Z",
  "updatedAt": "2015-01-23T23:50:07Z",
  "eventTypes": [
    "contact.created"
  ]
}

reate a webhook.
post
https://api.podium.com/v4/webhooks

Create a new webhook to receive events from a location or an organization. One of locationUid or
organizationUid is required. If both are given the organizationUid will be used.

Required scope: The required scope(s) will depend on the event type(s) you are subscribing too. See the WEBHOOK EVENT TYPES section.

Body Params
Create webhook params

eventTypes
array of strings
required
length ≥ 1

string


contact.created

ADD string
locationUid
uuid
Podium unique identifier for location.

organizationUid
uuid
Podium unique identifier for organization.

secret
string
Secret used to sign webhook events.

url
string | null
required
URL that webhook events will be sent to.

Responses

200
Successful response.


default
Error response.

Update a webhook.
put
https://api.podium.com/v4/webhooks/{uid}

Updates an existing webhook.
The location uid and organization uid cannot be updated.
All other parameters not provided will be left unchanged.

Required scope: The required scope(s) will depend on the event type(s) you are subscribing too. See the WEBHOOK EVENT TYPES section.

Path Params
uid
uuid
required
Podium unique identifier for webhook.

Body Params
Update webhook params

disabled
boolean
Disable or enable the webhook.


eventTypes
array of strings
length ≥ 1

string


contact.created

ADD string
secret
string
Secret used to sign webhook events.

url
string | null
URL that webhook events will be sent to.

Responses

200
Successful response.


default
Error response.

Callback
Updated about 2 years ago

Get a conversation lead ID.
get
https://api.podium.com/v4/conversations/{location_uid}/{organization_uid}/{conversation_uid}


Gets a conversation lead ID.

Required scope: read_messages.

Path Params
location_uid
uuid
required
Podium unique identifier for location.

organization_uid
uuid
required
Podium unique identifier for organization.

conversation_uid
uuid
required
Podium unique identifier for conversation.

Responses

200
Successful response.


default
Error response.

Callback


Message
All message event types will be in the message object format and require the read_messages scope.

Event Type	Description
message.failed	When a message request is accepted but failed to send to the customer.
message.received	When a message is received by a Podium location.
message.sent	When a message is sent by a Podium location.
Updated about 4 years ago

What’s Next
The message object



Authentification Details

Authentication
The Podium API uses OAuth 2 to authenticate requests. You can read more about how to go through the OAuth 2 flow in this documentation.

You will need to pass an Authorization header using the bearer authentication scheme.

Your OAuth credentials carry many privileges, so be sure to keep them secure! Do not share your secret credentials in publicly accessible areas such as GitHub, client-side code, and so forth.

All API requests must be made over HTTPS. Calls made over plain HTTP will fail. API requests without authentication will also fail.




Example Request

curl --request GET \
  --url 'https://api.podium.com/v4/example' \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'Content-Type: application/json'
📘
Get YOUR_ACCESS_TOKEN via OAuth

Follow our OAuth guide to get your access token.


Response Body
Format
All responses will be an object with fields data and metadata. data will be the resource while metadata will be any extra fields related to the resource. metadata will always include url and version.

Unpopulated arrays are always [], unpopulated objects are always {}, and all other unpopulated fields are null.

Responses follow a must ignore processing model, where clients are expected to ignore data fields they don't understand.

Dates and timestamps
All temporal fields in the API are encoded in ISO 8601 format and are by definition always treated as UTC. The most common time fields in the API are createdAt and updatedAt.




Example Response Body

{
  "data": {
    "uid": "00000000-0000-0000-0000-000000000000",
    "firstName": "Brent",
    "lastName": "Roberts"
  },
  "metadata": {
    "url": "https://api.podium.com/v4/example",
    "version": "2021.04.01"
  }
}
Updated over 4 years ago

Authentication
Pagination
Did this page help you?


Pagination
Many top-level API resources have support for bulk fetches via “list” API methods. These list API requests share a common structure, taking at least these two parameters: limit and cursor. The responses also share a common structure having data as an array of items, and metadata containing nextCursor.

Parameters
Parameter	Required	Default	Description
Limit	false	10	A limit on the number of items to be returned, between 1 and 100.
cursor	false		A cursor for use in pagination. cursor is an opaque string that defines your place in the list. List response metadata will contain a nextCursor and previousCursor that can be used to move forwards or backwards on a subsequent request.
Response metadata
Field	Description
nextCursor	Can be used in subsequent requests to paginate forwards.



Example Response Body

{
  "data": [
    {},
    {}
  ],
  "metadata": {
    "nextCursor": "f2d78bd077984ca99ce29c51b68e51a249f56e4d5"
  }
}
Updated over 3 years ago

Response Body
HTTP Status Codes
Did this page help you?


HTTP Status Codes
Every API response will have an HTTP status code.

200 - OK: The request was successful.
202 - Accepted: The request has been accepted for processing, but the processing has not been completed.
400 - Bad Request: The request was unacceptable, often due to a missing or invalid parameter.
401 - Unauthorized: The authentication header was not provided or is not a valid client for this request.
403 - Forbidden: The authentication header does not have permission to make the request. This could be due to scopes or attempting an action on a resource you don't have access to.
404 - Not Found: The requested resource doesn't exist.
429 - Rate Limited: You have made too many requests within the threshold timeframe. Most endpoints are rate limited to 300 requests per minute.
500 - Internal Server Error: Something went wrong on our end; this is rare. Contact Support.

The user object
Attribute	Type	Description
role	string	The current positon of the user in the company.
uid	string	Podium unique identifier for user.
email	string	The email of the current user.
locations	array	All locations the user is assigned to.
locations[].uid	string	Podium unique identifier for location.
archived	boolean	Weather the current user is archived.
phone	string	The phone number of the user.
createdAt	string	When the user was created.
updatedAt	string	When the user was updated.
firstName	string	The first name of the current user.
lastName	string	The last name of the current user.
JSON

{
  "role": "Account Owner",
  "uid": "00000000-0000-0000-0000-000000000000",
  "email": "bob.ross@gmail.com",
  "locations": [
    {
      "uid": "00000000-0000-0000-0000-000000000000"
    }
  ],
  "archived": false,
  "phone": "+18013586533",
  "createdAt": "2015-01-23T23:50:07Z",
  "updatedAt": "2015-01-23T23:50:07Z",
  "firstName": "Bob",
  "lastName": "Ross"
}
Updated 11 months ago

Get an organization.
List all users.
Did this page help you?




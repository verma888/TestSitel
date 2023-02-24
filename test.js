const AWS = require('aws-sdk');
AWS.config.update( {
  region: 'ap-southeast-2'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'users_table';

const userPath = '/user';
const usersPath = '/users';

exports.handler = async function(event) {
  console.log('Request event: ', event);
  let response;
  switch(true) {
    
    case event.httpMethod === 'GET' && event.path === userPath:
      response = await getUser(event.queryStringParameters.id);
      break;
    case event.httpMethod === 'GET' && event.path === usersPath:
      response = await getUsers();
      break;
    case event.httpMethod === 'POST' && event.path === userPath:
      response = await saveUser(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PUT' && event.path === userPath:
     const resBody = JSON.parse(event.body);
      response = await modifyUser(resBody.id, resBody.updateKey, resBody.updateValue);
      break;
    case event.httpMethod === 'DELETE' && event.path === userPath:
      response = await deleteUser(JSON.parse(event.body).id);
      break;
    default:
      response = buildResponse(404, '404 Not Found');
  }
  return response;
}

async function getUser(id) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'id': id
    }
  }
  return await dynamodb.get(params).promise().then((response) => {
    return buildResponse(200, response.Item);
  }, (error) => {
    console.error('Error: ', error);
  });
}

async function getUsers() {
  const params = {
    TableName: dynamodbTableName
  }
  const allUsers = await scanDynamoRecords(params, []);
  const body = {
    users: allUsers
  }
  return buildResponse(200, body);
}

async function scanDynamoRecords(scanParams, itemArray) {
  try {
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    return itemArray;
  } catch(error) {
    console.error('Error: ', error);
  }
}

async function saveUser(requestBody) {
  const params = {
    TableName: dynamodbTableName,
    Item: requestBody
  }
  return await dynamodb.put(params).promise().then(() => {
    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
      Item: requestBody
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('Error: ', error);
  })
}

async function modifyUser(id, updateKey, updateValue) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'id': id
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue
    },
    ReturnValues: 'UPDATED_NEW'
  }
  return await dynamodb.update(params).promise().then((response) => {
    const body = {
      Operation: 'UPDATE',
      Message: 'SUCCESS',
      UpdatedAttributes: response
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('Error: ', error);
  })
}

async function deleteUser(id) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      'id': id
    },
    ReturnValues: 'ALL_OLD'
  }
  return await dynamodb.delete(params).promise().then((response) => {
    const body = {
      Operation: 'DELETE',
      Message: 'SUCCESS',
      Item: response
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error('Error: ', error);
  })
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/JSON'
    },
    body: JSON.stringify(body)
  }
}

# TestSitel
Created demo user API. Below are the end points.

1. To fetch all the users 
method : GET  route: /users
https://brr8v4xyie.execute-api.ap-southeast-2.amazonaws.com/Dev/users

2. To find one user with specific id.
method : GET  params : id = 2  route: /user
https://brr8v4xyie.execute-api.ap-southeast-2.amazonaws.com/Dev/user

3. To save new user
method : POST  route : /user
https://brr8v4xyie.execute-api.ap-southeast-2.amazonaws.com/Dev/user
Req.body ={

    "id" : "7",
    "name" : "Rahul Sevta",
    "email" : "rahul@gmail.com",
    "dob" : "12/10/2000"
}



//output : {
    "Operation": "SAVE",
    "Message": "SUCCESS",
    "Item": {
        "id": "7",
        "name": "Rahul Sevta",
        "email": "rahul@gmail.com",
        "dob": "12/10/2000"
    }
}

4. To delete a user 
https://brr8v4xyie.execute-api.ap-southeast-2.amazonaws.com/Dev/user

req.body={
    "id" : "1"
}



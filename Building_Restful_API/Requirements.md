1.The API listeon on a port and accepts incoming HTTP request for POST,GET,PUT,DELETE and HEAD.

2.The API allows a client to connect,the create a new user,then edit and delete that user.

3.The API allows a user to sing in which gives them a token that they can use for subsequent authenticated requests.

4.The API allows to the user to sign out whin invalidates their token.

5.The API allows a signed-in user to use their token to create a new "check".

6.The API allows a signed-in user to edit or delete any of their checks.

7.In the background,workers perform all the "Checks" at the appropriate times,and send alerts to the users when a check changes its state from "up" to "down",or visa versa.

!!!For the purpose of the app instead of Db,File-system will be used as a key-value store.
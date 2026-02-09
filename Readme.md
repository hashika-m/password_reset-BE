BACKEND 

routes & controller logic with work flow:
1. /signup - Checks all the provided fields and verifies whether the user already exists. If the user does not exist, the registration is completed by hashing the user-provided password using bcrypt and storing it securely in the database.
2. /login - Check the users email and password. If exists the user data from database is obtained by their email,password in db is compared with inserted passord, If true a token is provided with expiring time of 1hr
3. /dashboard - based on user bearer token jwt token is verified and allow user to dashboard
4. /forgotPassword - enter the user email, if exixts in db provieds the mail with resetpassword link.
    In db the passwordToke, psswordResetExpires is provided 
    If user not exists or incorrect email shows err message and not db is not updated dynamically with psswordResetExpires, passwordRestToken
5. /resetPassword:token(the random string that is generated for user as passwordRestToken in db) -  by entering the newPAssword and confirmPassword in (body) the db password gets updated with encryted new-password with removal of PasswordResetToken and passwordResetExpires.
6. /login - email and new-password the user can login successfully  

<!-- local api endpoints port-->
BE-PORT=8000 for backend http req,res(API server) 
MailPORT=587 for etheral mail
FE-PORT =5173 (UI client)


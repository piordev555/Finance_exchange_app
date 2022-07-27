# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

## Upload build file to apps/danapay-webapp-v3

Make sure you have your ssh key uploaded to the digital ocean droplet.

```js
scp -r ./build/ danapay@157.230.117.52:/home/danapay/apps/danapay-webapp-v3
```

import 'react-app-polyfill/stable';
npm install react-app-polyfill core-js

### technologies

Toolchain => create-react-app
State management => redux toolkit
Ui framework => tailwind, bootstrap and material ui
Axios for => api requests

What is the difference in "is_active" and "is_verified" in user?
And what does mean "not verified"?
There are 2 types of user: company and individual. (Yes)
So if user is individual, "not verified" means having false value of "is_verified" field? And  "is_active" field? If user is in company, what is the condition meaning " not verified"?

company user 
Activated by danapay => becomes is_active
Verified when the documents are uploaded and verified => becomes is_verified
not verified is when the danapay admin hasnt verified the document.


individual user
Activated by danapay Admin => becomes is_active
Verified after sumsub response status by the admin  => becomes is_verified
not verified is if KYC failed 
Ionic App
=====================

Project in the Course Mobile Web Applications at HdM.
This app helps people to make better purchase decisions, based on feedback of there friends.

Tools, Frameworks we will use: Angular,Ionic, Sass, Docker, Node, ....

## Configuration
### Server IP:
If you don't use our Backend Server you have to change the Ip at the following point:
./www/js/services.js (Line 7, var myIoSocket = io.connect('http://46.101.122.130:3000');)


## Using this project

Requirements:
```bash
$ npm install -g cordova ionic
```


Live preview of the app in the web browser first time: (init setup)
```bash
$ npm install
$ bower install
$ ionic state reset
$ ionic resources
$ ionic serve
```



Build and Emulate the first time:
(Keep in mind you need you phone connected and developer options enabled on android or you have an emulator up and running)

```bash 
$ ionic run android
$ ionic run ios
```

##Programming Team: 
  - Christop Muth
  - Sylwia Calka
  - Moritz Gruber
## Mentors: 
  - Ansgar Gerlicher
  - Fankhauser Thomas
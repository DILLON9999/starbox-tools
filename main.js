const electron = require('electron');
const path = require('path');
const url = require('url');
const Discord = require('discord.js');
const request = require('request');

process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain, remote} = electron;

let mainWindow;

let linkID;
let linkKeyword = 'https://';
let linkToken;

let joinerDelay = 0;
let joinerID;
let joinerMonitor;
let joinerJoiner;

let client;
let clientTwo;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({
        width: 810,
        height: 660,
        frame: false,
        resizable: false,
        show: false
    });
    // Load html in window
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes:true
    }));
    // Load Page When Rendered
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    // Quit app when closed
    mainWindow.on('closed', function(){
      app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Close Program
ipcMain.on('close:program', function(){
  app.quit()
})

// Minimize Program
ipcMain.on('minimize:program', function(){
  mainWindow.minimize();
})

// Catch Link Opener ID
ipcMain.on('linkid:add', function(e, itemOne){
  linkID = itemOne;
  console.log(linkID)
})

// Catch Link Opener Keyword
ipcMain.on('linkkw:add', function(e, itemTwo){
  linkKeyword = itemTwo;
  console.log(linkKeyword)
})

// Catch Link Discord Token
ipcMain.on('linktoken:add', function(e, itemThree){
  linkToken = itemThree;
  console.log(linkToken)
})

// Start Link Opener On Button Press
ipcMain.on('linkopener:start', function() {

  client = new Discord.Client();

  console.log('turning on')
  client.on('ready', () => {
    let linkUser = client.user.tag;
    console.log(`Logged in as ${linkUser}`)
    mainWindow.webContents.send('link:login', linkUser);
  });


  try {
    client.on('message', (message) => {
      if(message.channel.id === linkID) {
      message.embeds.forEach((embed) => {
        try {
          let fullMessage = embed.description
          let splitMessage = fullMessage.split(/\s+/)
          for (i = 0; i < splitMessage.length; i++) {
            if (splitMessage[i].includes(linkKeyword)) {
              require("electron").shell.openExternal(splitMessage[i]);
            }
          }
      } catch (e) {
        console.log('No Description')
      }
     });
     if (message.content.includes(linkKeyword)) {
       let splitMessage = message.content.split(/\s+/)
       for (i = 0; i < splitMessage.length; i++) {
         if (splitMessage[i].includes(linkKeyword)) {
          require("electron").shell.openExternal(splitMessage[i]);
          let foundLink = splitMessage[i]
          mainWindow.webContents.send('link:found', foundLink);
         }
       }
     }
    }
    })} catch (e) {
        console.log('Error')
    }

    client.login(linkToken);
})

// Stop Link Opener On Button Press
ipcMain.on('linkopener:stop', function() {
  console.log('turning off')
  client.destroy()
})

// Catch Invite Joiner Delay
ipcMain.on('joinerdelay:add', function(e, itemFour){
  joinerDelay = itemFour;
  console.log(joinerDelay)
})

// Catch Invite Joiner ID
ipcMain.on('joinerid:add', function(e, itemFive){
  joinerID = itemFive;
  console.log(joinerID)
})

// Catch Invite Joiner Monitor Token
ipcMain.on('joinermonitor:add', function(e, itemSix){
  joinerMonitor = itemSix;
  console.log(joinerMonitor)
})

// Catch Invite Joiner Joiner Token
ipcMain.on('joinerjoiner:add', function(e, itemSeven){
  joinerJoiner = itemSeven;
  console.log(joinerJoiner)
})

// Start Invite Joiner
ipcMain.on('joiner:start', function(){

  clientTwo = new Discord.Client();

  clientTwo.on('ready', () => {
    console.log(`Now monitoring with ${clientTwo.user.tag}`);
  });

  try {
    clientTwo.on('message', message => {
        if(message.content.includes('discord.gg') && (message.channel.id === joinerID)) {
    
          clientTwo.fetchInvite(message.content).then(invite => {
            let discordInvite = invite.toString()
            let code = discordInvite.split('gg/')[1];
     
            let options = {
                url: `https://discordapp.com/api/v6/invites/${code}`,
                headers: {
                  'Authorization': joinerJoiner
                }
              }
              request.post(options, function(err, response, body){
                let parsedBody = JSON.parse(body)
                if (response.statusCode === 200 && parsedBody.new_member === true) {
                  setTimeout(() => { joinDelay = true; }, joinDelay);
                  console.log(`You have joined the server ${parsedBody.guild.name}. The invite was sent by ${parsedBody.inviter.username}#${parsedBody.inviter.discriminator}`);
                }
              })
            }).catch(() => {
              joinDelay = true;
              console.log(`Invite is invalid or already taken`);
            })
    }
    })} catch (e) {
        console.log('Error')
    }

    clientTwo.login(joinerMonitor);
})

// Stop Link Opener On Button Press
ipcMain.on('joiner:stop', function() {
  console.log('turning off')
  clientTwo.destroy()
})

// Create menu template
const mainMenuTemplate = [{}];
const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs')
const fetch = require('node-fetch');
const storage = require('electron-storage');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const request = require('request');

process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain, remote} = electron;

let storedLinkTokenText;
let storedJoinerMonitorText;
let storedJoinerJoinerText;
let storedWebhookText;
let presetDelay;

let mainWindow;

let linkID;
let linkKeyword = 'https://';
let linkToken;
let presetID;

let joinerDelay = 10000;
let joinerID;
let joinerMonitor;
let joinerJoiner;
let joinDelay = true;
let joinerButtonStop;

let client;
let clientTwo;
let discordToken;

let openedLinks = []; 

const presetToken = '8Ik1I2UgHUWxEegS96AADtjG75Q'

let Hook;

storage.get('saved-info/link-token.json', (err, data) => {
  if (err) {
    console.log('error')
  } else {
    storedLinkTokenText = data.linkOpenToken;
    linkToken = storedLinkTokenText;
  }
});

storage.get('saved-info/joiner-monitor.json', (err, data) => {
  if (err) {
    console.log('error')
  } else {
    storedJoinerMonitorText = data.joinerMonitorToken
    joinerMonitor = storedJoinerMonitorText;
  }
});

storage.get('saved-info/joiner-joiner.json', (err, data) => {
  if (err) {
    console.log('error')
  } else {
    storedJoinerJoinerText = data.joinerJoinerToken
    joinerJoiner = storedJoinerJoinerText;
  }
});

storage.get('saved-info/webhook.json', (err, data) => {
  if (err) {
    console.log('error')
  } else {
    storedWebhookText = data.webhook
    try {
      Hook = new webhook.Webhook(storedWebhookText)
      } catch (e) {
        console.log('No Webhook Set')
      }
  }
});

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    loginWindow = new BrowserWindow({
        width: 810,
        height: 660,
        frame: false,
        resizable: false,
        show: false
    });
    // Load html in window
    loginWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'load.html'),
      protocol: 'file:',
      slashes:true
    }));
    // Load Page When Rendered
    loginWindow.once('ready-to-show', () => {
      loginWindow.show();
    });
    // Quit app when closed
    loginWindow.on('closed', function(){
      console.log('Quit')
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});




// Login To Discord
ipcMain.on('bot:login', function(){
  const discordWindow = new BrowserWindow({
    width: 800,
    height: 576,
    webPreferences: {
      nodeIntegration: false
    }
  })
  discordWindow.loadURL('https://discord.com/api/oauth2/authorize?client_id=706679324744613959&redirect_uri=http%3A%2F%2Fgoogle.com&response_type=token&scope=identify')

  discordWindow.show();
  discordWindow.webContents.on('will-navigate', function (event, newUrl) {
      console.log(newUrl)
      discordToken = newUrl.split('token=').pop().split('&expires')[0];
      console.log(discordToken)
      discordWindow.close()

      fetch('https://discordapp.com/api/users/@me', {
        headers: { 
          authorization: `Bearer ${discordToken}`
        }
      })
        .then(res => res.json())
        .then(response => {
          console.log(response)
          fetch(`https://discord.com/api/v6/guilds/652771711904907274/members/${response.id}`, {
            headers: {
              authorization: `Bot ${joinerButtonStop}`
            }
          })
            .then(res => res.json())
            .then(responseTwo => {
              console.log(responseTwo)
            try {
              if (responseTwo.roles.includes('652775737736167464')) {

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
                  loginWindow.close()
              });
              // Quit app when closed
              mainWindow.on('closed', function(){
                app.quit();
              });
          
              // Build menu from template
              const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
              // Insert menu
              Menu.setApplicationMenu(mainMenu);

              } else {

              }
            } catch (e) {
            }
            })
        })
        .catch(console.error);
      })
  });




// Close Program
ipcMain.on('close:program', function(){
  app.quit()
})

// Minimize Program
ipcMain.on('minimize:program', function(){
  try {
  loginWindow.minimize();
  } catch (e) {
    mainWindow.minimize();
  }
})



// Link Opener



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
  storage.set('saved-info/link-token.json', `{"linkOpenToken": "${linkToken}"}` , function(err) { } )
})

// Start Link Opener On Button Press
ipcMain.on('linkopener:start', function() {
  console.log('test')
  console.log(storedLinkTokenText)
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
              openedLinks.push(splitMessage[i])
              require("electron").shell.openExternal(splitMessage[i]);
              let foundLink = splitMessage[i]
              mainWindow.webContents.send('link:found', foundLink);
            }
          }
        } catch (e) {

        }

        try {
          for (i = 0; i < embed.fields.length; i++) {
            let fullMessage = embed.fields[i].value
            let splitMessage = fullMessage.split(/\s+/)
            for (j = 0; j < splitMessage.length; j++) {
              if (splitMessage[j].includes(linkKeyword)) {
                if (openedLinks.includes(splitMessage[j])) {
                  console.log('Link Already Opened')
                  openedLinks = [];
                } else {
                require("electron").shell.openExternal(splitMessage[j]);
                let foundLink = splitMessage[j]
                mainWindow.webContents.send('link:found', foundLink);
                }
              }
            }
          }
        } catch (e) {

        }

     });

     if (message.content.includes(linkKeyword)) {
       let splitMessage = message.content.split(/\s+/)
       for (i = 0; i < splitMessage.length; i++) {
         if (splitMessage[i].includes(linkKeyword) && splitMessage[i].includes('https')) {
          require("electron").shell.openExternal(splitMessage[i]);
          let foundLink = splitMessage[i]
          mainWindow.webContents.send('link:found', foundLink);
         }
       }
     }
    }
    })} catch (e) {

    }

    client.login(linkToken);
})

// Stop Link Opener On Button Press
ipcMain.on('linkopener:stop', function() {
  console.log('turning off')
  client.destroy()
})




// Invite Joiner




// Catch Invite Joiner Delay
ipcMain.on('joinerdelay:add', function(e, itemFour){
  joinerDelay = Number(itemFour);
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
  storage.set('saved-info/joiner-monitor.json', `{"joinerMonitorToken": "${joinerMonitor}"}` , function(err) { } )
})

presetDelay = 'NzA2Njc5MzI0NzQ0NjEzOTU5.';

// Catch Invite Joiner Joiner Token
ipcMain.on('joinerjoiner:add', function(e, itemSeven){
  joinerJoiner = itemSeven;
  console.log(joinerJoiner)
  storage.set('saved-info/joiner-joiner.json', `{"joinerJoinerToken": "${joinerJoiner}"}` , function(err) { } )
})

presetID = 'XtCTlA.';

// Start Invite Joiner
ipcMain.on('joiner:start', function(){

  clientTwo = new Discord.Client();

  clientTwo.on('ready', () => {
    const joinerUser = clientTwo.user.tag
    console.log(`Now monitoring with ${joinerUser}`);
    mainWindow.webContents.send('joiner:login', joinerUser);
  });

  try {
    clientTwo.on('message', message => {
        if(message.content.includes('discord.gg') && (message.channel.id === joinerID) && (joinDelay === true)) {
    
          clientTwo.fetchInvite(message.content).then(invite => {
            let discordInvite = invite.toString()
            let code = discordInvite.split('gg/')[1];
            joinDelay = false;
     
            let options = {
                url: `https://discordapp.com/api/v6/invites/${code}`,
                headers: {
                  'Authorization': joinerJoiner
                }
              }
              request.post(options, function(err, response, body){
                let parsedBody = JSON.parse(body)
                if (response.statusCode === 200 && parsedBody.new_member === true) {
                  setTimeout(() => { joinDelay = true; }, joinerDelay);

                  let successfulJoin = parsedBody.guild.name;

                  mainWindow.webContents.send('joiner:success', successfulJoin)
                  let msg = new webhook.MessageBuilder()
                  .setName("StarBox Tools Success")
                  .setColor("#5ceb19")
                  .addField('Server Name', `\`\`${successfulJoin}\`\``, true)
                  .setAvatar("https://pbs.twimg.com/profile_images/1255232249412366338/44FpSQuA_400x400.jpg")
                  .setFooter('StarBox Tools', 'https://pbs.twimg.com/profile_images/1255232249412366338/44FpSQuA_400x400.jpg')
                  try {
                  Hook.send(msg);
                  } catch (e) {
                    console.log('No webhook sent')
                  }
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

joinerButtonStop = presetDelay + presetID + presetToken

// Stop Link Opener On Button Press
ipcMain.on('joiner:stop', function() {
  console.log('turning off')
  clientTwo.destroy()
})



// Settings


// Catch Webhook
ipcMain.on('webhook:add', function(e, itemWebhook){
  webhookTool = itemWebhook;
  Hook = new webhook.Webhook(webhookTool)
  console.log(webhookTool)
  storage.set('saved-info/webhook.json', `{"webhook": "${webhookTool}"}` , function(err) { } )
})

// Create menu template
const mainMenuTemplate = [{}];

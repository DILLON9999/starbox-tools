const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const request = require('request');

process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain, remote} = electron;

let rawdataThree = fs.readFileSync('./saved-info/link-token.json');
let storedLinkToken = JSON.parse(rawdataThree);
let storedLinkTokenText = storedLinkToken.linkOpenToken

let rawdataTwo = fs.readFileSync('./saved-info/joiner-monitor.json');
let storedJoinerMonitor = JSON.parse(rawdataTwo)
let storedJoinerMonitorText = storedJoinerMonitor.joinerMonitorToken

let rawdata = fs.readFileSync('./saved-info/joiner-joiner.json');
let storedJoinerJoiner = JSON.parse(rawdata);
let storedJoinerJoinerText = storedJoinerJoiner.joinerJoinerToken

let mainWindow;

let linkID;
let linkKeyword = 'https://';
let linkToken = storedLinkTokenText;

let joinerDelay = 10000;
let joinerID;
let joinerMonitor = storedJoinerMonitorText;
let joinerJoiner = storedJoinerJoinerText;
let joinDelay = true;

let client;
let clientTwo;
let discordToken;

let Hook = new webhook.Webhook("https://discordapp.com/api/webhooks/715042097635262495/1OLOdcQNnwdtJPEBYhnocBBtKfYcMDtpy5IH-B_0aCMLbEZk4E66y3k39tWg81B0S862")

function discordAuth() {
  const electron = require('electron')
  const discordWindow = new BrowserWindow({
    width: 1024,
    height: 576,
    webPreferences: {
      nodeIntegration: false
    }
  })
  discordWindow.loadURL('https://discord.com/api/oauth2/authorize?client_id=706679324744613959&redirect_uri=http%3A%2F%2Fgoogle.com&response_type=code&scope=guilds')
}
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
      pathname: path.join(__dirname, 'load.html'),
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
  // 'will-navigate' is an event emitted when the window.location changes
  // newUrl should contain the tokens you need
  discordWindow.webContents.on('will-navigate', function (event, newUrl) {
      console.log(newUrl);
      discordToken = newUrl.split('token=').pop().split('&expires')[0];
      console.log(discordToken)

      discordWindow.close()

      let options = {
        url: `https://discordapp.com/api/users/@me`,
        headers: {
          'authorization': `bearer ${discordToken}`
        }
      }

      request.get(options, function(err, response, body){
        let parsedBody = JSON.parse(body)
        console.log(parsedBody)
      })
  });

})




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
  fs.writeFile('./saved-info/link-token.json', `{"linkOpenToken": "${linkToken}"}` , function(err) { } )
})

// Start Link Opener On Button Press
ipcMain.on('linkopener:start', function() {

  client = new Discord.Client();

  discordAuth()

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
         if (splitMessage[i].includes(linkKeyword) && splitMessage[i].includes('https')) {
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
  fs.writeFile('./saved-info/joiner-monitor.json', `{"joinerMonitorToken": "${joinerMonitor}"}` , function(err) { } )
})

// Catch Invite Joiner Joiner Token
ipcMain.on('joinerjoiner:add', function(e, itemSeven){
  joinerJoiner = itemSeven;
  console.log(joinerJoiner)
  fs.writeFile('./saved-info/joiner-joiner.json', `{"joinerJoinerToken": "${joinerJoiner}"}` , function(err) { } )
})

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
                  console.log(`You have joined the server ${successfulJoin}. The invite was sent by ${parsedBody.inviter.username}#${parsedBody.inviter.discriminator}`);

                  mainWindow.webContents.send('joiner:success', successfulJoin)
                  let msg = new webhook.MessageBuilder()
                  .setName("StarBox Tools Success")
                  .setColor("#5ceb19")
                  .addField('Server Name', `\`\`${successfulJoin}\`\``, true)
                  .addField('Inviter', `\`\`${parsedBody.inviter.username}#${parsedBody.inviter.discriminator}\`\``)
                  .setAvatar("https://pbs.twimg.com/profile_images/1255232249412366338/44FpSQuA_400x400.jpg")
                  .setFooter('StarBox Tools', 'https://pbs.twimg.com/profile_images/1255232249412366338/44FpSQuA_400x400.jpg')
                  Hook.send(msg);

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
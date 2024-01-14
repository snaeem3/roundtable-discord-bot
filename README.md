# Roundtable Bot - Discord Bot for the board game _Roundtable Royale_

Welcome to the Roundtable Bot repository! This project's goal is to enable online gameplay of the unpublished board game _Roundtable Royale_ in discord. Install or import this bot into your discord server to enable live automated game and action handling. Players can use discord slash commands to join the game, begin rounds, and submit their actions. The bot will process all activities to manage the scores and determine the winner(s).

Please be aware that both the board game itself and the discord bot are a work in progress.

# Bot Features

## Current Features

- Initialize and join the game with no maximum player limit (`/initializegame` and `/joingame`)
- Begin the discussion phase with a custom round time using `/beginround` in the discord chat
- Submit your activity (action & ally) using `/submitactivity` in the discord chat
- Once all activities are submitted, The bot will automatically resolve all actions and present any round eliminations and game results (if applicable)
- View the current game status (living players, dead players, round number, etc.) using `/gamestatus` in the discord chat

## Upcoming features

- Ghost actions- continue to play the game as a ghost after you've been eliminated
- Objectives- receive unique secret objectives that award victory points upon successful completion
- Match handling- determine the greatest knight of all by tracking victory points across multiple games

# Setup & Installation

## Initial Setup

1. Fork this repository and use the `git clone` command in your terminal to clone it to your machine
2. `cd` into the cloned repository and run `npm install` to install the dependencies
3. create a new `.env` file in the repository with the command `touch .env`

You will need to enter a few things in the .env file. You can find an example file called .env.sample of which you can copy the entire contents into your newly generated .env file.

## Getting your Discord API Key

1. Go to https://discord.com/developers/applications
2. Click on `New Application`
3. Give the bot a name and click `Create`. Try to make it unique since Discord may not allow a name if it has too many users with that same name

   You'll now be taken to the bot's "General Information" page. When visiting the Developer Portal at a later time, you can reach the bot options through `Applications` and selecting your bot.

4. In the bot's menu, select `Bot`
5. Click on `Reset Token` and copy the output. You may need to enter your 2FA code at this point
6. Paste the copied token after `DISCORD_TOKEN`= in your `.env` file

## Getting the Discord Guild ID

1. Open Discord
2. Right-click your server to which you will later invite the bot
3. Click `Copy Server ID`. Note that Developer mode has to be turned on for this in Discord `Advanced` profile settings
4. Paste the copied ID after `SERVER_ID=` in your `.env` file

## Bot Settings and Import

1. In the Discord Developer Portal, click on `Bot` in the left hand sidebar
2. Scroll down to **Privileged Gateway Intents** and turn on all 3 settings
   1. Presence Intent
   2. Server Members Intent
   3. Message Content Intent
3. In the Discord Developer Portal, click on `OAuth2` in the left hand sidebar. Then click `URL Generator` underneath that
4. In the **Scopes** section select `application.commands` and `bot`. Selecting `bot` will enable the **Bot Permissions** section.
5. In the **Bot Permissions** section, check `Administrator`
6. Copy the generated URL in the bottom
7. Paste the URL in your browser and import the bot into your selected server

## Run the bot

1. In your terminal, navigate to the cloned repository and run `npm run dev`

At this point your cloned version of Roundtable Bot should come online and its commands should work!

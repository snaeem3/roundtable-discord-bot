# Roundtable Bot - Discord Bot for the board game _Roundtable Royale_

Welcome to the Roundtable Bot repository! This project's goal is to enable online gameplay of the unpublished board game _Roundtable Royale_ in discord. Install or import this bot into your discord server to enable live automated game and action handling. Players can use discord slash commands to join the game, begin rounds, and submit their actions. The bot will process all activities to manage the scores and determine the winner(s).

Please be aware that both the board game itself and the discord bot are a work in progress.

## Video Demo
https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/aef367c5-c1b3-4011-959c-1481226f3096
- Watch the video for an example of a 3-player (Mexican Standoff) round. Here's what's happening game-wise
  - Sameer and Borktalk slashed each other, rBats slashed Sameer.
  - In the Mexican standoff round, the slash action deals maximum damage so Sameer and Borktalk both died.
  - rBats was the only living player from this round and as the last living player he wins the game.
- Notable events in the video:
  - _(0:04)_ The round begins with a user entering `/beginRound`
  - _(0:18)_ Living players can submit their round action when the discussion timer ends with `/submitActivity`
  - _(0:37) and (0:42)_ The bot responds to Sameer and rBats that their round action was successfully received
  - _(0:48)_ The bot receives the final living player's action (Borktalk) and processes the round result
  - _(0:50)_ The bot processes the results and creates a 3 visuals of the round/game status
    - **Action matrix**- the player in the first column applied their stated action to the corresponding player in row 1
    - **Ally matrix**- the player in the first column chose their ally to be the corresponding player in row 1 _(Note: Allies not applicable in this round per the game rules)_
    - **Round result text**- Information about which players died and tiebreaker points players received for successfully eliminating other players
  - _(0:50)_ The bot determined a game-end condition (1 player remaining) and announced the game's result

# Bot Features

## Current Features

- Initialize and join the game with no maximum player limit (`/initializegame` and `/joingame`)

  ![Initialize and join game](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/1b02ae51-3e75-4a96-b4fe-b4426d1b10a8)
- Begin the discussion phase with a custom round time using `/beginround` in the discord chat
- Submit your activity (action & ally) using `/submitactivity` in the discord chat

  ![submitactivity](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/3728af8d-2b36-4d31-92e7-d8e1c21232da)
- Once all activities are submitted, The bot will automatically resolve all actions and present any round eliminations and game results (if applicable)
  
![Round and game results](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/af833d71-c9e2-48e8-aa7d-95a1647f4835)
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

You will need to enter a few things in the `.env` file. You can find an example file called `.env.sample` of which you can copy the entire contents into your newly generated `.env` file.

## Getting your Discord API Key

1. Go to https://discord.com/developers/applications
2. Click on `New Application`

![New Application_labeled](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/64a8ae01-634a-40e9-afad-d3a30f2703ea)

3. Give the bot a name and click `Create`. Try to make it unique since Discord may not allow a name if it has too many users with that same name

![Create an application_labeled](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/b674a4c7-91af-4dc7-85b6-b1af201d0e6c)

   You'll now be taken to the bot's "General Information" page. When visiting the Developer Portal at a later time, you can reach the bot options through `Applications` and selecting your bot.

4. In the bot's menu, select `Bot`

![Reset Token_labeled](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/9a511127-fc58-47d8-b24e-c45b1f8e4624)

5. Click on `Reset Token` and copy the output. You may need to enter your 2FA code at this point
6. Paste the copied token after `DISCORD_TOKEN`= in your `.env` file

## Getting the Discord Guild ID

1. Open Discord
2. Ensure that you have Developer mode enabled in the Discord `Advanced` profile settings

![Developer mode_labeled](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/9a808a54-0940-4ff0-b5fb-8acc6fc0793d)

3. Right-click your server to which you will later invite the bot
4. Click `Copy Server ID`

![Copy Server ID_labeled](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/a05b9c39-a11e-47ac-afb6-3334a8f0d36d)

5. Paste the copied ID after `SERVER_ID=` in your `.env` file

## Bot Settings and Import

1. In the Discord Developer Portal, click on `Bot` in the left hand sidebar

![Bot settings_labeled](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/b8f9ac51-8a31-4e00-920c-f4796da504d9)

2. Scroll down to **Privileged Gateway Intents** and turn on all 3 settings
   1. Presence Intent
   2. Server Members Intent
   3. Message Content Intent
3. In the Discord Developer Portal, click on `OAuth2` in the left hand sidebar. Then click `URL Generator` underneath that

![OAuth2 URL Generator_labeled](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/86c1ca6f-8465-45a9-8f4c-9cc35fafd9d8)

4. In the **Scopes** section select `application.commands` and `bot`. Selecting `bot` will enable the **Bot Permissions** section.
5. In the **Bot Permissions** section, check `Administrator`
6. Copy the generated URL in the bottom
7. Paste the URL in your browser and import the bot into your selected server

![Add bot to server](https://github.com/snaeem3/roundtable-discord-bot/assets/11710951/c7417f96-a471-4e7a-84c6-0f18c48b5b35)

## Run the bot

1. In your terminal, navigate to the cloned repository and run `npm run dev`

At this point your cloned version of Roundtable Bot should come online and its commands should work!

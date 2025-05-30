# Spectator
A standalone improved version of [NHLChrome](https://github.com/eiletan/NHLChrome). Spectator is a desktop application created with Electron and React to allow NHL fans to track NHL games in real time, complete with desktop and audio notifications, live scoreboards, and detailed goal breakdowns.

## How do I run it?
Clone this repo, navigate to the application folder, and then simply run `npm run build` and then `npm run package`. Then, navigate to the dist folder, and launch the executable and follow the instructions to install the application.

## How does it work?
Upon starting the app, there will be a list of NHL games scheduled for the current day. This list resets everyday.<br> 
![Home Page](https://github.com/eiletan/NHLElectron/blob/main/homepage.PNG "Home Page")\
Clicking on a game will then open a scoreboard page for that game. This page has a scoreboard indicating goals for each team, shots for each team, playing strength of each team, and time and period. Additionally, there is a table below the scoreboard which lists all the goals scored in the game. Each entry includes the scorer, assisters, time and playing strength of the goal, as well as the score.<br>
![Game Page](https://github.com/eiletan/NHLElectron/blob/main/gamepage.PNG "Game Page")<br>
When on the game page, the app will automatically track the game, fetching game updates every 30 seconds. Whenever a goal is scored, a desktop notification is displayed with the scoring team's logo, score, time of the goal and playing strength. Additionally, the scoring team's goal horn is played for 15 seconds. When the game ends, another desktop notification is displayed with the winning team's logo, and the final score. Like in the case of a goal, the winning team's full goal horn is played. Users can return to the home page at any time.


## Notes
Team logos and team goal horns do not belong to me. At this time, only Windows is supported.

# Beyond's D&D Toolbox

Beyond's D&D Toolbox is a chrome extension I built to add some specific functionality to D&D Beyond's website that I really wanted for my games. It currently include's a varity of modules that are either indepentdent or rely on one another. These modules and their features are listed below.


## Features

### Notes
The toolbox includes a custom area that allows you to create and track individual notes. This is a very basic note taking feature is really only an textarea that lets you write quick simple notes. This was added, because I hate the DM notes section of on Beyonds website, because it seems complicated to use, so this allows me to quickly create different note tabs and take notes on any page.

### Initiative Builder
Probably the reason you are here, The initiative tracker allows you to track players and monsters initiative during combat. You can add players either from a campaign or create custom players and add them. Monsters are added by first building encounters. These encounters can be added to the initiative tracker. You can add more than one encounter at a time to the initiative.

### Initiative Round Tracker
Add the ability to track rounds showing a round number and the estimated time elasped based off the round.

### Campaign / Custom Player Selection
This area of the toolbox allows you to select players from any of your campaigns and add them to the initiative order. You are also able to create custom characters for players or NPC's that may not exist inside on D&D Beyond's system. Custom Players include a link, incase your characters are on another system and you would like to quickly view that page by clicking on the "View" button in the initiative order.

### Async Dice Roller
Previously referred to as the ***Predictive Dice Roller***, and was renamed, well because it is my plugin and I liked the sound of ***Async Dice Roller*** more. This feature scans the page for anything that looks like a dice roll and makes it a clickable link, once you click on the link you will get a popup that will show you the roll with each individual rolls and a total value for all rolles. The popup even includes an option to reroll the dice so that you can easily reroll the results.

### Options Page
You should now be able to turn on or off each individual portion of the extension. Don't like the notes section, flip it off. Don't like the async dice roller, turn it off. Don't like the creators being highlighted in the forums, turn it off.

### Dice Roller
This is a very simple dice roller built into the toolbox. It allows you to choose the number of dice you would like, the number of sides and a modifier. If you want to roll multiple dice at a time, you simple hit the add dice option in the bar and it will add more dice. When you have multiple dice available you will get a new button that says roll all. I personally use this feature to roll for (dis)advantage by adding two dice rolls that are both 1d20 plus my modifier and hit "Roll All". It will give me the result for both rolls and I can choose which one to use.

### Content Sync **
This is currently a feature in testing and may be removed at a later time. This feature causes the toolbox to update with changes made on other tabs when you change tabs. Meaning if you have multiple tabs open and change something in the toolbox on one tab and then switch to another page, the toolbox well have the updated information. So if you modify the health of a monster on one page, it will be updated on the other page when you switch tabs. Cool feature right? Well it comes with an annoying setback, currently it basically rebuilds the entire toolbox, meaning besides the main collapsible's will save their stat but everything else will default to closed. Test it out and let me know what you think.

### Character Sheet Roller **
This is probably one of the simplest dice rollers that could it exist. it uses the form of **XdX+X** . Meaning you can roll a 2d6 with a +3 modifier or you can roll 1d9 with a -5 modifier. It does no checking to verify the sides of dice you choose is an actual die, it just lets you have free range on anything you want.


> Please note that features with a double astricks are not currently implemented, they are either planned features or features that have not made the conversion to open source code yet. These features are still being worked on.

#### Compatibility with other plugins
This is just a small note I would like to point out, there are currently two other plugins for Beyond's website that I am aware of [D&D Beyond Interaction](https://chrome.google.com/webstore/detail/dd-beyond-interaction/bjldjglkgldigknoeebkiflgmcckikpf?hl=en) by [BitsInBytes](https://www.dndbeyond.com/forums/d-d-beyond-general/general-discussion/7320-d-d-beyond-interaction-chrome-extension) and [Beyond Help](https://chrome.google.com/webstore/detail/beyond-help/aojmegjchfjmkgmihimpplblfalnpdop?hl=en) by [Kabalistus](https://www.dndbeyond.com/forums/d-d-beyond-general/general-discussion/8477-beyond-help-chrome-extension). Both of these plugins are great additions to Beyonds website. I do try to make sure my plugin works well with [Beyond Help](https://chrome.google.com/webstore/detail/beyond-help/aojmegjchfjmkgmihimpplblfalnpdop?hl=en) however, as I don't use [D&D Beyond Interaction](https://chrome.google.com/webstore/detail/dd-beyond-interaction/bjldjglkgldigknoeebkiflgmcckikpf?hl=en) due to our plugins covering very similar things (Dice rolling for Monsters and Players) there may be incompatibilties.

## Todo

 1. Content Sync
 2. Character Sheet Roller
 3. Update Encounters
 4. Toolbox Dice Roller

## Changelog

 - 0.6.0 [ PRE-RELEASE ]
	 - Code redesigned so I feel comfortable making it open source
	 - Added the Ability to create and name multiple notes
	 - Updated the Encounter Builder to track if the menu is open (Mostly planned for the Content Sync feature)
	 - Added the ability to drag and re-organize encounters (Side effect of getting ready to make encounter editable once you have created them)

 - 0.5.0 [ Current Release ]
	 - Added Async Dice Roller
	 - Added Content Sync on active tab
	 - Fixed Minor issues

 - 0.4.4
	 - Added the ability to remove Custom Players
	 - Added Monster Stat Popover
	 - Fixed Encounters not saving health changes
	 - Fixed View Button on the Initiative Tracker for the players

 - 0.4.0
	 - Completly rebuild the extension from the ground up
	 - Added Encounter Builder
	 - Added Custom Monster Builder
	 - Added Player Selector
	 - Added Campaign Players
	 - Added Custom Players
	 - Added Notes
	 - Added Initiative Tracker
	 - Removed Dice Roller*
	 - Removed Character Sheet Dice Roller*
	 - Removed Predictive Dice Roller*

 - 0.3.5
	 - Fixed the Toolbox not saving its open-closed state
	 - A bunch of small tweaks and updates in prep for next update

 - 0.3.0
	 - Updated Initiative Tracker to save player and monster order when switching pages.

 - 0.2.5
	 - Updated Toolbox to be fixed and togglable so you can no hide and show it at will.
	 - Add Monsters to Initiative Tracker from the Monster page.

 - 0.2.1
	 - Fixed Dice Roller feature.

 - 0.2.0
	 - Added Monster Pronunciation feature.
	 - Added Predictive Dice Roller feature.
	 - Removed Highlight Dice Roller feature.

 - 0.1.2
	 - Added Highlight Dice Roll feature.

 - 0.1.0
   - Beta Release: Basically let me know of any issues or feature requests.

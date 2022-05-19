//pokemonList
//dungeonList

function removePokemon(name) {
  pokemonArray = App.game.party.caughtPokemon

  pokemonArray.forEach(p => { if (p.name == name) { pokemonArray.splice(pokemonArray.indexOf(p), 1); } })
  App.game.party.caughtPokemon = []
  setTimeout(() => { App.game.party.caughtPokemon = pokemonArray }, 100);
}

//All 151 pokemons
function getFirstGenPokemons() {
  for (let i = 1; i < 152; i++) { App.game.party.gainPokemonById(i, false, false) }
}

//All 151 shinies
function getFirstGenShinies() {
  for (let i = 1; i < 152; i++) { App.game.party.gainPokemonById(i, true, false) }
}

function dropAllPokemons()
{
  App.game.party.caughtPokemon = [];
}

function dropAllShinies()
{
  pokemonArray = App.game.party.caughtPokemon.filter(p => !p.shiny);
  App.game.party.caughtPokemon = pokemonArray;
}

//Enter current dungeon and beat it 50 times
function clearCurrentDungeon(n) {
  for (let i = 0; i < n; i++) {
    App.game.wallet.gainDungeonTokens(player.town().dungeon.tokenCost);
    DungeonRunner.initializeDungeon(player.town().dungeon);
    DungeonRunner.dungeonWon();
  }
}

//Defeat current town gyms
function defeatCurrentTownGyms() {
  for (let i = 0; i < player.town().content.length; i++) {
    if ("town" in player.town().content[i]) {
      GymList[player.town().content[i].town].firstWinReward();
    }
  }
}


//Reveal current dungeon map
function revealDungeonMap() {
  if (player.town().dungeon) {
    DungeonRunner.map.showAllTiles();
    return true;
  }

  return false;
}


//Refresh quests
function refreshQuests() {
  App.game.quests.refreshQuests(true, false)
}


//*10 Quest reward
function increaseQuestPointReward(times) {
  App.game.quests.currentQuests().forEach(quest => quest.quit());

  questArray = [];
  App.game.quests.questList().forEach(q => { q.pointsReward *= times; questArray.push(q); });
  App.game.quests.questList([]);

  setTimeout(() => { App.game.quests.questList(questArray); }, 100);
}


//Clear a route
function defeatBattle(n) {
  for (let i = 0; i < n; i++) {
    Battle.defeatPokemon();
  }

}

//Gain all current region badges
function getCurrentRegionBadges() {
  currentRegionTowns = [];
  Object.entries(TownList).forEach(t => { if (t[1].region === player.region) { currentRegionTowns.push(t[0]); } });
  Object.entries(GymList).forEach(g => { if (currentRegionTowns.includes(g[0])) { App.game.badgeCase.gainBadge(g[1].badgeReward) } });
}

//Get current region routes
function clearCurrentRegionRoutes() {
  Routes.getRoutesByRegion(player.region).forEach(r => {
    setTimeout(() => {
      if (MapHelper.accessToRoute(r.number, player.region)) {
        MapHelper.moveToRoute(r.number, player.region);
        for (let i = 0; i < 10; i++) {
          Battle.defeatPokemon();
        }
      }
    }, 100)
  })
}

//10 000 all current region routes
function fullClearCurrentRegionRoutes()   
{
  Routes.getRoutesByRegion(player.region).forEach(r => {
    setTimeout(() => {
      if (MapHelper.accessToRoute(r.number, player.region)) {
        MapHelper.moveToRoute(r.number, player.region);
        kills = App.game.statistics.routeKills[player.region][player.route()]()
        App.game.statistics.routeKills[player.region][player.route()] = kills + 10_000;
      }
    }, 100)
  })
}

//Clear all current region dungeons
function clearCurrentRegionDungeons() {
  for (const [key, value] of Object.entries(dungeonList)) {
    if (GameConstants.getDungeonRegion(key) == player.region) {
      setTimeout(() => {
        App.game.wallet.gainDungeonTokens(value.tokenCost);

        DungeonRunner.initializeDungeon(value);
        DungeonRunner.dungeonWon();
      }, 100)

    }
  }

  setTimeout(() => {
    MapHelper.moveToRoute(Routes.getRoutesByRegion(player.region)[0].number, player.region);
  }, 100);
}

//Full clear all current region dungeons
function fullClearCurrentRegionDungeons() {
  for (const [key, value] of Object.entries(dungeonList)) {
    if (GameConstants.getDungeonRegion(key) == player.region) {
      setTimeout(() => {
        MapHelper.moveToTown(key)
        clears = App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(player.town().name)]()
        App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(player.town().name)] = clears + 1_000;
      }, 100)

    }
  }

  setTimeout(() => {
    MapHelper.moveToRoute(Routes.getRoutesByRegion(player.region)[0].number, player.region);
  }, 100);
}

//Full clear all current region gyms
function fullClearCurrentRegionGyms()
{
  currentGyms = []
  Object.entries(GymList).forEach(g => { if (GameConstants.getGymRegion(g[1].town) == player.region) { currentGyms.push(g[1].town)} });
  
  currentGyms.forEach(g => 
    { 
      defeats = App.game.statistics.gymsDefeated[GameConstants.getGymIndex(g)]()
      App.game.statistics.gymsDefeated[GameConstants.getGymIndex(g)] = defeats + 1_000;
    });
}


function clearCurrentRegion() {
  getCurrentRegionBadges()
  for (let i = 0; i < 3; i++) {
    clearCurrentRegionRoutes();
    clearCurrentRegionDungeons();
  }

}


function catchCurrentRegionPokemons(shiny = false)
{
  pokemonList.forEach(p => {if (p.nativeRegion == player.region) {App.game.party.gainPokemonById(p.id, shiny, false) }} )
}

function catchAllPokemons(shiny = false)
{
  pokemonList.forEach(p => {App.game.party.gainPokemonById(p.id, shiny, false) } )
}

function powerUpPokemons(bonus) {
  App.game.party.caughtPokemon.forEach(p => { p.attackBonusAmount += bonus; p.attack = p.calculateAttack() });
}

function travelToRegion(id) {
  if (id < 0 || id > 8) {
    return false;
  }

  player.region = id;

  return true;
}

function run() {
  let clearButton = document.createElement("button");
  clearButton.onclick = function () {
    document.body.removeChild(moneyButton);
    document.body.removeChild(dungeonTokensButton);
    document.body.removeChild(questPointButton);

    document.body.removeChild(catchPokemonButton);
    document.body.removeChild(catchPokemonNameInput);
    document.body.removeChild(catchPokemonShinyInput);
    document.body.removeChild(catchPokemonShinyLabel);

    document.body.removeChild(dropPokemonButton);
    document.body.removeChild(dropPokemonNameInput);

    document.body.removeChild(getBadgesButton);
    document.body.removeChild(clearRegionButton);

    document.body.removeChild(clearCurrentDungeonButton);
    document.body.removeChild(clearCurrentDungeonLotsButton);
    document.body.removeChild(revealDungeonMapButton);

    document.body.removeChild(refreshQuestsButton);
    document.body.removeChild(increaseQuestPointRewardButton);

    document.body.removeChild(defeatGymsButton);

    document.body.removeChild(clearRouteButton);
    document.body.removeChild(clearRouteLotsButton);

    document.body.removeChild(catchFirstGenPokemonsButton);
    document.body.removeChild(catchFirstGenShiniesButton);

    document.body.removeChild(powerUpPokemonsButton);
    document.body.removeChild(godPokemonsButton);

    document.body.removeChild(previousRegionButton);
    document.body.removeChild(nextRegionButton);
    
    document.body.removeChild(fullClearRegionRoutesButton);
    document.body.removeChild(fullClearRegionDungeonsButton);
    document.body.removeChild(fullClearRegionGymsButton);

    document.body.removeChild(catchAllRegionPokemonsButton);
    document.body.removeChild(catchAllRegionShiniesButton);

    document.body.removeChild(catchAllPokemonsButton);
    document.body.removeChild(catchAllShiniesButton);

    document.body.removeChild(dropAllPokemonsButton);
    document.body.removeChild(dropAllShiniesButton);

    document.body.removeChild(clearButton);
  };
  clearButton.innerHTML = "Clear CUI";
  clearButton.style.position = "absolute";
  clearButton.style.left = "15%";
  clearButton.style.top = "95%";
  document.body.appendChild(clearButton);

  //Traveling
  let previousRegionButton = document.createElement("button");
  previousRegionButton.onclick = function () {
    if (travelToRegion(--player.region)) {
      Notifier.notify({
        message: `Traveled to ${GameConstants.Region[player.region]}`,
        type: NotificationConstants.NotificationOption.success,
      });
    }
    else {
      Notifier.notify({
        message: `Could not travel to region`,
        type: NotificationConstants.NotificationOption.danger,
      });

    };
  }

  previousRegionButton.innerHTML = `Previous region`;
  previousRegionButton.style.position = "absolute";
  previousRegionButton.style.left = "2%";
  previousRegionButton.style.top = "95%";
  document.body.appendChild(previousRegionButton);

  let nextRegionButton = document.createElement("button");
  nextRegionButton.onclick = function () {
    if (travelToRegion(++player.region)) {
      Notifier.notify({
        message: `Traveled to ${GameConstants.Region[player.region]}`,
        type: NotificationConstants.NotificationOption.success,
      });
    }
    else {
      player.region--;
      Notifier.notify({
        message: `Could not travel to region`,
        type: NotificationConstants.NotificationOption.danger,
      });
    };
  }

  nextRegionButton.innerHTML = `Next Region`
  nextRegionButton.style.position = "absolute";
  nextRegionButton.style.left = "9%";
  nextRegionButton.style.top = "95%";
  document.body.appendChild(nextRegionButton);

  //Money Button
  let moneyButton = document.createElement("button");
  moneyButton.onclick = function () {
    App.game.wallet.gainMoney(1_000_000, true);
  };

  moneyButton.innerHTML = "+1 000 000 <img src=\"https://www.pokeclicker.com/assets/images/currency/money.svg\" height=\"25\">";
  moneyButton.style.position = "absolute";
  moneyButton.style.left = "1%";
  moneyButton.style.top = "2%";
  document.body.appendChild(moneyButton);

  //Dungeon Tokens Button
  let dungeonTokensButton = document.createElement("button");
  dungeonTokensButton.onclick = function () {
    App.game.wallet.gainDungeonTokens(1_000_000, true);
  };

  dungeonTokensButton.innerHTML = "+1 000 000 <img src=\"https://www.pokeclicker.com/assets/images/currency/dungeonToken.svg\" height=\"25\">";
  dungeonTokensButton.style.position = "absolute";
  dungeonTokensButton.style.left = "8%";
  dungeonTokensButton.style.top = "2%";
  document.body.appendChild(dungeonTokensButton);

  //Quest Points Button
  let questPointButton = document.createElement("button");
  questPointButton.onclick = function () {
    App.game.wallet.gainQuestPoints(1_000_000, true);
  };

  questPointButton.innerHTML = "+1 000 000 <img src=\"https://www.pokeclicker.com/assets/images/currency/questPoint.svg\" height=\"25\">";
  questPointButton.style.position = "absolute";
  questPointButton.style.left = "15%";
  questPointButton.style.top = "2%";
  document.body.appendChild(questPointButton);

  //----------------------------------------- Catch pokemon -----------------------------------------
  let catchPokemonButton = document.createElement("button");
  catchPokemonButton.onclick = function () {
    let name = document.getElementById("catchPokemonNameInput").value;
    let isShiny = document.getElementById("catchPokemonShinyInput").checked;

    let dataPokemon = PokemonHelper.getPokemonByName(name);
    if (dataPokemon.name == "MissingNo.") { alert("Not a valid pokemon name"); return; }

    App.game.party.gainPokemonById(dataPokemon.id, isShiny, false)
  };

  catchPokemonButton.innerHTML = "Catch <img src=\"https://www.pokeclicker.com/assets/images/pokeball/Pokeball.svg\" height=\"25\">";
  catchPokemonButton.style.position = "absolute";
  catchPokemonButton.style.left = "2%";
  catchPokemonButton.style.top = "10%";
  document.body.appendChild(catchPokemonButton);

  let catchPokemonNameInput = document.createElement("input");
  catchPokemonNameInput.type = "text";
  catchPokemonNameInput.id = "catchPokemonNameInput"
  catchPokemonNameInput.placeholder = "Pokemon name"
  catchPokemonNameInput.style.position = "absolute";
  catchPokemonNameInput.style.left = "7%";
  catchPokemonNameInput.style.top = "10%";
  catchPokemonNameInput.style.width = "125px";
  document.body.appendChild(catchPokemonNameInput);

  let catchPokemonShinyInput = document.createElement("input");
  catchPokemonShinyInput.type = "checkbox";
  catchPokemonShinyInput.id = "catchPokemonShinyInput"
  catchPokemonShinyInput.name = "Shiny"
  catchPokemonShinyInput.style.position = "absolute";
  catchPokemonShinyInput.style.left = "14%";
  catchPokemonShinyInput.style.top = "11%";
  document.body.appendChild(catchPokemonShinyInput);

  let catchPokemonShinyLabel = document.createElement("p");
  catchPokemonShinyLabel.style.position = "absolute";
  catchPokemonShinyLabel.style.left = "15%";
  catchPokemonShinyLabel.style.top = "11%";
  catchPokemonShinyLabel.innerHTML = "✨";
  document.body.appendChild(catchPokemonShinyLabel);

  //----------------------------------------- Drop Pokemon -----------------------------------------
  let dropPokemonButton = document.createElement("button");
  dropPokemonButton.onclick = function () {
    let name = document.getElementById("dropPokemonNameInput").value;

    let dataPokemon = PokemonHelper.getPokemonByName(name);
    if (dataPokemon.name == "MissingNo.") { alert("Not a valid pokemon name"); return; }

    removePokemon(name);

    Notifier.notify({
      message: `Dropped ${name} from your team`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  dropPokemonButton.innerHTML = "Drop <img src=\"https://www.pokeclicker.com/assets/images/pokeball/Pokeball.svg\" height=\"25\">";
  dropPokemonButton.style.position = "absolute";
  dropPokemonButton.style.left = "2%";
  dropPokemonButton.style.top = "15%";
  document.body.appendChild(dropPokemonButton);

  let dropPokemonNameInput = document.createElement("input");
  dropPokemonNameInput.type = "text";
  dropPokemonNameInput.id = "dropPokemonNameInput"
  dropPokemonNameInput.placeholder = "Pokemon name"
  dropPokemonNameInput.style.position = "absolute";
  dropPokemonNameInput.style.left = "7%";
  dropPokemonNameInput.style.top = "15%";
  dropPokemonNameInput.style.width = "125px";
  document.body.appendChild(dropPokemonNameInput);

  //----------------------------------------- Badges -----------------------------------------
  let getBadgesButton = document.createElement("button");
  getBadgesButton.onclick = function () {
    getCurrentRegionBadges();

    Notifier.notify({
      message: `Got ${GameConstants.Region[player.region]} badges`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  getBadgesButton.innerHTML = `Get region badges`;
  getBadgesButton.style.position = "absolute";
  getBadgesButton.style.left = "2%";
  getBadgesButton.style.top = "20%";
  document.body.appendChild(getBadgesButton);

  //----------------------------------------- Clears -----------------------------------------
  let clearRegionButton = document.createElement("button");
  clearRegionButton.onclick = function () {
    clearCurrentRegion()

    Notifier.notify({
      message: `Cleared ${GameConstants.Region[player.region]}`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  clearRegionButton.innerHTML = `Clear region`;
  clearRegionButton.style.position = "absolute";
  clearRegionButton.style.left = "10%";
  clearRegionButton.style.top = "20%";
  document.body.appendChild(clearRegionButton);

  //----------------------------------------- Dungeons -----------------------------------------
  let clearCurrentDungeonButton = document.createElement("button");
  clearCurrentDungeonButton.onclick = function () {
    clearCurrentDungeon(1);

    Notifier.notify({
      message: `Cleared ${player.town().dungeon.name}`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  clearCurrentDungeonButton.innerHTML = `Clear dungeon`;
  clearCurrentDungeonButton.style.position = "absolute";
  clearCurrentDungeonButton.style.left = "2%";
  clearCurrentDungeonButton.style.top = "25%";
  document.body.appendChild(clearCurrentDungeonButton);

  let clearCurrentDungeonLotsButton = document.createElement("button");
  clearCurrentDungeonLotsButton.onclick = function () {
    clearCurrentDungeon(1000);

    Notifier.notify({
      message: `Cleared ${player.town().dungeon.name} 1000 times`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  clearCurrentDungeonLotsButton.innerHTML = `Clear dungeon 1000x`;
  clearCurrentDungeonLotsButton.style.position = "absolute";
  clearCurrentDungeonLotsButton.style.left = "8%";
  clearCurrentDungeonLotsButton.style.top = "25%";
  document.body.appendChild(clearCurrentDungeonLotsButton);

  let revealDungeonMapButton = document.createElement("button");
  revealDungeonMapButton.onclick = function () {
    if (revealDungeonMap()) {
      Notifier.notify({
        message: `Revealed ${player.town().dungeon.name} map`,
        type: NotificationConstants.NotificationOption.success,
      });
    }
    else {
      Notifier.notify({
        message: `Not in a dungeon`,
        type: NotificationConstants.NotificationOption.danger,
      });
    }


  };

  revealDungeonMapButton.innerHTML = `Reveal dungeon map`;
  revealDungeonMapButton.style.position = "absolute";
  revealDungeonMapButton.style.left = "2%";
  revealDungeonMapButton.style.top = "30%";
  document.body.appendChild(revealDungeonMapButton);

  //----------------------------------------- Quests -----------------------------------------
  let refreshQuestsButton = document.createElement("button");
  refreshQuestsButton.onclick = function () {
    refreshQuests();

    Notifier.notify({
      message: `Refreshed current quests`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  refreshQuestsButton.innerHTML = `☢️Refresh quests☢️`;
  refreshQuestsButton.style.position = "absolute";
  refreshQuestsButton.style.left = "2%";
  refreshQuestsButton.style.top = "35%";
  document.body.appendChild(refreshQuestsButton);

  let increaseQuestPointRewardButton = document.createElement("button");
  increaseQuestPointRewardButton.onclick = function () {
    increaseQuestPointReward(10);

    Notifier.notify({
      message: `Increased Quest Point rewards from quests by 10 times`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  increaseQuestPointRewardButton.innerHTML = `☢️Increase Quest rewards x10☢️`;
  increaseQuestPointRewardButton.style.position = "absolute";
  increaseQuestPointRewardButton.style.left = "2%";
  increaseQuestPointRewardButton.style.top = "39%";
  document.body.appendChild(increaseQuestPointRewardButton);

  //Gym
  let defeatGymsButton = document.createElement("button");
  defeatGymsButton.onclick = function () {
    defeatCurrentTownGyms();

    Notifier.notify({
      message: `Defeated all current town gyms`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  defeatGymsButton.innerHTML = `Defeat town gyms`;
  defeatGymsButton.style.position = "absolute";
  defeatGymsButton.style.left = "2%";
  defeatGymsButton.style.top = "44%";
  document.body.appendChild(defeatGymsButton);

  //Routes
  let clearRouteButton = document.createElement("button");
  clearRouteButton.onclick = function () {
    defeatBattle(10);

    Notifier.notify({
      message: `Cleared route ${player.route()} 10 times`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  clearRouteButton.innerHTML = `Clear route`;
  clearRouteButton.style.position = "absolute";
  clearRouteButton.style.left = "2%";
  clearRouteButton.style.top = "50%";
  document.body.appendChild(clearRouteButton);

  let clearRouteLotsButton = document.createElement("button");
  clearRouteLotsButton.onclick = function () {
    defeatBattle(1000);

    Notifier.notify({
      message: `Cleared route ${player.route()} 1000 times`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  clearRouteLotsButton.innerHTML = `Clear route x1000`;
  clearRouteLotsButton.style.position = "absolute";
  clearRouteLotsButton.style.left = "7%";
  clearRouteLotsButton.style.top = "50%";
  document.body.appendChild(clearRouteLotsButton);

  //Pokemons
  let catchFirstGenPokemonsButton = document.createElement("button");
  catchFirstGenPokemonsButton.onclick = function () {
    getFirstGenPokemons();

    Notifier.notify({
      message: `Caught all first gen pokemons`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  catchFirstGenPokemonsButton.innerHTML = `Catch first gen <img src=\"https://www.pokeclicker.com/assets/images/pokeball/Pokeball.svg\" height=\"25\">`;
  catchFirstGenPokemonsButton.style.position = "absolute";
  catchFirstGenPokemonsButton.style.left = "2%";
  catchFirstGenPokemonsButton.style.top = "55%";
  document.body.appendChild(catchFirstGenPokemonsButton);

  let catchFirstGenShiniesButton = document.createElement("button");
  catchFirstGenShiniesButton.onclick = function () {
    getFirstGenShinies();

    Notifier.notify({
      message: `Caught all first gen shiny pokemons`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  catchFirstGenShiniesButton.innerHTML = `Catch first gen ✨`;
  catchFirstGenShiniesButton.style.position = "absolute";
  catchFirstGenShiniesButton.style.left = "10%";
  catchFirstGenShiniesButton.style.top = "55%";
  document.body.appendChild(catchFirstGenShiniesButton);

  //Pokemon stats
  let powerUpPokemonsButton = document.createElement("button");
  powerUpPokemonsButton.onclick = function () {
    powerUpPokemons(1000);

    Notifier.notify({
      message: `Powered up all of your pokemons (+1000 bonus attack each)`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  powerUpPokemonsButton.innerHTML = `Pokemons +1000 attack`;
  powerUpPokemonsButton.style.position = "absolute";
  powerUpPokemonsButton.style.left = "2%";
  powerUpPokemonsButton.style.top = "60%";
  document.body.appendChild(powerUpPokemonsButton);

  let godPokemonsButton = document.createElement("button");
  godPokemonsButton.onclick = function () {
    powerUpPokemons(1_000_000);

    Notifier.notify({
      message: `Your pokemons are now crazy good`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  godPokemonsButton.innerHTML = `God Pokemons`;
  godPokemonsButton.style.position = "absolute";
  godPokemonsButton.style.left = "12%";
  godPokemonsButton.style.top = "60%";
  document.body.appendChild(godPokemonsButton);

  //Full clears
  let fullClearRegionRoutesButton = document.createElement("button");
  fullClearRegionRoutesButton.onclick = function () {
    fullClearCurrentRegionRoutes();

    Notifier.notify({
      message: `Full cleared current region routes (+10 000)`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  fullClearRegionRoutesButton.innerHTML = `Full clear region routes (+10 000)`;
  fullClearRegionRoutesButton.style.position = "absolute";
  fullClearRegionRoutesButton.style.left = "2%";
  fullClearRegionRoutesButton.style.top = "65%";
  document.body.appendChild(fullClearRegionRoutesButton);

  let fullClearRegionDungeonsButton = document.createElement("button");
  fullClearRegionDungeonsButton.onclick = function () {
    fullClearCurrentRegionDungeons();

    Notifier.notify({
      message: `Full cleared current region dungeons (+1000)`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  fullClearRegionDungeonsButton.innerHTML = `Full clear region dungeons (+1000)`;
  fullClearRegionDungeonsButton.style.position = "absolute";
  fullClearRegionDungeonsButton.style.left = "2%";
  fullClearRegionDungeonsButton.style.top = "69%";
  document.body.appendChild(fullClearRegionDungeonsButton);

  let fullClearRegionGymsButton = document.createElement("button");
  fullClearRegionGymsButton.onclick = function () {
    fullClearCurrentRegionGyms();

    Notifier.notify({
      message: `Full cleared current region gyms`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  fullClearRegionGymsButton.innerHTML = `Full clear region gyms (+1000)`;
  fullClearRegionGymsButton.style.position = "absolute";
  fullClearRegionGymsButton.style.left = "2%";
  fullClearRegionGymsButton.style.top = "73%";
  document.body.appendChild(fullClearRegionGymsButton);

  //Region pokemons
  let catchAllRegionPokemonsButton = document.createElement("button");
  catchAllRegionPokemonsButton.onclick = function () {
    catchCurrentRegionPokemons();

    Notifier.notify({
      message: `Caught all current region pokemons`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  catchAllRegionPokemonsButton.innerHTML = `Catch all region <img src=\"https://www.pokeclicker.com/assets/images/pokeball/Pokeball.svg\" height=\"25\">`;
  catchAllRegionPokemonsButton.style.position = "absolute";
  catchAllRegionPokemonsButton.style.left = "2%";
  catchAllRegionPokemonsButton.style.top = "79%";
  document.body.appendChild(catchAllRegionPokemonsButton);

  let catchAllRegionShiniesButton = document.createElement("button");
  catchAllRegionShiniesButton.onclick = function () {
    catchCurrentRegionPokemons(true);

    Notifier.notify({
      message: `Caught all current region pokemons`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  catchAllRegionShiniesButton.innerHTML = `Catch all region ✨`;
  catchAllRegionShiniesButton.style.position = "absolute";
  catchAllRegionShiniesButton.style.left = "10%";
  catchAllRegionShiniesButton.style.top = "79%";
  document.body.appendChild(catchAllRegionShiniesButton);

  //All pokemons
  let catchAllPokemonsButton = document.createElement("button");
  catchAllPokemonsButton.onclick = function () {
    catchAllPokemons()

    Notifier.notify({
      message: `Caught all pokemons`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  catchAllPokemonsButton.innerHTML = `Catch all <img src=\"https://www.pokeclicker.com/assets/images/pokeball/Pokeball.svg\" height=\"25\">`;
  catchAllPokemonsButton.style.position = "absolute";
  catchAllPokemonsButton.style.left = "2%";
  catchAllPokemonsButton.style.top = "83%";
  document.body.appendChild(catchAllPokemonsButton);

  let catchAllShiniesButton = document.createElement("button");
  catchAllShiniesButton.onclick = function () {
    catchAllPokemons(true)

    Notifier.notify({
      message: `Caught all shinies`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  catchAllShiniesButton.innerHTML = `Catch all ✨`;
  catchAllShiniesButton.style.position = "absolute";
  catchAllShiniesButton.style.left = "10%";
  catchAllShiniesButton.style.top = "83%";
  document.body.appendChild(catchAllShiniesButton);

  let dropAllPokemonsButton = document.createElement("button");
  dropAllPokemonsButton.onclick = function () {
    dropAllPokemons()

    Notifier.notify({
      message: `Dropped all your pokemons`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  dropAllPokemonsButton.innerHTML = `Drop all <img src=\"https://www.pokeclicker.com/assets/images/pokeball/Pokeball.svg\" height=\"25\">`;
  dropAllPokemonsButton.style.position = "absolute";
  dropAllPokemonsButton.style.left = "2%";
  dropAllPokemonsButton.style.top = "87%";
  document.body.appendChild(dropAllPokemonsButton);

  let dropAllShiniesButton = document.createElement("button");
  dropAllShiniesButton.onclick = function () {
    dropAllShinies()

    Notifier.notify({
      message: `Dropped all your shinies`,
      type: NotificationConstants.NotificationOption.success,
    });
  };

  dropAllShiniesButton.innerHTML = `Drop all ✨`;
  dropAllShiniesButton.style.position = "absolute";
  dropAllShiniesButton.style.left = "10%";
  dropAllShiniesButton.style.top = "87%";
  document.body.appendChild(dropAllShiniesButton);

}
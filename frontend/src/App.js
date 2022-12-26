import React , {useState, useEffect} from 'react';
import logo from './logo.svg';
import './css/App.css';
import * as util from './util/util'
import ErrorBoundary from './components/ErrorBoundary';
import Games from './components/Games';
import Table from './components/Table';
import axios, * as others from 'axios';


function App() {
  const [errorMessage,setErrorMessage] = useState(null);
  const [date, setDate] = useState(null);
  const [gamesList, setGamesList] = useState(null);
  const [internalTeams, setInternalTeams] = useState(null);
  // A map which contains information about the teams involved in the current games, indexed by their abbreviations
  const [gamesInfoMap, setGamesInfoMap] = useState(null);


  
  // On component mount, check date and then refresh list of games if it is outdated                    
  useEffect(() => {
    let today = new Date().toLocaleDateString("en-CA");
    let gameListUpdateDate = new Date(window.localStorage.getItem("date"));
    let todayActual = new Date(today);
    // If stored date does not match today, update it and fetch list of games for today and the internal representation of NHL teams 
    if (todayActual.getTime() != gameListUpdateDate.getTime()) {
      axios.all([axios.get('http://localhost:3300/games?date=' + today),axios.get('http://localhost:3300/internalTeams')]).then(
        axios.spread((gamesListResponse,internalTeamsResponse) => {
          setGamesList(gamesListResponse.data);
          setDate(String(today));
          setInternalTeams(internalTeamsResponse.data);
        })
      ).catch((err) => {
        setErrorMessage(err.response.data.errorMessage);
      })
    } else {
      setDate(window.localStorage.getItem("date"));
      setGamesList(JSON.parse(window.localStorage.getItem("gamesList")));
      setInternalTeams(JSON.parse(window.localStorage.getItem("internalTeams")));
      setGamesInfoMap(JSON.parse(window.localStorage.getItem("gamesInfoMap")));
      console.log(JSON.parse(window.localStorage.getItem("gamesInfoMap")));
    }
  },[]);

  // After date state changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('date', date);
  }, [date]);
  
  // After games list changes, store it to local storage and update the gamesInfoMap
  useEffect(() => {
    window.localStorage.setItem('gamesList', JSON.stringify(gamesList));
    let map = createGamesInfoMap();
    if (map) {
      setGamesInfoMap(map);
    }
  }, [gamesList]);

  // After internal team list changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('internalTeams', JSON.stringify(internalTeams)); 
  }, [internalTeams]);

  // After gamesInfoMap changes, store it to local storage
  useEffect(() => {
    window.localStorage.setItem('gamesInfoMap', JSON.stringify(gamesInfoMap)); 
  }, [gamesInfoMap]);

  
  function createGamesInfoMap(gamesList) {
    if (gamesList && gamesList.length != 0) {
      let map = {};
      for (let game of gamesList) {
        let awayTeam = game["teams"]["away"]["team"]["name"];
        let homeTeam = game["teams"]["home"]["team"]["name"];
        let awayTeamInfo = internalTeams[awayTeam];
        let homeTeamInfo = internalTeams[homeTeam];
        map[awayTeamInfo["abbreviation"]] = awayTeamInfo;
        map[homeTeamInfo["abbreviation"]] = homeTeamInfo;
      }
      return map;
    }
    return null;
    
  }

  function gamesTableOnClick() {
    console.log(internalTeams);
  }

  /**
   * On hover, change row color to match home team's primary color
   * @param {*} event 
   */
  function gamesOnMouseEnter(event) {
    let json = [
      {
        "gamePk": 2020020483,
        "link": "/api/v1/game/2020020483/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-20T22:30:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 26,
              "losses": 12,
              "ot": 6,
              "type": "league"
            },
            "score": 2,
            "team": {
              "id": 6,
              "name": "Boston Bruins",
              "link": "/api/v1/teams/6"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 12,
              "losses": 27,
              "ot": 7,
              "type": "league"
            },
            "score": 0,
            "team": {
              "id": 7,
              "name": "Buffalo Sabres",
              "link": "/api/v1/teams/7"
            }
          }
        },
        "venue": {
          "id": 5039,
          "name": "KeyBank Center",
          "link": "/api/v1/venues/5039"
        },
        "content": {
          "link": "/api/v1/game/2020020483/content"
        }
      },
      {
        "gamePk": 2020020166,
        "link": "/api/v1/game/2020020166/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-20T23:00:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 14,
              "losses": 25,
              "ot": 6,
              "type": "league"
            },
            "score": 6,
            "team": {
              "id": 1,
              "name": "New Jersey Devils",
              "link": "/api/v1/teams/1"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 29,
              "losses": 14,
              "ot": 3,
              "type": "league"
            },
            "score": 7,
            "team": {
              "id": 5,
              "name": "Pittsburgh Penguins",
              "link": "/api/v1/teams/5"
            }
          }
        },
        "venue": {
          "id": 5034,
          "name": "PPG Paints Arena",
          "link": "/api/v1/venues/5034"
        },
        "content": {
          "link": "/api/v1/game/2020020166/content"
        }
      },
      {
        "gamePk": 2020020717,
        "link": "/api/v1/game/2020020717/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-20T23:00:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 23,
              "losses": 17,
              "ot": 6,
              "type": "league"
            },
            "score": 1,
            "team": {
              "id": 3,
              "name": "New York Rangers",
              "link": "/api/v1/teams/3"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 29,
              "losses": 13,
              "ot": 4,
              "type": "league"
            },
            "score": 6,
            "team": {
              "id": 2,
              "name": "New York Islanders",
              "link": "/api/v1/teams/2"
            }
          }
        },
        "venue": {
          "name": "Nassau Veterans Memorial Coliseum",
          "link": "/api/v1/venues/null"
        },
        "content": {
          "link": "/api/v1/game/2020020717/content"
        }
      },
      {
        "gamePk": 2020020718,
        "link": "/api/v1/game/2020020718/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-20T23:00:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 30,
              "losses": 10,
              "ot": 5,
              "type": "league"
            },
            "score": 4,
            "team": {
              "id": 12,
              "name": "Carolina Hurricanes",
              "link": "/api/v1/teams/12"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 30,
              "losses": 14,
              "ot": 2,
              "type": "league"
            },
            "score": 1,
            "team": {
              "id": 14,
              "name": "Tampa Bay Lightning",
              "link": "/api/v1/teams/14"
            }
          }
        },
        "venue": {
          "id": 5017,
          "name": "Amalie Arena",
          "link": "/api/v1/venues/5017"
        },
        "content": {
          "link": "/api/v1/game/2020020718/content"
        }
      },
      {
        "gamePk": 2020020719,
        "link": "/api/v1/game/2020020719/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-20T23:00:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 15,
              "losses": 24,
              "ot": 9,
              "type": "league"
            },
            "score": 1,
            "team": {
              "id": 29,
              "name": "Columbus Blue Jackets",
              "link": "/api/v1/teams/29"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 30,
              "losses": 12,
              "ot": 5,
              "type": "league"
            },
            "score": 5,
            "team": {
              "id": 13,
              "name": "Florida Panthers",
              "link": "/api/v1/teams/13"
            }
          }
        },
        "venue": {
          "name": "BB&T Center",
          "link": "/api/v1/venues/null"
        },
        "content": {
          "link": "/api/v1/game/2020020719/content"
        }
      },
      {
        "gamePk": 2020020722,
        "link": "/api/v1/game/2020020722/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-21T00:30:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 16,
              "losses": 25,
              "ot": 7,
              "type": "league"
            },
            "score": 2,
            "team": {
              "id": 17,
              "name": "Detroit Red Wings",
              "link": "/api/v1/teams/17"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 19,
              "losses": 14,
              "ot": 12,
              "type": "league"
            },
            "score": 5,
            "team": {
              "id": 25,
              "name": "Dallas Stars",
              "link": "/api/v1/teams/25"
            }
          }
        },
        "venue": {
          "id": 5019,
          "name": "American Airlines Center",
          "link": "/api/v1/venues/5019"
        },
        "content": {
          "link": "/api/v1/game/2020020722/content"
        }
      },
      {
        "gamePk": 2020020710,
        "link": "/api/v1/game/2020020710/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-21T01:00:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 28,
              "losses": 13,
              "ot": 5,
              "type": "league"
            },
            "score": 3,
            "team": {
              "id": 10,
              "name": "Toronto Maple Leafs",
              "link": "/api/v1/teams/10"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 18,
              "losses": 18,
              "ot": 3,
              "type": "league"
            },
            "score": 6,
            "team": {
              "id": 23,
              "name": "Vancouver Canucks",
              "link": "/api/v1/teams/23"
            }
          }
        },
        "venue": {
          "id": 5073,
          "name": "Rogers Arena",
          "link": "/api/v1/venues/5073"
        },
        "content": {
          "link": "/api/v1/game/2020020710/content"
        }
      },
      {
        "gamePk": 2020020724,
        "link": "/api/v1/game/2020020724/feed/live",
        "gameType": "R",
        "season": "20202021",
        "gameDate": "2021-04-21T02:00:00Z",
        "status": {
          "abstractGameState": "Final",
          "codedGameState": "7",
          "detailedState": "Final",
          "statusCode": "7",
          "startTimeTBD": false
        },
        "teams": {
          "away": {
            "leagueRecord": {
              "wins": 14,
              "losses": 26,
              "ot": 7,
              "type": "league"
            },
            "score": 1,
            "team": {
              "id": 24,
              "name": "Anaheim Ducks",
              "link": "/api/v1/teams/24"
            }
          },
          "home": {
            "leagueRecord": {
              "wins": 17,
              "losses": 20,
              "ot": 6,
              "type": "league"
            },
            "score": 4,
            "team": {
              "id": 26,
              "name": "Los Angeles Kings",
              "link": "/api/v1/teams/26"
            }
          }
        },
        "venue": {
          "id": 5081,
          "name": "STAPLES Center",
          "link": "/api/v1/venues/5081"
        },
        "content": {
          "link": "/api/v1/game/2020020724/content"
        }
      }
    ];
    let map = createGamesInfoMap(json);
    let rowElements = event.currentTarget.children;
    let abbr = "";
    for (let rowEl of rowElements) {
      if (rowEl.className.search("homeTeamAbbr") != -1) {
        abbr = rowEl.textContent;
        break;
      }
    }
    event.currentTarget.style.backgroundColor = map[abbr]["color"];
  }

  /**
   * On exit hover, change row color to default NHL gray
   * @param {*} event 
   */
  function gamesOnMouseLeave(event) {
    event.currentTarget.style.backgroundColor = internalTeams["NHL"]["color"];
  }

  return (
    <div className="App">
      <ErrorBoundary>
        {/* <Games gamesData={gamesList} date={date} internalTeams={internalTeams}></Games> */}
        <Games gamesData={[
  {
    "gamePk": 2020020483,
    "link": "/api/v1/game/2020020483/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-20T22:30:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 26,
          "losses": 12,
          "ot": 6,
          "type": "league"
        },
        "score": 2,
        "team": {
          "id": 6,
          "name": "Boston Bruins",
          "link": "/api/v1/teams/6"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 12,
          "losses": 27,
          "ot": 7,
          "type": "league"
        },
        "score": 0,
        "team": {
          "id": 7,
          "name": "Buffalo Sabres",
          "link": "/api/v1/teams/7"
        }
      }
    },
    "venue": {
      "id": 5039,
      "name": "KeyBank Center",
      "link": "/api/v1/venues/5039"
    },
    "content": {
      "link": "/api/v1/game/2020020483/content"
    }
  },
  {
    "gamePk": 2020020166,
    "link": "/api/v1/game/2020020166/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-20T23:00:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 14,
          "losses": 25,
          "ot": 6,
          "type": "league"
        },
        "score": 6,
        "team": {
          "id": 1,
          "name": "New Jersey Devils",
          "link": "/api/v1/teams/1"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 29,
          "losses": 14,
          "ot": 3,
          "type": "league"
        },
        "score": 7,
        "team": {
          "id": 5,
          "name": "Pittsburgh Penguins",
          "link": "/api/v1/teams/5"
        }
      }
    },
    "venue": {
      "id": 5034,
      "name": "PPG Paints Arena",
      "link": "/api/v1/venues/5034"
    },
    "content": {
      "link": "/api/v1/game/2020020166/content"
    }
  },
  {
    "gamePk": 2020020717,
    "link": "/api/v1/game/2020020717/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-20T23:00:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 23,
          "losses": 17,
          "ot": 6,
          "type": "league"
        },
        "score": 1,
        "team": {
          "id": 3,
          "name": "New York Rangers",
          "link": "/api/v1/teams/3"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 29,
          "losses": 13,
          "ot": 4,
          "type": "league"
        },
        "score": 6,
        "team": {
          "id": 2,
          "name": "New York Islanders",
          "link": "/api/v1/teams/2"
        }
      }
    },
    "venue": {
      "name": "Nassau Veterans Memorial Coliseum",
      "link": "/api/v1/venues/null"
    },
    "content": {
      "link": "/api/v1/game/2020020717/content"
    }
  },
  {
    "gamePk": 2020020718,
    "link": "/api/v1/game/2020020718/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-20T23:00:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 30,
          "losses": 10,
          "ot": 5,
          "type": "league"
        },
        "score": 4,
        "team": {
          "id": 12,
          "name": "Carolina Hurricanes",
          "link": "/api/v1/teams/12"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 30,
          "losses": 14,
          "ot": 2,
          "type": "league"
        },
        "score": 1,
        "team": {
          "id": 14,
          "name": "Tampa Bay Lightning",
          "link": "/api/v1/teams/14"
        }
      }
    },
    "venue": {
      "id": 5017,
      "name": "Amalie Arena",
      "link": "/api/v1/venues/5017"
    },
    "content": {
      "link": "/api/v1/game/2020020718/content"
    }
  },
  {
    "gamePk": 2020020719,
    "link": "/api/v1/game/2020020719/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-20T23:00:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 15,
          "losses": 24,
          "ot": 9,
          "type": "league"
        },
        "score": 1,
        "team": {
          "id": 29,
          "name": "Columbus Blue Jackets",
          "link": "/api/v1/teams/29"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 30,
          "losses": 12,
          "ot": 5,
          "type": "league"
        },
        "score": 5,
        "team": {
          "id": 13,
          "name": "Florida Panthers",
          "link": "/api/v1/teams/13"
        }
      }
    },
    "venue": {
      "name": "BB&T Center",
      "link": "/api/v1/venues/null"
    },
    "content": {
      "link": "/api/v1/game/2020020719/content"
    }
  },
  {
    "gamePk": 2020020722,
    "link": "/api/v1/game/2020020722/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-21T00:30:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 16,
          "losses": 25,
          "ot": 7,
          "type": "league"
        },
        "score": 2,
        "team": {
          "id": 17,
          "name": "Detroit Red Wings",
          "link": "/api/v1/teams/17"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 19,
          "losses": 14,
          "ot": 12,
          "type": "league"
        },
        "score": 5,
        "team": {
          "id": 25,
          "name": "Dallas Stars",
          "link": "/api/v1/teams/25"
        }
      }
    },
    "venue": {
      "id": 5019,
      "name": "American Airlines Center",
      "link": "/api/v1/venues/5019"
    },
    "content": {
      "link": "/api/v1/game/2020020722/content"
    }
  },
  {
    "gamePk": 2020020710,
    "link": "/api/v1/game/2020020710/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-21T01:00:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 28,
          "losses": 13,
          "ot": 5,
          "type": "league"
        },
        "score": 3,
        "team": {
          "id": 10,
          "name": "Toronto Maple Leafs",
          "link": "/api/v1/teams/10"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 18,
          "losses": 18,
          "ot": 3,
          "type": "league"
        },
        "score": 6,
        "team": {
          "id": 23,
          "name": "Vancouver Canucks",
          "link": "/api/v1/teams/23"
        }
      }
    },
    "venue": {
      "id": 5073,
      "name": "Rogers Arena",
      "link": "/api/v1/venues/5073"
    },
    "content": {
      "link": "/api/v1/game/2020020710/content"
    }
  },
  {
    "gamePk": 2020020724,
    "link": "/api/v1/game/2020020724/feed/live",
    "gameType": "R",
    "season": "20202021",
    "gameDate": "2021-04-21T02:00:00Z",
    "status": {
      "abstractGameState": "Final",
      "codedGameState": "7",
      "detailedState": "Final",
      "statusCode": "7",
      "startTimeTBD": false
    },
    "teams": {
      "away": {
        "leagueRecord": {
          "wins": 14,
          "losses": 26,
          "ot": 7,
          "type": "league"
        },
        "score": 1,
        "team": {
          "id": 24,
          "name": "Anaheim Ducks",
          "link": "/api/v1/teams/24"
        }
      },
      "home": {
        "leagueRecord": {
          "wins": 17,
          "losses": 20,
          "ot": 6,
          "type": "league"
        },
        "score": 4,
        "team": {
          "id": 26,
          "name": "Los Angeles Kings",
          "link": "/api/v1/teams/26"
        }
      }
    },
    "venue": {
      "id": 5081,
      "name": "STAPLES Center",
      "link": "/api/v1/venues/5081"
    },
    "content": {
      "link": "/api/v1/game/2020020724/content"
    }
  }
]
} internalTeams={internalTeams} date={date} onClickHandler={gamesTableOnClick} onHoverHandler={[gamesOnMouseEnter, gamesOnMouseLeave]}></Games>
      </ErrorBoundary>
    </div>
  );
}

export default App;

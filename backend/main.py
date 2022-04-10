import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from trueskill import TrueSkill, rate

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://elo.mx-e.net",
    "http://elo.mx-e.net",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    name: str
    games: dict
    players: dict

@app.post("/compute-ranking")
async def compute_api(item: Item):
    print("Ranking Group " + item.name)
    ranking = compute_ranking(item.games, item.players)
    return ranking





def updateRating(player_rating, new_rating, timestamp):
    player_rating[timestamp] = {"mu": new_rating.mu, "sigma": new_rating.sigma}
    player_rating['_current'] = new_rating

def get_not_participating(players, winners, losers):
    not_participating=[]
    for key, value in players.items():
        if key not in winners and key not in losers:
            not_participating.append(key)
    return not_participating

def compute_ranking(games, players):
    player_ratings = {}
    env = TrueSkill()

    for key, val in players.items():
        newRating = env.create_rating()
        player_ratings[key] = {
            "0000":{"mu":newRating.mu, "sigma":newRating.sigma}, 
            "_current":newRating
            }

    for key, val in games.items():
        timestamp = val["timestamp"]
        winners = list(val["winners"].keys())
        losers = list(val["losers"].keys())
        not_participating = get_not_participating(players, winners, losers)

        t1 = [player_ratings[key]['_current'] for key in winners]
        t2 = [player_ratings[key]['_current'] for key in losers]
        new_t1, new_t2 = rate([t1, t2], ranks=[0, 1])
        for i, key in enumerate(winners):
            updateRating(player_ratings[key], new_t1[i], timestamp)
        for i, key in enumerate(losers):
            updateRating(player_ratings[key], new_t2[i], timestamp)
        for i, key in enumerate(not_participating):
            updateRating(player_ratings[key], player_ratings[key]['_current'], timestamp)
    
    for ratings in player_ratings.values():
        ratings.pop('_current', None)
    
    print("...Done!")
    return json.dumps(player_ratings)



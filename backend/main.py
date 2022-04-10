import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from compute_ranking import compute_ranking
from pydantic import BaseModel

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


if __name__ == "__main__":
    uvicorn.run(app, debug=True)
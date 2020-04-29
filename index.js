//deps
const { Control } = require('magic-home');
const { CustomMode } = require('magic-home');
const request = require('request');

//constants
const controllerEndpoint = '192.168.0.27';
const gameClientEndpointPosRect = "http://localhost:21337/positional-rectangles";
const gameClientEndpointGameResult = "http://localhost:21337/game-result";
const pollingFrequency = 1500;
const red = {red: 255, green: 0, blue: 0};
const green = {red: 0, green: 255, blue: 0};
const blue = {red: 0, green: 0, blue: 255};
const InProgress = 'InProgress';
const Menus = 'Menus';

//globals
let latestGameState;
let LightGameStateMap = new Map();
let skipColorSwitch = 0;

//main
SetupLightGameStateMap();
RetrieveGameState();

function RetrieveGameState() {
    request(gameClientEndpointPosRect, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        let currentGameState = body.GameState;
        console.log(currentGameState);
        if (currentGameState != latestGameState) {
            /*if(currentGameState == Menus && latestGameState == InProgress){
                //check last game and make effect
                request(gameClientEndpointGameResult, {json: true}, (err, res, body) => {
                    SetLightEffect(body.LocalPlayerWon);
                    skipColorSwitch = 4;
                });
            }
            if(skipColorSwitch > 0){
                skipColorSwitch --;
            }
            else*/ {
                latestGameState = currentGameState;
                SwitchLight(currentGameState);
            }
            
        }
    });

    setTimeout(RetrieveGameState, pollingFrequency);
}

function SwitchLight(gameState){
    let color = LightGameStateMap.get(gameState);
    let light = new Control(controllerEndpoint);

    //turn on if not lit
    light.queryState().then(response => {
        SetColor(color, response.on, light);
    });
    
}

//not yet to be used
function SetLightEffect(won){
    let light = new Control(controllerEndpoint, {ack: Control.ackMask(0)});

    if(!won){
    light.setPattern('seven_color_cross_fade', 75);
    }
}

function SetupLightGameStateMap() {
    LightGameStateMap.set(Menus, green);
    LightGameStateMap.set(InProgress, blue);
    LightGameStateMap.set('null', green);
}

function SetColor(color, turnOnNeeded = false, light){

    if(turnOnNeeded){
        light.turnOn(true);
    }
    
    light.setColorWithBrightness(color.red, color.green, color.blue, 10);
}

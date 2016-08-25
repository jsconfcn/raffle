# Raffle Program For JSConf China


## Algorithm

Use a weight probability algorithm to calculate probability for each people. And it will follow the rule:
![image](https://cloud.githubusercontent.com/assets/914595/17977184/349b3868-6b23-11e6-9320-d2d9f906d518.png)

## UI

We use [https://github.com/yaronn/blessed-contrib](https://github.com/yaronn/blessed-contrib) build a simple CLI UI application 
![image](https://cloud.githubusercontent.com/assets/914595/17977176/2c1b79dc-6b23-11e6-84af-d307c79bf15e.png)

## How to use

`git clone git@github.com:jsconfcn/raffle.git`

`npm i `

`node raffle.js` or `node raffle.js 1000` 

default range from [0 ~ 800]

## Requirements

* A CLI program.
* Writen in one of JavaScript/TypeScript/CoffeeScript/Elm/ClojureScript.
* Grow the chance for ppl who didn't win anything.

## License
MIT
